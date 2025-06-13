import json

import requests

from project import settings


class BalanceService:
    @staticmethod
    def total_balance(address: str) -> dict:
        try:
            url = settings.TOKENIZATION_SERVICE_URL + f"/api/balance/all/{address}"
            response = requests.request(
                "GET",
                url,
            )
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}
        if return_dict["status_code"] != 200:
            return {
                "status_code": response.status_code,
                "content": {"ethers": 0.0, "tokens": 0.0},
            }
        return return_dict


class PermissionService:
    @staticmethod
    def get_permission(address: str) -> dict:
        try:
            url = settings.TOKENIZATION_SERVICE_URL + f"/api/permissions/{address}"
            response = requests.request(
                "GET",
                url,
            )
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}
        if return_dict["status_code"] != 200:
            return {
                "status_code": response.status_code,
                "content": {"permission": 0},
            }
        return return_dict
