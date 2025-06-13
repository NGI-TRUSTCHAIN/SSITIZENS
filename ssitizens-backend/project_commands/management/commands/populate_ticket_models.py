import os
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings

from ticket_processing.models import Product, Aid


class Command(BaseCommand):
    help = "Populate the database with initial Products and Aids"

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            products_json_path = os.path.join(
                settings.BASE_DIR, 
                "ticket_processing",
                "data",
                "product_data.json"
            )
            with open(products_json_path, "r") as file:
                products_to_create = json.load(file)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR("Product data file not found."))
            return

        for product_id, product_data in products_to_create.items():
            product_instance, was_created = Product.objects.get_or_create(
                id=product_id,
                defaults={
                    "name": product_data["name"],
                    "additional_information": product_data["additional_information"],
                }
            )
            action = "Created" if was_created else "Already exists"
            self.stdout.write(f"{action} Product {product_instance.id} – {product_instance.name}")

        try:
            aids_json_path = os.path.join(
                settings.BASE_DIR, 
                "ticket_processing",
                "data",
                "aid_data.json"
            )
            with open(aids_json_path, "r") as file:
                aids_to_create = json.load(file)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR("Aid data file not found."))
            return

        for aid_id, aid_data in aids_to_create.items():
            aid_instance, was_created = Aid.objects.get_or_create(
                id=aid_id,
                defaults={
                    "name": aid_data["name"],
                }
            )

            if was_created:
              aid_instance.products.set(aid_data["product_ids"])
              aid_instance.save()

            action = "Created" if was_created else "Already exists"

            aid_product_ids = [str(product.id) for product in aid_instance.products.all()]
            linked_products = ", ".join(aid_product_ids)
            self.stdout.write(
                f"{action} Aid {aid_instance.id} – {aid_instance.name} "
                f"(Product IDs linked to this Aid: {linked_products})"
            )

        self.stdout.write(self.style.SUCCESS("Database population complete."))