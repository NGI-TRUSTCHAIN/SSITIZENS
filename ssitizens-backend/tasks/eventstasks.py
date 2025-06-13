from datetime import date, datetime

from apscheduler.triggers.cron import CronTrigger
from django.contrib.auth.models import User
from django.template.loader import get_template
from django.utils.translation import gettext_lazy as _
from web3 import Web3

from common.services.email_service import EmailService
from project import settings
from ssitizens.enums import EventType
from ssitizens.events.events import EventsService
from ssitizens.events.events_serializers import (
    ControllerRedemptionDataSerializer,
    EventSerializer,
    EventsResponseSerializer,
    EventsStructureResponseSerializer,
    IssuedDataSerializer,
    MetadataSerializer,
    PartyRemovedDataSerializer,
    PartyUpdatedDataSerializer,
    RedeemedDataSerializer,
    TransferDataSerializer,
    TransferWithDataEventSerializer,
)
from ssitizens.models import Profile, Transaction
from ssitizens.services.ipfs import IpfsService
from tasks.models import Register
from tasks.schedulertasks import LaunchScheduler


def task_print(str):
    print(f"{EventTask.task_id}: {str}")


class EventTask:
    task_id = "events"
    task_job = None

    def launch_search_events():
        print(" ==> launch_search_events", EventTask.task_id)
        if EventTask.task_job is None:
            EventTask.task_job = LaunchScheduler.scheduler.add_job(
                EventTask.search_events,
                trigger=CronTrigger(minute="*/2"),  # Cada 10 minutos
                id=EventTask.task_id,  # The `id` assigned to each job MUST be unique
                max_instances=1,
                replace_existing=True,
            )

    def search_events():
        task_print("===>> START JOB <<===")
        last_update_date = EventTask.get_latest_update_date()
        events = EventTask.get_events()
        task_print(f"- Fecha Actualización {last_update_date}")
        task_print(f"- Total de cambios: {events}")

        # Añadimos al registro la fecha de actualización
        EventTask.add_update_date_register()
        task_print("===>> END JOB <<===")

    def get_events():
        txs = Transaction.objects.all().order_by("timestamp")
        response = EventsService.events({})
        total = MetadataSerializer(response.get("content")["metadata"]).data.get(
            "total"
        )
        if total > len(txs):
            # Serialización de los eventos
            last_index: int = int(txs.last().id) + 1 if txs.last() is not None else 0
            task_print(f"Last index: {last_index} ")
            while last_index < total:
                events = EventsService.events({"index": last_index, "size": 10})
                EventTask.save_as_txs(events.get("content"))
                last_index = int(last_index) + 10
        return {"total": total}

    # Funciones auxiliares
    def event_type(event_type: str, data: any) -> EventsStructureResponseSerializer:
        if event_type == "transferWithDataEvent":
            data = TransferWithDataEventSerializer(data).data
            event_type = EventType.transfer.name
            from_user = Profile.objects.filter(address=data.get("from_")).first()
            to_user = Profile.objects.filter(address=data.get("to")).first()
            tokens = data.get("value")
            try:
                cid = bytearray.fromhex(str(data.get("data"))[2:]).decode("utf-8")
                additional_data = IpfsService.get_metadata(cid)
            except Exception:
                additional_data = data.get("data")
            data_return = {
                "event_type": event_type,
                "from_user": from_user,
                "to_user": to_user,
                "tokens": tokens,
                "data": additional_data,
            }

            return data_return
        elif event_type == "Transfer":
            data = TransferDataSerializer(data).data
            event_type = EventType.transfer.name
            from_user = Profile.objects.filter(address=data.get("from_")).first()
            to_user = Profile.objects.filter(address=data.get("to")).first()
            tokens = data.get("value")

            data_return = {
                "event_type": event_type,
                "from_user": from_user,
                "to_user": to_user,
                "tokens": tokens,
                "data": {},
            }
            return data_return
        elif event_type == "Issued":
            data = IssuedDataSerializer(data).data
            event_type = EventType.generate.name
            to_user = Profile.objects.filter(address=data.get("_to")).first()
            tokens = data.get("_value")
            additional_data = {
                "data": data.get("_data"),
                "operator": data.get("_operator"),
            }

            data_return = {
                "event_type": event_type,
                "to_user": to_user,
                "tokens": tokens,
                "data": additional_data,
            }
            return data_return
        elif event_type == "executionComplete":
            event_type = EventType.execution.name
            data_return = {
                "event_type": event_type,
                "tokens": 0.0,
                "data": {},
            }
            return data_return
        elif event_type == "Redeemed":
            data = RedeemedDataSerializer(data).data
            event_type = EventType.burn.name
            from_user = Profile.objects.filter(address=data.get("_from")).first()
            tokens = data.get("_value")
            additional_data = {
                "data": data.get("_data"),
                "operator_data": data.get("_operator"),
            }
            data_return = {
                "event_type": event_type,
                "from_user": from_user,
                "tokens": tokens,
                "data": additional_data,
            }

            return data_return
        elif event_type == "ControllerRedemption":
            data = ControllerRedemptionDataSerializer(data).data
            event_type = EventType.forcedBurn.name
            to_user = Profile.objects.filter(address=data.get("_tokenHolder")).first()
            tokens = data.get("_value")
            additional_data = {
                "data": data.get("_data"),
                "controller": data.get("_controller"),
                "operator_data": data.get("_operatorData"),
            }
            data_return = {
                "event_type": event_type,
                "to_user": to_user,
                "tokens": tokens,
                "data": additional_data,
            }
            return data_return
        elif event_type == "PartyUpdated":
            data = PartyUpdatedDataSerializer(data).data
            event_type = EventType.assignRole.name
            to_user = Profile.objects.filter(address=data.get("user")).first()

            additional_data = {
                "expiration": data.get("expiration"),
                "permission": data.get("permission"),
                "attachedData": data.get("attachedData"),
            }
            data_return = {
                "event_type": event_type,
                "to_user": to_user,
                "tokens": 0.0,
                "data": additional_data,
            }

            return data_return
        elif event_type == "PartyRemoved":
            data = PartyRemovedDataSerializer(data).data
            event_type = EventType.deleteRole.name
            to_user = Profile.objects.filter(address=data.get("user")).first()

            data_return = {
                "event_type": event_type,
                "to_user": to_user,
                "tokens": 0.0,
                "data": {},
            }
            return data_return

    def save_as_txs(events: EventsResponseSerializer):
        for event in events.get("events"):
            event = EventSerializer(event).data
            event_type = EventsStructureResponseSerializer(
                EventTask.event_type(event.get("type"), event.get("data"))
            ).data

            from_user = (
                Profile.objects.filter(id=(event_type.get("from_user")["id"])).first()
                if event_type.get("from_user") is not None
                else None
            )
            to_user = (
                Profile.objects.filter(id=(event_type.get("to_user")["id"])).first()
                if event_type.get("to_user") is not None
                else None
            )

            tx = Transaction.objects.update_or_create(
                id=event.get("index"),
                event=EventType(event_type.get("event_type")),
                from_user=from_user,
                to=to_user,
                amount_tokens=Web3.from_wei(float(event_type.get("tokens")), "ether"),
                amount_ethers=Web3.from_wei(
                    float(event.get("gas_used") * (10 ^ 9)), "ether"
                ),
                data=event_type.get("data"),
                timestamp=event.get("timestamp"),
                hash=f"{settings.BLOCK_EXPLORER_URL}/{event.get('hash')}",
            )
            if tx[0].event is EventType.burn:
                subject = _("Payment Request Information")
                admin = User.objects.filter(is_superuser=True).first()
                message = get_template("payment_request.html").render(
                    (
                        {
                            "message": _("You have a payment request from ")
                            + tx[0].data.get("store_id"),
                            "explanation_step1": _(
                                "The amount of tokens to be redeemed is "
                            )
                            + tx[0].amount_tokens,
                            "explanation_step2": _("The request was processed on ")
                            + tx[0].timestamp,
                            "explanation_step3": _(
                                "If you want to see more information about the transaction you can view it here."
                            ),
                            "block_explorer": tx[0].hash,
                        }
                    )
                )
                mail = EmailService(subject, admin.email, message)
                mail.send_mail()

    def epoch_to_date(epoch):
        epoch_to_seconds = epoch / 1000
        epoch_date = datetime.utcfromtimestamp(epoch_to_seconds)
        formatted_epoch_date = epoch_date.strftime("%Y-%m-%d")
        return formatted_epoch_date

    def get_latest_update_date():
        if Register.objects.filter(key="events").last():
            return Register.objects.filter(key="events").last().value
        return False

    def add_update_date_register():
        today = date.today().strftime("%d/%m/%Y")
        Register.objects.create(key="events", value=today)
