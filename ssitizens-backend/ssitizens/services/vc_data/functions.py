from common.classes.result_helper import Result
from ssitizens.services.vc_data.manager import DataProvider
from ssitizens.services.vc_data.store_identification_vc import (
    StoreIdentificationVCProvider,
)


def get_data_provider(vc_type) -> Result[DataProvider, Exception]:
    match vc_type:
        case "StoreIdentificationVC":
            return Result.Ok(StoreIdentificationVCProvider())
        case _:
            return Result.Error(Exception("Invalid credential type"))
