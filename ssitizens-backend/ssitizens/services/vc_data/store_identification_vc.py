from profile import Profile

from common.classes.result_helper import Result
from ssitizens.services.vc_data.manager import DataProvider


class StoreIdentificationVCProvider(DataProvider):
    def generate_data(self, user_info: Profile) -> Result[dict, Exception]:
        cif = user_info.data.get("cif")
        store_id = user_info.data.get("store_id")
        if not cif or not store_id:
            return Result.Error(Exception("Insufficient user data"))
        return Result.Ok(
            {
                "cif": cif,
                "store_id": store_id,
            }
        )
