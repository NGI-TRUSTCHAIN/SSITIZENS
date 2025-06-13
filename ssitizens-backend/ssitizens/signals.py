from datetime import datetime, timedelta
from uuid import uuid4

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.template.loader import get_template
from django.utils.translation import gettext_lazy as _

from common.services.email_service import EmailService
from project.settings import BACKEND_DOMAIN, FRONTEND_URL
from ssitizens.enums import Types
from ssitizens.models import Profile, Transaction, UserIdentification
from ssitizens.services.balance import PermissionService
from ssitizens.services.rpc.rpc import RPCMethodsService
from tasks.models import Register


@receiver(post_save, sender=Profile)
def post_save_profile(sender, instance: Profile, **kwargs):
    if kwargs.get("created"):
        if instance.type == Types.store.value:
            session_id = uuid4()
            vc_type = "StoreIdentificationVC"
            UserIdentification(session_id=session_id, user=instance).save()
            subject = _("Ssitizens Account Activation")

            message = get_template("email/welcome_store.html").render(
                (
                    {
                        "welcome_message": _(
                            "You have been invited to the Ssitizens Platform."
                        ),
                        "message": _(
                            "Your store information is already added to the system. Now you need to do next steps:"
                        ),
                        "explanation_step1": _(
                            "1. Download the wallet app from the links below."
                        ),
                        "explanation_step2": _(
                            "2. Follow the instructions in the app to create your wallet."
                        ),
                        "explanation_step3": _(
                            "3. Scan the QR code to add your store identification to you wallet. Or click the button below"
                        ),
                        "explanation_step4": _("4. You can log into website."),
                        "wallet_url_android": "",
                        "wallet_url_ios": "",
                        "qr": f"{BACKEND_DOMAIN}/credential-offer/qr?session_id={session_id}&vc_type={vc_type}",
                        "url": f"{BACKEND_DOMAIN}/credential-offer/url?session_id={session_id}&vc_type={vc_type}",
                        "url_message": _("Click here to get your VC"),
                        "frontend_url": FRONTEND_URL,
                    }
                )
            )
            mail = EmailService(subject, instance.email, message)
            mail.send_mail()

        else:
            subject = _("Ssitizens Account Activation")

            message = get_template("email/welcome_user.html").render(
                (
                    {
                        "welcome_message": _(
                            "You have been invited to the Ssitizens Platform."
                        ),
                        "message": _(
                            "Your information is already added to the system. Now you need to do next steps."
                        ),
                        "explanation_step1": _(
                            "1. Download the wallet app from the links below."
                        ),
                        "explanation_step2": _(
                            "2. Follow the instructions in the app to create your wallet."
                        ),
                        "explanation_step3": _(
                            "3. Generate your Biometric Credential in your wallet. Go to advanced setting and follow the steps to connect with Facephi."
                        ),
                        "explanation_step4": _("4. You can log into website."),
                        "wallet_url_android": "",
                        "wallet_url_ios": "",
                        "frontend_url": FRONTEND_URL,
                    }
                )
            )
            mail = EmailService(subject, instance.email, message)
            mail.send_mail()

        instance.active_since = (
            datetime.now() if instance.active_since is None else instance.active_since
        )
        instance.active_until = (
            (datetime.now() + timedelta(days=365))
            if instance.active_until is None
            else instance.active_until
        )
        instance.save()
    else:
        permission = PermissionService().get_permission(instance.address)
        if (
            instance.type == Types.store
            and instance.terms_accepted
            and instance.data["iban"] is not None
            and instance.address is not None
            and permission.get("permission") == 0
        ):
            RPCMethodsService().assign_role(instance)
        elif (
            instance.type == Types.beneficiary
            and instance.terms_accepted
            and instance.address is not None
            and permission.get("permission") == 2
        ):
            RPCMethodsService().assign_role(instance)


@receiver(pre_delete, sender=Profile)
def pre_delete_profile(sender, instance: Profile, **kwargs):
    if instance.address:
        RPCMethodsService().unassign_role(instance)


@receiver(pre_delete, sender=Transaction)
def pre_delete_transaction(sender, instance: Transaction, **kwargs):
    Register.objects.update(key="events", value=(int(instance.id) - 1))
