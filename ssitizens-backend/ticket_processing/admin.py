from django.contrib import admin

from ticket_processing.models import Aid, Product

# Register your models here.


class ProductAdmin(admin.ModelAdmin):
    model = Product
    search_fields = ["name"]
    list_display = ("id", "name")


class AidAdmin(admin.ModelAdmin):
    model = Aid
    search_fields = ["name", "products"]
    list_display = ("id", "name")


admin.site.register(Aid, AidAdmin)
admin.site.register(Product, ProductAdmin)
