import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "The functional/simpliest way to create a superuser"

    def handle(self, *args, **options):
        for path in settings.LOCALE_PATHS:
            if not os.path.exists(path):
                os.mkdir(path)

        os.system("python manage.py migrate")
        os.system("python manage.py compilemessages")

        User = get_user_model()
        if not User.objects.filter(username="ssitizens").exists():
            User.objects.create_superuser(
                "ssitizens",
                "ssitizens@ssitizens.org",
                "ssitizens",  # USERNAME  # MAIL  # PASS
            )

        os.system("python manage.py populate_ticket_models")