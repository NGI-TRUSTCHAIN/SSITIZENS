import copy
import json
from datetime import datetime
from uuid import uuid4

import requests
from asgiref.sync import async_to_sync
from channels.generic.http import AsyncHttpConsumer
from channels.layers import get_channel_layer
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.http import HttpResponse, HttpResponseNotFound
from django.template.loader import get_template
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from project import settings
from rest_framework import filters
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import action, api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet, ViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication
from ssitizens.enums import Types, VerificationFlows
from ssitizens.filters import ProfileSearchFilter, TransactionSearchFilter
from ssitizens.functions import access_time_session_id, check_address
from ssitizens.models import (
    IssuedVerifiableCredential,
    PreCodes,
    Profile,
    Transaction,
    UserIdentification,
)
from ssitizens.pagination import CustomPagination
from ssitizens.serializers import (
    BalanceSerializer,
    BeneficiaryDataSerializer,
    DistributeTokensRPC,
    ForceRedemptionRPC,
    GenerateTokensRPC,
    PostSaveCredentialData,
    ProfileSerializer,
    QrSerializer,
    RPCResponseSerializer,
    StoreDataSerializer,
    TransactionSerializer,
    VerificationSerializer,
    VPData,
)
from ssitizens.services.balance import BalanceService
from ssitizens.services.rpc.rpc import RPCMethodsService
from ssitizens.services.vc_data.functions import get_data_provider
from weasyprint import HTML


def check_session_id(id: str):
    result = False
    user_id = UserIdentification.objects.filter(session_id=id).first()
    if user_id is None:
        result = False
    elif user_id.user is not None and (
        user_id.expiration is None
        or (datetime.timestamp(user_id.expiration) > datetime.timestamp(datetime.now()))
    ):
        result = True
    return result


class CustomDjangoModelPermission(DjangoModelPermissions):
    def __init__(self):
        self.perms_map = copy.deepcopy(self.perms_map)
        self.perms_map["GET"] = ["%(app_label)s.view_%(model_name)s"]


# Create your views here.
class ProfileView(ModelViewSet):
    model_class = Profile
    pagination_class = CustomPagination
    serializer_class = ProfileSerializer

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        JWTAuthentication,
    ]

    parser_classes = [JSONParser, FormParser, MultiPartParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ProfileSearchFilter
    search_fields = [
        "email",
        "address",
        "data__dni",
        "data__cif",
        "data__store_id",
    ]

    def get_queryset(self):
        session_id = self.request.headers.get("Authorization")
        if self.request.user.is_superuser:
            return Profile.objects.all()
        elif check_session_id(session_id):
            user = UserIdentification.objects.filter(session_id=session_id)
            return Profile.objects.filter(id=user.first().user.id)
        else:
            raise PermissionDenied({"detail": "Invalid credentials."})

    def create(self, request, *args, **kwargs):
        serializer_profile = ProfileSerializer(data=request.data)
        serializer_profile.is_valid(raise_exception=True)
        if serializer_profile.data["type"] == Types.beneficiary.value:
            serializer_data = BeneficiaryDataSerializer(
                data=serializer_profile.data["data"]
            )
            if serializer_data.is_valid(raise_exception=True) is False:
                return HttpResponse("Invalid data for Beneficiaries", status=400)
        elif serializer_profile.data["type"] == Types.store.value:
            serializer_data = StoreDataSerializer(data=serializer_profile.data["data"])

            if serializer_data.is_valid(raise_exception=True) is False:
                return HttpResponse("Invalid data for Stores", status=400)
        else:
            return HttpResponse("Invalid type", status=400)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        profile = Profile.objects.get(id=kwargs["pk"])
        serializer_profile = ProfileSerializer(data=request.data)

        serializer_profile.is_valid()
        requested_data_changes = serializer_profile.data
        if profile.type == Types.beneficiary.value:
            user = Profile.objects.filter(
                data__dni=requested_data_changes.get("data").get("dni")
            )
            if len(user) > 0 and user.filter(id__contains=profile.id).count() == 0:
                return HttpResponse(_("That DNI is already in use"), status=400)

        elif profile.type == Types.store.value:
            user = Profile.objects.filter(
                data__cif=requested_data_changes.get("data").get("cif")
            )

            if len(user) > 0 and (user.filter(id__contains=profile.id).count() == 0):
                return HttpResponse(_("That CIF is already in use"), status=400)

        else:
            return HttpResponse("Invalid type", status=400)

        return super().update(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        check_balance = BalanceService.total_balance(instance.address)
        instance.balance_ethers = check_balance.get("content").get("ethers")
        instance.balance_tokens = check_balance.get("content").get("tokens")
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        paginator = CustomPagination()

        for profile in queryset:
            check_balance = BalanceService.total_balance(profile.address)
            profile.balance_ethers = check_balance.get("content").get("ethers")
            profile.balance_tokens = check_balance.get("content").get("tokens")
            profile.save()

        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)


# Create your views here.
class TransactionView(ReadOnlyModelViewSet):
    model_class = Transaction
    pagination_class = CustomPagination
    serializer_class = TransactionSerializer

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        JWTAuthentication,
    ]

    parser_classes = [JSONParser, FormParser, MultiPartParser]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    ordering_fields = [
        "timestamp",
        "event",
        "from_user",
        "to_user",
        "amount_tokens",
        "amount_ethers",
    ]
    filterset_class = TransactionSearchFilter
    search_fields = [
        "from_user__id",
        "to__id",
    ]

    def get_queryset(self):
        session_id = self.request.headers.get("Authorization")
        if self.request.user.is_superuser:
            return Transaction.objects.all()
        elif check_session_id(session_id):
            user = UserIdentification.objects.filter(session_id=session_id)
            return Transaction.objects.filter(
                from_user=user.first().user
            ) and Transaction.objects.filter(to=user.first().user)
        else:
            raise PermissionDenied({"detail": "Invalid credentials."})


class SSEConsumer(AsyncHttpConsumer):
    async def handle(self, body):
        session_id = self.scope["url_route"]["kwargs"]["identifier"]

        await self.send_headers(
            headers=[
                (b"Content-Type", b"text/event-stream"),
                (b"Cache-Control", b"no-cache"),
                (b"Connection", b"keep-alive"),
                (b"Transfer-Encoding", b"chunked"),
                (b"Access-Control-Allow-Origin", b"*"),
                (b"Access-Control-Allow-Methods", b"GET, OPTIONS"),
                (b"Access-Control-Allow-Headers", b"Content-Type"),
                (b"Access-Control-Allow-Credentials", b"true"),
            ]
        )

        self.channel_layer = get_channel_layer()
        self.group_name = session_id
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send_body(b"", more_body=True)

    async def http_request(self, message):
        if "body" in message:
            self.body.append(message["body"])
            if not message.get("more_body"):
                try:
                    await self.handle(b"".join(self.body))
                finally:
                    pass

    async def send_event(self, content):
        await self.send_body(
            (f"event: did_received\ndata: {content.get('message')}\n\n").encode(
                "utf-8"
            ),
            more_body=False,
        )

    async def disconnect(self):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)


class SSIView(ViewSet):
    permission_classes = (AllowAny,)
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    @swagger_auto_schema(
        method="get",
        manual_parameters=[
            openapi.Parameter(
                "session_id",
                openapi.IN_QUERY,
                description="Session ID",
                type=openapi.TYPE_STRING,
            ),
        ],
        operation_description="GET QR for Beneficiary Identity",
        responses={200: openapi.Response("", QrSerializer)},
    )
    @action(
        detail=False, methods=["get"], url_path="presentation-beneficiary-identity/qr"
    )
    def get_vp_for_identity(self, request):
        url = f"{settings.ENT_WALLET_BACK_URL}"
        url_path = "presentation-offer-request/qr"
        session_id = request.GET.get("session_id")
        if session_id is None or check_session_id(session_id):
            return HttpResponse(
                "Invalid Session ID",
                status=401,  # TODO: Check later
                content_type="text/plain",
            )
        state = uuid4()
        UserIdentification(session_id=session_id, state=state).save()
        parameters = {
            "verify_flow": VerificationFlows.BeneficiaryIdentity.value,
            "state": state,
        }
        response = requests.request("GET", f"{url}/{url_path}", params=parameters)
        return HttpResponse(
            response,
            status=response.status_code,
            content_type=response.headers.get("content-type"),
        )

    # Front Endpoint
    @swagger_auto_schema(
        method="get",
        manual_parameters=[
            openapi.Parameter(
                "session_id",
                openapi.IN_QUERY,
                description="Session ID",
                type=openapi.TYPE_STRING,
            ),
        ],
        operation_description="GET Verifiable Presentation QR",
        responses={200: openapi.Response("", QrSerializer)},
    )
    @action(detail=False, methods=["get"], url_path="presentation-store-identity/qr")
    def get_vp_store_qr(self, request):
        session_id = request.GET.get("session_id")
        if session_id is None or check_session_id(session_id):
            return HttpResponse(
                "Invalid Session ID",
                status=401,
                content_type="text/plain",
            )
        state = uuid4()
        UserIdentification(session_id=session_id, state=state).save()
        url = f"{settings.ENT_WALLET_BACK_URL}"
        url_path = "presentation-offer-request/qr"
        parameters = {
            "verify_flow": VerificationFlows.StoreIdentity.value,
            "state": state,
        }
        response = requests.request("GET", f"{url}/{url_path}", params=parameters)

        return HttpResponse(
            response,
            status=response.status_code,
            content_type=response.headers.get("content-type"),
        )

    # Integration Endpoint
    @swagger_auto_schema(
        method="post",
        request_body=VPData,
        operation_description="Verify Verifiable Presentation Data",
        responses={200: openapi.Response("", VerificationSerializer)},
    )
    @action(detail=False, methods=["post"], url_path="presentations/external-data")
    def vp_data_validation(self, request):
        verified = False
        data: VPData = request.data
        holder = data.get("holderDid")
        claims_data = data.get("claimsData")
        state = data.get("state")
        user_id = UserIdentification.objects.filter(state=state).first()

        # VP Token
        if data.get("valid"):
            json_vp_data = claims_data.get("login-with-vc")
            vc_type = json_vp_data.get("vcType")
            if "StoreIdentificationVC" in vc_type:
                cif = json_vp_data.get("cif")
                store_id = json_vp_data.get("store_id")
                store = Profile.objects.filter(
                    data__cif=cif, data__store_id=store_id
                ).first()
                if store:
                    check_address(holder, store)
                    access_time_session_id(store, user_id)
                    verified = True
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        user_id.session_id,
                        {"type": "send_event", "message": user_id.session_id},
                    )
            elif "CredentialBiometrica" in vc_type:
                dni = json_vp_data.get("dni")
                beneficiary = Profile.objects.filter(data__dni=dni).first()
                if beneficiary:
                    check_address(holder, beneficiary)
                    access_time_session_id(beneficiary, user_id)
                    verified = True
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        user_id.session_id,
                        {"type": "send_event", "message": user_id.session_id},
                    )
            else:
                return Response(
                    {"verified": verified},
                    status=404,
                )

        return Response(
            {"verified": verified},
            status=200,
        )

    # Integration Endpoint
    @swagger_auto_schema(
        method="get",
        manual_parameters=[
            openapi.Parameter(
                "vc_type",
                openapi.IN_QUERY,
                description="VC Type",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="The user ID, usually a DID",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "pin",
                openapi.IN_QUERY,
                description="A PIN of a PreAuthz flow",
                type=openapi.TYPE_STRING,
                required=False,
            ),
        ],
        operation_description="Get Credential Data",
        responses={200: openapi.Response("")},
    )
    @swagger_auto_schema(
        method="post",
        request_body=PostSaveCredentialData,
        operation_description="Post Credential Data",
        responses={
            200: openapi.Response(
                "",
            )
        },
    )
    @action(detail=False, methods=["get", "post"], url_path="credentials/external-data")
    def credential_data(self, request):
        if request.method == "GET":
            user_id = request.GET.get("user_id")
            provider_result = get_data_provider(request.GET.get("vc_type"))
            if provider_result.is_error():
                return HttpResponse(
                    str(provider_result.unwrap_error()),
                    status=400,
                    content_type="text/plain",
                )
            provider = provider_result.unwrap()

            try:
                code = PreCodes.objects.filter(pre_code=user_id).first()
            except Exception:
                # Invalid access-token
                return HttpResponse(
                    str("Invalid Pre Authz Code"),
                    status=404,
                    content_type="text/plain",
                )

            if not code.user:
                return HttpResponse(
                    str("User data not found"),
                    status=404,
                    content_type="text/plain",
                )
            credential_data = provider.generate_data(code.user)
            if credential_data.is_error():
                return HttpResponse(
                    str(credential_data.unwrap_error()),
                    status=404,
                    content_type="text/plain",
                )

            return HttpResponse(
                json.dumps(credential_data.unwrap()),
                status=200,
                content_type="application/json",
            )

        elif request.method == "POST":
            vc_data = IssuedVerifiableCredential(
                status=False,
                vc_id=request.data["vc_id"],
                vc_type=request.data["vc_type"],
                did=request.data["did"],
                issuance_date=request.data["issuance_date"],
            )
            vc_data.save()
            return HttpResponse(
                status=200,
                content_type="application/json",
            )
        else:
            return HttpResponse(
                status=405,
                content_type="application/json",
            )

    def _check_credential_request(self, request):
        session_id = request.GET.get("session_id")
        if session_id is None or not check_session_id(session_id):
            return {
                "error": HttpResponse(
                    "Invalid Session ID",
                    status=401,  # TODO: Check later
                    content_type="text/plain",
                ),
                "pre_code": None,
                "entity_url": None,
            }
        vc_type = request.GET.get("vc_type")
        if not vc_type:
            return {
                "error": HttpResponse(
                    "Invalid Credential Type",
                    status=400,
                    content_type="text/plain",
                ),
                "pre_code": None,
                "entity_url": None,
            }
        pre_code = None
        entity_url = None
        pre_code = uuid4()
        # Or store the ttl in the model
        user_id = UserIdentification.objects.filter(session_id=session_id).first()
        PreCodes(pre_code=pre_code, user=user_id.user).save()
        entity_url = settings.ENT_WALLET_BACK_URL

        return {
            "error": None,
            "entity_url": entity_url,
            "pre_code": pre_code,
        }

    # Front Endpoint
    @swagger_auto_schema(
        method="get",
        operation_description="GET Credential Offer Deep Link",
        manual_parameters=[
            openapi.Parameter(
                "vc_type",
                openapi.IN_QUERY,
                description="VC Type",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "session_id",
                openapi.IN_QUERY,
                description="Session ID",
                type=openapi.TYPE_STRING,
            ),
        ],
        responses={200: openapi.Response("", QrSerializer)},
    )
    @action(detail=False, methods=["get"], url_path="credential-offer/url")
    def get_vc_deep_link(self, request):
        check_result = self._check_credential_request(request)
        if check_result["error"]:
            return check_result["error"]

        url = check_result["entity_url"]

        url_path = "credential-offer/url"
        url = f"{url}/{url_path}"
        if check_result["pre_code"]:
            url = f"{url}?pre-authorized_code={check_result['pre_code']}"
        response = requests.request("GET", url, allow_redirects=False)

        return HttpResponse(
            response,
            status=response.status_code,
            headers={"Location": response.headers.get("Location")},
            content_type=response.headers.get("content-type"),
        )

    # Front Endpoint
    @swagger_auto_schema(
        method="get",
        operation_description="GET Credential Offer QR",
        manual_parameters=[
            openapi.Parameter(
                "vc_type",
                openapi.IN_QUERY,
                description="VC Type",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "session_id",
                openapi.IN_QUERY,
                description="Session ID",
                type=openapi.TYPE_STRING,
            ),
        ],
        responses={200: openapi.Response("", QrSerializer)},
    )
    @action(detail=False, methods=["get"], url_path="credential-offer/qr")
    def get_vc_qr(self, request):
        check_result = self._check_credential_request(request)
        if check_result["error"]:
            return check_result["error"]
        url = check_result["entity_url"]
        url_path = "credential-offer/qr"
        url = f"{url}/{url_path}"
        if check_result["pre_code"]:
            url = f"{url}?pre-authorized_code={check_result['pre_code']}"
        response = requests.request("GET", url)

        return HttpResponse(response, content_type="image/png")


class TokenizationAPI(ViewSet):
    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        JWTAuthentication,
    ]

    def get_queryset(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied({"detail": "Invalid credentials."})

    @swagger_auto_schema(
        method="post",
        manual_parameters=[],
        request_body=GenerateTokensRPC,
        operation_description="POST Generate tokens",
        responses={200: openapi.Response("", RPCResponseSerializer)},
    )
    @action(detail=False, methods=["post"], url_path="generate")
    def generate_tokens(self, request):
        request_data = request.data
        rpc = RPCMethodsService().generate_tokens(
            request_data.get("quantity"), request_data.get("additional_data")
        )

        return Response(
            rpc.get("content"),
            status=rpc.get("status_code"),
        )

    @swagger_auto_schema(
        method="post",
        manual_parameters=[],
        request_body=DistributeTokensRPC,
        operation_description="POST Distribute",
        responses={200: openapi.Response("", RPCResponseSerializer)},
    )
    @action(detail=False, methods=["post"], url_path="distribute")
    def distribute_tokens(self, request):
        request_data = request.data
        profile = Profile.objects.filter(id=request_data.get("profile_id")).first()
        if not profile:
            return HttpResponse(
                str("Invalid Profile id"),
                status=404,
                content_type="text/plain",
            )
        rpc = RPCMethodsService().distribute_tokens(
            profile, request_data.get("quantity"), request_data.get("additional_data")
        )

        return Response(
            rpc.get("content"),
            status=rpc.get("status_code"),
        )

    @swagger_auto_schema(
        method="post",
        manual_parameters=[],
        request_body=ForceRedemptionRPC,
        operation_description="POST Force Redeem",
        responses={200: openapi.Response("", RPCResponseSerializer)},
    )
    @action(detail=False, methods=["post"], url_path="force_redemption")
    def force_token_redemption(self, request):
        request_data = request.data
        profile = Profile.objects.filter(id=request_data.get("profile_id")).first()
        if not profile:
            return HttpResponse(
                str("Invalid Profile id"),
                status=404,
                content_type="text/plain",
            )
        quantity = BalanceService.total_balance(profile.address)

        rpc = RPCMethodsService().force_token_redemption(
            profile,
            quantity["content"].get("tokens"),
            request_data.get("additional_data"),
            request_data.get("operator_data"),
        )

        return Response(
            rpc.get("content"),
            status=rpc.get("status_code"),
        )


class AdministratorView(ViewSet):
    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        JWTAuthentication,
    ]

    def get_queryset(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied({"detail": "Invalid credentials."})

    @swagger_auto_schema(
        method="get",
        manual_parameters=[
            openapi.Parameter(
                "user",
                openapi.IN_QUERY,
                description="User identifier",
                type=openapi.TYPE_STRING,
                required=False,
            ),
            openapi.Parameter(
                "since",
                openapi.IN_QUERY,
                description="Since",
                type=openapi.FORMAT_DATE,
                required=False,
            ),
            openapi.Parameter(
                "until",
                openapi.IN_QUERY,
                description="Until",
                type=openapi.FORMAT_DATE,
                required=False,
            ),
        ],
        operation_description="Get Transactions Report",
        responses={200: openapi.Response("", RPCResponseSerializer)},
    )
    @action(detail=False, methods=["get"], url_path="generate_pdf")
    def generar_pdf(self, request):
        user = request.GET.get("user", None)
        since = request.GET.get("since", datetime(2025, 1, 1))
        until = request.GET.get("until", datetime.now())
        profile = Profile.objects.filter(id=user).first()
        if profile is None:
            return HttpResponseNotFound(_("There is not an user with that ID"))
        transactions = Transaction.objects.filter(
            Q(from_user__id__icontains=user) | Q(to__id__icontains=user),
            timestamp__gte=since,
            timestamp__lte=until,
        )
        template_path = "transactions_report.html"

        if profile.type == Types.beneficiary.value:
            aid_type = _("Aid Type")
            profile = {
                "name": profile.data.get("name"),
                "id": profile.data.get("dni"),
                "address": profile.address,
                "email": profile.email,
                "type": profile.type,
                "information": f"{aid_type}: {profile.aid_type.name}",
            }

        else:
            profile = {
                "name": profile.data.get("store_id"),
                "id": profile.data.get("cif"),
                "address": profile.address,
                "email": profile.email,
                "type": profile.type,
            }
        context = {
            "profile_text": {
                "name": _("Name"),
                "id": _("ID"),
                "address": _("Address"),
                "email": _("Email"),
                "type": _("User Type"),
                "information": _("More Information"),
            },
            "profile": profile,
            "transaction_text": {
                "date_time": _("Date-Time"),
                "event": _("Event"),
                "from": _("From"),
                "to": _("To"),
                "hash": _("Hash"),
                "tokens": _("Tokens"),
                "ethers": _("Ethers"),
                "ticket": _("Ticket"),
                "ticket_elements": _("Ticket Elements"),
                "total_aid": _("Total Aid"),
                "total_payment": _("Total Payment"),
                "product": _("Product"),
                "price": _("Price"),
            },
            "transactions": transactions,
            "administrator": _("Administrator"),
        }

        template = get_template(template_path)
        html_template = template.render(context)

        html = HTML(string=html_template)
        pdf = html.write_pdf()

        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="report.pdf"'
        return response

    @swagger_auto_schema(
        method="get",
        operation_description="Get Contract Balance",
        responses={200: openapi.Response("", BalanceSerializer)},
    )
    @action(detail=False, methods=["get"], url_path="balance")
    def admin_balance(self, request):
        balance = BalanceService.total_balance(settings.CONTRACT_ADDRESS)
        return Response(
            BalanceSerializer(balance.get("content")).data,
            status=balance.get("status_code"),
        )


# Health Check Endpoint
@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"}, status=200)
