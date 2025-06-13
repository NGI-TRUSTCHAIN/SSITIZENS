import json

import requests

from project import settings
from ssitizens.serializers import IpfsTicketSerializer


class IpfsService:
    @staticmethod
    def get_metadata(cid: str) -> dict:
        try:
            params = {"pinataGatewayToken": settings.PINATA_GATEWAY_TOKEN}
            url = f"{settings.PINATA_URL}/ipfs/{cid}"
            response = requests.request("GET", url, params=params)
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}
        if return_dict["status_code"] != 200:
            return {
                "status_code": response.status_code,
                "content": {},
            }
        return_data = IpfsTicketSerializer(return_dict.get("content")).data

        return return_data

    @staticmethod
    def get_ticket_image(cid: str) -> str:
        try:
            headers = {"Authorization": f"Bearer {settings.PINATA_GATEWAY_TOKEN}"}
            url = f"{settings.PINATA_URL}/files/{cid}"
            response = requests.request("GET", url, headers=headers)
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}
        if return_dict["status_code"] != 200:
            return {
                "status_code": response.status_code,
                "content": {},
            }

        return response.text
