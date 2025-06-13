import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

from ssitizens.views import SSEConsumer

django_asgi_app = get_asgi_application()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")


application = ProtocolTypeRouter(
    {
        "http": URLRouter(
            [
                re_path(r"^events/(?P<identifier>[\w-]+)$", SSEConsumer.as_asgi()),
                re_path(r"", django_asgi_app),
            ]
        ),
    }
)
