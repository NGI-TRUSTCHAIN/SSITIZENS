from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django_apscheduler import util
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution


# The `close_old_connections` decorator ensures that database connections, that have become
# unusable or are obsolete, are closed before and after your job has run. You should use it
# to wrap any jobs that you schedule that access the Django database in any way.
@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    """
    This job deletes APScheduler job execution entries older than `max_age` from the database.
    It helps to prevent the database from filling up with old historical records that are no
    longer useful.

    :param max_age: The maximum length of time to retain historical job execution records.
                    Defaults to 7 days.
    """
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


class LaunchScheduler:
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler_start = False

    def start():
        if LaunchScheduler.scheduler_start == True:
            return
        LaunchScheduler.scheduler_start = True
        LaunchScheduler.scheduler.add_jobstore(DjangoJobStore(), "default")
        LaunchScheduler.scheduler.add_job(
            delete_old_job_executions,
            trigger=CronTrigger(
                hour="*/2"
            ),  # Midnight on Monday, before start of the next work week.
            id="delete_old_job_executions",
            max_instances=1,
            replace_existing=True,
        )
        print("Added weekly job: 'delete_old_job_executions'.")

        try:
            print("Starting scheduler...")
            LaunchScheduler.scheduler.start()
        except KeyboardInterrupt:
            print("Stopping scheduler...")
            LaunchScheduler.scheduler.shutdown()
            print("Scheduler shut down successfully!")
