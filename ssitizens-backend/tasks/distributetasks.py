from datetime import date, datetime

from apscheduler.triggers.cron import CronTrigger
from django.utils.translation import gettext_lazy as _

from ssitizens.enums import EventType, Types
from ssitizens.models import Profile, Transaction
from ssitizens.services.rpc.rpc import RPCMethodsService
from tasks.models import Register
from tasks.schedulertasks import LaunchScheduler


def task_print(str):
    print(f"{DistributeTask.task_id}: {str}")


class DistributeTask:
    task_id = "distribute_batch"
    task_job = None

    def launch_distribute_batch():
        print(" ==> launch_distribute_batch", DistributeTask.task_id)
        if DistributeTask.task_job is None:
            DistributeTask.task_job = LaunchScheduler.scheduler.add_job(
                DistributeTask.distribute_tokens,
                trigger=CronTrigger(
                    hour="03", minute="15"
                ),  # Todos los dias a las 03:15
                id=DistributeTask.task_id,  # The `id` assigned to each job MUST be unique
                max_instances=1,
                replace_existing=True,
            )

    def distribute_tokens():
        task_print("===>> START JOB <<===")
        last_update_date = DistributeTask.get_latest_update_date()
        profiles = DistributeTask.get_profiles()
        task_print(f"- Fecha Actualización {last_update_date}")
        task_print(f"- Total de cambios: {profiles}")

        if len(profiles.get("addresses")) == 0:
            task_print(_("No citizens to distribute tokens detected, skipping"))
            task_print("===>> END JOB <<===")
            return
        else:
            response = RPCMethodsService.distribute_tokens_batch(
                profiles.get("addresses"), profiles.get("quantity")
            )
        # TODO: Guardar en Transaction list el hash del id devuelto por la llamada

        # Añadimos al registro la fecha de actualización
        DistributeTask.add_update_date_register()
        task_print("===>> END JOB <<===")

    def get_profiles():
        # Obtenemos todos los perfiles de usuarios de tipo Ciudadano
        # Si cumplen con los criterios (Address y condiciones)
        # Buscamos que no se haya generado Batch para ese mes en Transaction

        citizens = Profile.objects.filter(
            type=Types.beneficiary.value, terms_accepted=True, address__isnull=False
        )

        batch_array_address = []
        batch_array_quantity = []

        for citizen in citizens:
            # Si no hay, añadimos su address y fund a la lista para crear el array
            transactions = Transaction.objects.filter(
                to=citizen,
                event=EventType.transfer.value,
                timestamp__year=datetime.now.year,
                timestamp__month=datetime.now.month,
            )
            if transactions.count() == 0:
                batch_array_address.append(citizen.address)
                batch_array_quantity.append(citizen.data.get("aid_funds"))

        return {"addresses": batch_array_address, "quantity": batch_array_quantity}

    # Funciones auxiliares
    def epoch_to_date(epoch):
        epoch_to_seconds = epoch / 1000
        epoch_date = datetime.utcfromtimestamp(epoch_to_seconds)
        formatted_epoch_date = epoch_date.strftime("%Y-%m-%d")
        return formatted_epoch_date

    def get_latest_update_date():
        if Register.objects.filter(key="distribute_batch").last():
            return Register.objects.filter(key="distribute_batch").last().value
        return False

    def add_update_date_register():
        today = date.today().strftime("%d/%m/%Y")
        Register.objects.create(key="distribute_batch", value=today)
