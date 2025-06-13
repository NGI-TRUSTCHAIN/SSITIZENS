import base64
import json
import logging
import time
import os
from decimal import Decimal
from typing import Dict, List, Literal, NamedTuple, Optional, Tuple, Union
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http.response import JsonResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from openai import AzureOpenAI
from rest_framework import mixins, viewsets
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from ticket_processing.models import Aid
from ticket_processing.serializers import AidSerializer, TicketUploadSerializer

AZURE_OPENAI_API_KEY = settings.AZURE_OPENAI_API_KEY
AZURE_OPENAI_API_BASE = settings.AZURE_OPENAI_API_BASE
AZURE_OPENAI_API_VERSION = settings.AZURE_OPENAI_API_VERSION

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s: %(message)s",
)


class TicketRecord(NamedTuple):
    name: str
    price: Decimal
    units: Union[int, Decimal, float]
    total_price: Decimal
    flag: Literal["A", "N"]


openai_client = AzureOpenAI(
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_API_BASE,
    api_key=AZURE_OPENAI_API_KEY,
)

try:
    prompts_path = os.path.join(
        settings.BASE_DIR, 
        "ticket_processing",
        "data",
        "prompts.json"
    )
    with open(prompts_path, "r", encoding="utf-8") as file:
        prompts = json.load(file)
    image_processing_prompt = prompts["image_processing_prompt"]
    data_processing_prompt = prompts["data_processing_prompt"]
    aid_prompt = prompts["aid_prompt"]
except Exception as e:
    logging.info("Error loading prompts:", e)


def base64_encode_images(images: List) -> List[str]:
    if not images:
        raise ValueError("No images provided.")
    return [base64.b64encode(image.read()).decode("utf-8") for image in images]


def prepare_chat_messages(role_prompt, *images: str) -> List[Dict[str, str]]:
    prompt_content = [{"type": "text", "text": role_prompt}]

    system_message = {
        "role": "system",
        "content": prompt_content,
    }

    if not images:
        return [system_message]

    user_messages = []
    for image in images:
        if not isinstance(image, str):
            raise ValueError("All images must be in string base64 format.")
        if not image.startswith("data:image/jpeg;base64,"):
            image = f"data:image/jpeg;base64,{image}"
        user_message = {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image,
                    },
                }
            ],
        }
        user_messages.append(user_message)

    return [system_message] + user_messages


def call_json_completion_model(
    openai_client,
    model: str,
    messages: List[Dict[str, str]],
    parse_decimal: bool = False,
) -> Dict:
    try:
        response = openai_client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        logging.info("Error calling Azure OpenAI API: {e}")
        return None

    response_message = response.choices[0].message.content
    logging.info(f"response raw :{response_message}")
    try:
        response_dict = json.loads(
            response_message,
            parse_float=Decimal if parse_decimal else None,
        )
    except json.JSONDecodeError as e:
        logging.info("Error decoding JSON response:", e)
        return None

    return response_dict


def parse_ticket_record(record: List) -> TicketRecord:
    if len(record) != 5:
        raise ValueError("Invalid record length. Expected 5 elements: {record}")
    name, price, units, total_price, flag = record

    checks_to_perform = [
        (name, str),
        (price, Decimal),
        (units, (int, Decimal, float)),
        (total_price, Decimal),
        (flag, str),
    ]
    for value, expected_type in checks_to_perform:
        if not isinstance(value, expected_type):
            raise ValueError(
                f"Invalid type for {value}: {type(value)}. Expected {expected_type}."
            )

    if flag not in ["A", "N"]:
        raise ValueError(f"Invalid flag value: {flag}. Expected 'A' or 'N'.")

    return TicketRecord(
        name=name,
        price=Decimal(price),
        units=units,
        total_price=Decimal(total_price),
        flag=flag,
    )


def process_ticket_total(
    ticket_product_list: List[TicketRecord],
) -> Tuple[Decimal, Decimal]:
    aid_total = Decimal(0.0)
    without_aid_total = Decimal(0.0)

    for record in ticket_product_list:
        if not isinstance(record, TicketRecord):
            raise ValueError("Invalid record type: {type(record)}.")
        if record.flag == "A":
            aid_total += record.total_price
        elif record.flag == "N":
            without_aid_total += record.total_price

    return aid_total, without_aid_total


def process_ticket_products(
    ticket_product_list: List[TicketRecord],
) -> List[Dict[str, Decimal]]:
    aid_products = []
    for record in ticket_product_list:
        if not isinstance(record, TicketRecord):
            raise ValueError("Invalid record type: {type(record)}.")
        if record.flag == "A":
            product_entry = {
                "product_name": record.name,
                "product_total_price": record.total_price,
            }
            aid_products.append(product_entry)

    return aid_products


def print_ticket_product_list(ticket_product_list: List[TicketRecord]) -> None:
    logging.info(f"{'NAME':30}{'PRICE':>8}{'UNITS':>8}{'TOTAL':>12}{'FLAG':>12}")
    for product in ticket_product_list:
        flag_text = (
            "APLICA"
            if product.flag == "A"
            else "NO APLICA"
            if product.flag == "N"
            else "ERROR"
        )
        logging.info(
            f"{product.name:30}{product.price:8.2f}{product.units:8.3f}{product.total_price:12.2f}{flag_text:>12}"
        )


def get_aid_products_list(aid: Aid) -> List[Dict[str, Optional[str]]]:
    products_query = aid.products.values(
        "name",
        "additional_information",
    )

    product_list = [
        {"name": product["name"], "additional_information": product["additional_information"] or ""}
        for product in products_query
    ]

    return product_list


def add_products_to_aid_prompt(aid_product_list: List, aid_prompt: str) -> str:
    structured_product_list = []
    for product in aid_product_list:
        additional_info = product.get("additional_information")
        if additional_info:
            product_text = f"{product['name']} ({additional_info})"
            structured_product_list.append(product_text)
        else:
            product_text = product["name"]
            structured_product_list.append(product_text)

    product_list_str = "\n".join([f"- {product}" for product in structured_product_list])
    formatted_aid_prompt = aid_prompt.format(aid_product_list=product_list_str)

    return formatted_aid_prompt


aid_param = openapi.Parameter(
    name="aid_id",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_STRING,
    description="Your aid identifier",
    required=True,
)
images_param = openapi.Parameter(
    name="images",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_ARRAY,
    description="One or more images (JPEG, PNG, WEBP, static GIF)",
    required=True,
    items=openapi.Items(type=openapi.TYPE_FILE, format=openapi.FORMAT_BINARY),
)


@swagger_auto_schema(
    method="post",
    operation_description="Upload one or more images with a user ID.",
    manual_parameters=[aid_param, images_param],
    consumes=["multipart/form-data"],
    security=[{"Bearer": []}, {"Basic": []}],
    responses={200: openapi.Response("Upload successful")},
)
@api_view(["POST"])
@authentication_classes(
    [
        JWTAuthentication,
        SessionAuthentication,
        BasicAuthentication,
    ]
)
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_images(request):
    time_0 = time.time()
    serializer = TicketUploadSerializer(data=request.data)

    if not serializer.is_valid():
        return JsonResponse(data=serializer._errors, status=400)

    aid_id = serializer.validated_data["aid_id"]
    images = serializer.validated_data["images"]

    try:
        aid = Aid.objects.get(id=aid_id)
    except Aid.DoesNotExist:
        return JsonResponse(data={"message": "Aid not found for the provided ID."}, status=404)

    for image in images:
        logging.info(image)
        logging.info(type(image))

    json_formatted_base64_images = base64_encode_images(images)

    image_processing_messages_list = prepare_chat_messages(
        image_processing_prompt, *json_formatted_base64_images
    )
    time_1 = time.time()
    image_completion_message_dict = call_json_completion_model(
        openai_client, settings.VISION_LLM_MODEL, image_processing_messages_list
    )
    if image_completion_message_dict is None:
        return JsonResponse(
            data={"message": "Error processing the provided image."}, status=500
        )
    elif image_completion_message_dict.get("warning"):
        return JsonResponse(
            data={
                "message": "No purchase receipt was found in the provided image."
            },
            status=200,
        )
    time_2 = time.time()

    aid_product_list = get_aid_products_list(aid)
    if not aid_product_list:
        return JsonResponse(data={"message": "No products found for the provided aid."}, status=404)

    formatted_aid_prompt = add_products_to_aid_prompt(aid_product_list, aid_prompt)

    formatted_data_processing_prompt = data_processing_prompt.format(
        ticket_json=image_completion_message_dict, aid_description=formatted_aid_prompt
    )
    logging.info(f"\n\nFormatted data processing prompt:\n\n{formatted_data_processing_prompt}\n\n")

    data_processing_messages_list = prepare_chat_messages(
        formatted_data_processing_prompt,
    )
    data_completion_message_dict = call_json_completion_model(
        openai_client,
        settings.CLASSIFICATION_LLM_MODEL,
        data_processing_messages_list,
        parse_decimal=True,
    )
    if data_completion_message_dict is None:
        return JsonResponse(
            data={"message": "Error processing the provided image."}, status=500
        )
    time_3 = time.time()

    logging.info(
        "Completion message for data processing:\n", data_completion_message_dict
    )

    ticket_product_list = data_completion_message_dict.get("productos", [])

    formatted_ticket_product_list: List[TicketRecord] = [
        parse_ticket_record(record) for record in ticket_product_list
    ]

    aid_total, without_aid_total = process_ticket_total(formatted_ticket_product_list)

    products = process_ticket_products(formatted_ticket_product_list)

    print_ticket_product_list(formatted_ticket_product_list)

    response_data = {
        "payment_amount": without_aid_total,
        "aid_amount": aid_total,
        "aid_products": products,
    }
    logging.info(f"Response data:\n{response_data}")

    time_4 = time.time()
    logging.info(
        f"times:\n\t\ttime taken for img process. prompt:\t{time_1 - time_0}\n\t\ttime taken for img process. model:\t{time_2 - time_1}\n\t\ttime taken for classif. model:\t{time_3 - time_2}\n\t\ttime taken for data process.:\t{time_4 - time_3}\n\t\ttime taken for total process.:\t{time_4 - time_0}"
    )

    return JsonResponse(data=response_data, status=200)


# Create your views here.
class AidsView(mixins.ListModelMixin, viewsets.GenericViewSet):
    model_class = Aid
    serializer_class = AidSerializer
    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        JWTAuthentication,
    ]

    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Aid.objects.all()

        else:
            raise PermissionDenied({"detail": "Invalid credentials."})
