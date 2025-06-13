from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.
class Product(models.Model):
    id = models.CharField(primary_key=True, editable=True, max_length=36)
    name = models.CharField(_("Product Name"), max_length=100, unique=True)
    additional_information = models.CharField(
        _("Additional Information"), max_length=200,blank=True, null=True
    )

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def __str__(self):
        return f"{self.id} - {self.name}"


class Aid(models.Model):
    id = models.CharField(primary_key=True, editable=True, max_length=36)
    name = models.CharField(_("Aid Name"), max_length=100, unique=True)
    products = models.ManyToManyField(Product, related_name="valid_products")

    class Meta:
        verbose_name = _("Aid")
        verbose_name_plural = _("Aids")

    def __str__(self):
        return f"{self.id} - {self.name}"
