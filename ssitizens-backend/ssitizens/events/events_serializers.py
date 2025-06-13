from rest_framework import serializers

from ssitizens.serializers import ProfileSerializer


# Serializadores específicos para cada tipo de evento
class ControllerRedemptionDataSerializer(serializers.Serializer):
    _data = serializers.CharField()
    _value = serializers.CharField()
    _controller = serializers.CharField()
    _tokenHolder = serializers.CharField()
    _operatorData = serializers.CharField()


class RedeemedDataSerializer(serializers.Serializer):
    _from = serializers.CharField()
    _data = serializers.CharField()
    _value = serializers.CharField()
    _operator = serializers.CharField()


class IssuedDataSerializer(serializers.Serializer):
    _to = serializers.CharField()
    _data = serializers.CharField()
    _value = serializers.CharField()
    _operator = serializers.CharField()


class PartyRemovedDataSerializer(serializers.Serializer):
    user = serializers.CharField()


class PartyUpdatedDataSerializer(serializers.Serializer):
    user = serializers.CharField()
    expiration = serializers.CharField()
    permission = serializers.CharField()
    attachedData = serializers.CharField()


class TransferDataSerializer(serializers.Serializer):
    to = serializers.CharField()
    from_ = serializers.CharField(source="from")
    value = serializers.CharField()


class TransferWithDataEventSerializer(serializers.Serializer):
    to = serializers.CharField()
    from_ = serializers.CharField(source="from")
    value = serializers.CharField()
    data = serializers.CharField()


class EventsStructureResponseSerializer(serializers.Serializer):
    event_type = serializers.CharField()
    from_user = ProfileSerializer(allow_null=True, required=False)
    to_user = ProfileSerializer(allow_null=True, required=False)
    tokens = serializers.CharField(default="0.0")
    data = serializers.JSONField()


# Serializador general de eventos que selecciona el serializador de datos según el tipo
class EventSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    id = serializers.CharField()
    hash = serializers.CharField()
    type = serializers.CharField()
    data = serializers.DictField()
    timestamp = serializers.DateTimeField()
    block_number = serializers.CharField()
    gas_used = serializers.CharField()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        event_type = representation.get("type")
        data = representation.get("data")

        if event_type == "ControllerRedemption":
            representation["data"] = ControllerRedemptionDataSerializer(data).data
        elif event_type == "Redeemed":
            representation["data"] = RedeemedDataSerializer(data).data
        elif event_type == "Issued":
            representation["data"] = IssuedDataSerializer(data).data
        elif event_type == "PartyRemoved":
            representation["data"] = PartyRemovedDataSerializer(data).data
        elif event_type == "PartyUpdated":
            representation["data"] = PartyUpdatedDataSerializer(data).data
        elif event_type == "Trasfer":
            representation["data"] = TransferDataSerializer(data).data
        elif event_type == "TrasferWithData":
            representation["data"] = TransferWithDataEventSerializer(data).data

        return representation


# Serializador para la metadata
class MetadataSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    next_page = serializers.CharField()
    page_size = serializers.IntegerField()


# Serializador de la respuesta completa
class EventsResponseSerializer(serializers.Serializer):
    metadata = MetadataSerializer()
    events = EventSerializer(many=True)
