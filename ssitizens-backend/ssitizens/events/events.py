import json

import requests

from common.error.http_error import HTTPError
from project import settings
from ssitizens.events.events_serializers import EventsResponseSerializer


class EventsService:
    @staticmethod
    def events(params: dict) -> dict:
        try:
            url = settings.TOKENIZATION_SERVICE_URL + "/api/events"
            response = requests.request("GET", url, params=params)
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {
            "status_code": response.status_code,
            "content": EventsResponseSerializer(content).data,
        }
        if return_dict["status_code"] != 200:
            raise HTTPError(
                None, return_dict.get("content"), return_dict.get("status_code")
            )
        return return_dict

    @staticmethod
    def event_by_id(tx_hash: str) -> dict:
        try:
            url = settings.TOKENIZATION_SERVICE_URL + f"/api/events/{tx_hash}"
            response = requests.request("GET", url)
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}
        if return_dict["status_code"] != 200:
            raise HTTPError(
                None, return_dict.get("content"), return_dict.get("status_code")
            )
        return return_dict
