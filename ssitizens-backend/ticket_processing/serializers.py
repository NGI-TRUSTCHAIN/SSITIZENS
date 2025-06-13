from rest_framework import serializers
from rest_framework.fields import ImageField

from ticket_processing.models import Aid


class TicketUploadSerializer(serializers.Serializer):
    aid_id = serializers.CharField(max_length=100)
    images = serializers.ListField(child=ImageField(), allow_empty=False)


class AidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aid
        fields = ("id", "name")
