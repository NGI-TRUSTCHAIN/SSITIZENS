from django.contrib import admin

from ssitizens.models import (
    IssuedVerifiableCredential,
    Profile,
    Transaction,
    UserIdentification,
)


class ProfileAdmin(admin.ModelAdmin):
    model = Profile
    search_fields = ["email", "address"]
    list_filter = ["type", "terms_accepted"]
    list_display = (
        "id",
        "email",
        "address",
        "type",
        "terms_accepted",
        "balance_tokens",
    )

    readonly_fields = ("id", "balance_tokens", "balance_ethers")


class IssuedVerifiableCredentialAdmin(admin.ModelAdmin):
    model = IssuedVerifiableCredential
    search_fields = ["vc_id", "vc_type", "did"]
    list_filter = ["vc_type", "status"]
    list_display = ("vc_id", "vc_type", "did", "status", "issuance_date")
    date_hierarchy = "issuance_date"


class UserIdentificationAdmin(admin.ModelAdmin):
    model = UserIdentification
    list_display = (
        "session_id",
        "user",
        "state",
    )


class TransactionAdmin(admin.ModelAdmin):
    model = Transaction
    search_fields = ["hash"]
    list_filter = ["event"]
    list_display = (
        "id",
        "hash",
        "from_user",
        "to",
        "amount_tokens",
        "amount_ethers",
        "event",
        "timestamp",
    )
    ordering = ("-timestamp",)
    date_hierarchy = "timestamp"


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(IssuedVerifiableCredential, IssuedVerifiableCredentialAdmin)
admin.site.register(UserIdentification, UserIdentificationAdmin)
