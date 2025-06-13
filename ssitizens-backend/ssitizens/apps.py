from django.apps import AppConfig


class SsitizenConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ssitizens"

    def ready(self):
        import ssitizens.signals  # noqa: F401
