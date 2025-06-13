from django.urls import path

from .views import AidsView, upload_images

urlpatterns = [
    path("ticket_processing/upload/", upload_images, name="upload_image"),
    path(r"aids/", AidsView.as_view({"get": "list"}), name="aids"),
]
