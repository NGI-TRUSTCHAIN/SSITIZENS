import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from ssitizens.enums import EventType, Types
from ssitizens.services.balance import BalanceService
from ticket_processing.models import Aid


# Create your models here.
class Profile(models.Model):
    id = models.CharField(
        primary_key=True, default=uuid.uuid4, editable=False, max_length=36
    )
    email = models.EmailField(_("Email"), max_length=100, unique=True)
    address = models.CharField(_("Address"), blank=True, null=True)
    type = models.CharField(
        _("Type"),
        choices=Types.choices(),
        max_length=100,
        null=False,
        blank=False,
    )
    data = models.JSONField(_("Data"), blank=True, null=True)
    aid_type = models.ForeignKey(Aid, on_delete=models.SET_NULL, null=True, blank=True)
    terms_accepted = models.BooleanField(_("Terms Accepted"), default=False)
    active_since = models.DateTimeField(_("Active Since"), blank=True, null=True)
    active_until = models.DateTimeField(_("Active Until"), blank=True, null=True)
    balance_tokens = models.FloatField(_("Balance Tokens"), default=0.0)
    balance_ethers = models.FloatField(_("Balance Ethers"), default=0.0)

    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")

    def clean(self):
        if self.type == Types.store.value:
            if (
                self.data is None
                or not self.data.get("store_id")
                or not self.data.get("cif")
            ):
                raise ValidationError(_("Store ID and CIF are required for store type"))
            else:
                user = Profile.objects.filter(data__cif=self.data.get("cif"))
                if len(user) > 0 and user.filter(id__contains=self.id).count() == 0:
                    raise ValidationError(_("That CIF is already in use"))
        elif self.type == Types.beneficiary.value:
            if (
                self.data is None
                or not self.data.get("dni")
                or not self.data.get("aid_funds")
            ):
                raise ValidationError(
                    _("DNI and AID Funds are required for beneficiary type")
                )
            elif not self.aid_type:
                raise ValidationError(_("Aid type is required for beneficiary type"))
            else:
                user = Profile.objects.filter(data__dni=self.data.get("dni"))
                if len(user) > 0 and user.filter(id__contains=self.id).count() == 0:
                    raise ValidationError(_("That DNI is already in use"))
        if self.address:
            check_balance = BalanceService.total_balance(self.address)
            self.balance_ethers = check_balance.get("content").get("ethers")
            self.balance_tokens = check_balance.get("content").get("tokens")
            self.save()

    def __str__(self):
        return f"{self.email} - {self.type}"


class Transaction(models.Model):
    id = models.CharField(
        primary_key=True, default=uuid.uuid4, editable=False, max_length=36
    )
    event = models.CharField(
        _("Event"),
        choices=EventType.choices(),
        max_length=1000,
        default=EventType.transfer,
    )
    from_user = models.ForeignKey(
        Profile,
        related_name=_("From"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    to = models.ForeignKey(
        Profile,
        related_name=_("To"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    amount_tokens = models.FloatField(_("Tokens"), default=0.0)
    amount_ethers = models.FloatField(_("Ethers"), default=0.0)
    data = models.JSONField(_("Data"), blank=True, null=True)
    hash = models.CharField(_("Transaction Hash"))
    timestamp = models.DateTimeField(_("Timestamp"), blank=True, null=True)

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")

    def clean(self):
        if self.amount_tokens <= 0:
            raise ValidationError(_("Tokens amount cannot be negative or zero"))
        if self.event == EventType.generate.value:
            if self.from_user is not None:
                raise ValidationError(_("From user should be empty"))
            if self.to is not None:
                raise ValidationError(_("To user should be empty"))
        elif self.event == EventType.transfer.value:
            if self.from_user is not None:
                raise ValidationError(_("From user should be empty"))
        elif self.event == EventType.burn.value:
            if self.from_user is not None:
                raise ValidationError(_("From user should be empty"))
        elif self.event == EventType.assignRole.value:
            if self.from_user is not None:
                raise ValidationError(_("From user should be empty"))
        elif self.event == EventType.deleteRole.value:
            if self.from_user is not None:
                raise ValidationError(_("From user should be empty"))

    def __str__(self):
        return f"{self.hash} - {self.event}"


class PreCodes(models.Model):
    pre_code = models.CharField(_("Pre Code"), max_length=200, primary_key=True)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, null=False)


class UserIdentification(models.Model):
    session_id = models.CharField(_("Session ID"), max_length=200, primary_key=True)
    state = models.CharField(
        _("State"), max_length=200, null=True, blank=True, unique=True
    )
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    expiration = models.DateTimeField(_("Expiration"), null=True, blank=True)

    class Meta:
        verbose_name = _("User Identification")
        verbose_name_plural = _("User Identifications")


class IssuedVerifiableCredential(models.Model):
    status = models.BooleanField(_("Revocation status"), default=False)

    vc_id = models.CharField(
        _("VC Identifier"), max_length=4000, null=False, primary_key=True
    )
    vc_type = models.CharField(max_length=200, verbose_name=_("VC Type"))
    did = models.CharField(_("Holder Identifier"), max_length=4000, null=False)
    issuance_date = models.DateTimeField(_("Issuance Date"), null=False)

    def clean(self):
        if not self.status:
            # Check if the data was set to true before
            current_model = IssuedVerifiableCredential.objects.filter(
                vc_id=self.vc_id
            ).last()
            if current_model.status:
                raise ValidationError(_("Can't restore the status of a revoked VC"))

    class Meta:
        verbose_name = _("Issued Verifiable Credential")
        verbose_name_plural = _("Issued Verifiable Credentials")
