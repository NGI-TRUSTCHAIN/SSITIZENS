from enum import Enum

from django.utils.translation import gettext_lazy as _


class Types(str, Enum):
    beneficiary = "beneficiary"
    store = "store"
    # admin = "admin"

    @classmethod
    def choices(cls):
        return tuple((i.name, i.value) for i in cls)

    @classmethod
    def values(cls):
        return [item.value for item in cls]


class VerificationFlows(str, Enum):
    BeneficiaryIdentity = "openid-beneficiary-identity"
    StoreIdentity = "openid-store-identity"


class EventType(str, Enum):
    generate = _("generate")
    transfer = _("transfer")
    burn = _("burn")
    forcedBurn = _("forcedBurn")
    assignRole = _("assignRole")
    deleteRole = _("deleteRole")
    execution = _("execution")

    @classmethod
    def choices(cls):
        return tuple((i.name, i.value) for i in cls)
