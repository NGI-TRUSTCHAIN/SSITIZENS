from django.db import models
from django.utils.translation import gettext_lazy as _


class Register(models.Model):
    key = models.CharField(max_length=30, null=False, blank=False)
    value = models.CharField(max_length=1000, null=False, blank=False)

    def __str__(self) -> str:
        return f"Register: {self.key}"

    class Meta:
        verbose_name = _("Register")
