import datetime
import json
from typing import List
from uuid import uuid4

import requests
from django.utils.translation import gettext_lazy as _

from common.error.http_error import HTTPError
from project import settings
from ssitizens.enums import Types
from ssitizens.models import Profile


class RPCMethodsService:
    @staticmethod
    def generate_tokens(quantity: float, additional_data: str | None) -> dict:
        id = str(uuid4())
        body = {
            "jsonrpc": "2.0",
            "method": "generateTokens",
            "id": id,
            "params": {
                "quantity": quantity,
                "additionalData": "0x00"
                if additional_data is None
                else additional_data,
            },
        }
        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }

    @staticmethod
    def distribute_tokens(
        profile: Profile, quantity: int, additional_data: str | None
    ) -> dict:
        if not profile.terms_accepted:
            raise Exception("Not terms accepted")
        if not profile.address:
            raise Exception("Not address")
        if not profile.type == Types.beneficiary.value:
            raise Exception("Not citizen")
        id = str(uuid4())
        body = {
            "jsonrpc": "2.0",
            "method": "distributeTokens",
            "id": id,
            "params": {
                "to": profile.address,
                "quantity": quantity,
                "additionalData": "0x00"
                if additional_data is None
                else additional_data,
            },
        }

        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }

    @staticmethod
    def distribute_tokens_batch(addr: List[str], quantity: List[int]) -> dict:
        id = str(uuid4())
        body = {
            "jsonrpc": "2.0",
            "method": "distributeTokensInBatch",
            "id": id,
            "params": {
                "toBatch": addr,
                "quantityBatch": quantity,
            },
        }

        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }

    @staticmethod
    def force_token_redemption(
        profile: Profile,
        quantity: int,
        additional_data: str | None,
        operator_data: str | None,
    ) -> dict:
        if not profile.terms_accepted:
            raise Exception("Not terms accepted")
        if not profile.address:
            raise Exception("Not address")
        id = str(uuid4())
        body = {
            "jsonrpc": "2.0",
            "method": "forceTokenRedemption",
            "id": id,
            "params": {
                "addr": profile.address,
                "quantity": quantity,
                "additionalData": (
                    "0x00" if additional_data is None else additional_data
                ),
                "operatorData": ("0x00" if operator_data is None else operator_data),
            },
        }

        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }

    @staticmethod
    def assign_role(profile: Profile) -> dict:
        if not profile.terms_accepted:
            raise Exception("Not terms accepted")
        if not profile.address:
            raise Exception("Not address")
        if not profile.address.startswith("0x"):
            profile.address = "0x" + profile.address
        id = str(uuid4())
        if profile.type == Types.beneficiary.value:
            attachedData = profile.aid_type.id
            role = 1
        elif profile.type == Types.store.value:
            attachedData = profile.data.get("store_id")
            role = 2
        else:
            role = 0
            attachedData = "0x00"
        body = {
            "jsonrpc": "2.0",
            "method": "assignRole",
            "id": id,
            "params": {
                "addr": profile.address,
                "role": role,
                "exp": int(
                    (datetime.datetime.now() + datetime.timedelta(days=365)).timestamp()
                ),
                "attachedData": attachedData,
            },
        }

        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }

    @staticmethod
    def unassign_role(profile: Profile) -> dict:
        if not profile.address:
            raise Exception("Not address")
        if not profile.address.startswith("0x"):
            profile.address = "0x" + profile.address
        id = str(uuid4())
        body = {
            "jsonrpc": "2.0",
            "method": "unassignRole",
            "id": id,
            "params": {"addr": profile.address},
        }

        rpc_response = RpcService(body).send_request()
        return {
            "content": rpc_response.get("content"),
            "status_code": rpc_response.get("status_code"),
        }


class RpcService:
    def __init__(self, body):
        self.body: dict = body

    def send_request(self) -> dict:
        if not settings.TOKENIZATION_SERVICE_URL:
            raise HTTPError(None, _("Tokenization service URL not set"), 500)
        try:
            url = f"{settings.TOKENIZATION_SERVICE_URL}/rpc"
            response = requests.request("POST", url, json=self.body)
        except Exception as e:
            raise Exception(e)

        content = json.loads(response.content.decode("utf-8"))
        return_dict = {"status_code": response.status_code, "content": content}

        if return_dict["status_code"] != 200:
            raise HTTPError(
                None, return_dict.get("content"), return_dict.get("status_code")
            )
        if content.get("id") != self.body.get("id"):
            raise HTTPError(status=response.status_code, content=_("Not the same tx"))
        return return_dict
