from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from ssitizens.models import Profile, Transaction


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "id",
            "email",
            "address",
            "type",
            "data",
            "aid_type",
            "terms_accepted",
            "active_since",
            "active_until",
            "balance_tokens",
            "balance_ethers",
        )


class BeneficiaryDataSerializer(serializers.Serializer):
    dni = serializers.CharField(max_length=10)
    aid_funds = serializers.FloatField()
    full_name = serializers.CharField(max_length=100, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)

    def validate_dni(self, value):
        if not value:
            raise serializers.ValidationError(
                _("DNI are required for beneficiary type")
            )
        else:
            user = Profile.objects.filter(data__dni=value)
            if len(user) > 0:
                raise serializers.ValidationError(_("That DNI is already in use"))


class StoreDataSerializer(serializers.Serializer):
    cif = serializers.CharField(max_length=32)
    store_id = serializers.CharField(max_length=100)
    iban = serializers.CharField(max_length=32, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)

    def validate_cif(self, value):
        if not value:
            raise serializers.ValidationError(
                _("Store ID and CIF are required for store type")
            )
        else:
            user = Profile.objects.filter(data__cif=value)
            if len(user) > 0:  #  and user.filter(id__contains=self.id).count() == 0:
                raise serializers.ValidationError(_("That CIF is already in use"))


class QrSerializer(serializers.Serializer):
    qr = serializers.ImageField()


class PostSaveCredentialData(serializers.Serializer):
    vc_id = serializers.CharField(max_length=150, help_text="Credential ID")
    vc_type = serializers.CharField(max_length=50, help_text="Credential Type")
    pre_code = serializers.CharField(max_length=50, help_text="USed code")
    did = serializers.CharField(max_length=150, help_text="Holder DID")
    issuance_date = serializers.CharField(max_length=50, help_text="Issuance date")
    nbf = serializers.CharField(max_length=50, help_text="Not before date")


class VPData(serializers.Serializer):
    state = serializers.CharField(max_length=50, help_text="Flow State")
    holderDid = serializers.CharField(max_length=1255, help_text="Holder Did")
    claimsData = serializers.JSONField(help_text="VP data")
    valid = serializers.BooleanField()


class VerificationSerializer(serializers.Serializer):
    verified = serializers.BooleanField()


class TransactionSerializer(serializers.ModelSerializer):
    from_user = ProfileSerializer(read_only=True)
    to = ProfileSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = "__all__"


# API RPC Serializers
class RPCResponseSerializer(serializers.Serializer):
    status_code = serializers.CharField(max_length=4)
    content = serializers.JSONField()


class GenerateTokensRPC(serializers.Serializer):
    quantity = serializers.IntegerField()
    additional_data = serializers.CharField(max_length=250, required=False)


class DistributeTokensRPC(serializers.Serializer):
    profile_id = serializers.CharField()
    quantity = serializers.IntegerField()
    additional_data = serializers.CharField(max_length=250, required=False)


class ForceRedemptionRPC(serializers.Serializer):
    profile_id = serializers.CharField()
    additional_data = serializers.CharField(max_length=250, required=False)
    operator_data = serializers.CharField(max_length=250, required=False)


# Administrator Serializers


class BalanceSerializer(serializers.Serializer):
    ethers = serializers.CharField()
    tokens = serializers.CharField()


# Ipfs Serializers


class IpfsAidProductSerializer(serializers.Serializer):
    product_name = serializers.CharField()
    product_total_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class IpfsTicketSerializer(serializers.Serializer):
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    aid_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    aid_products = IpfsAidProductSerializer(many=True)
    ticket_image = serializers.CharField()
