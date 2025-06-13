from abc import ABC, abstractmethod

from ssitizens.models import Profile

from common.classes.result_helper import Result


class DataProvider(ABC):
    @abstractmethod
    def generate_data(self, user_info: Profile) -> Result[dict, Exception]:
        """This method must generate the requiered data to build the VC"""
        pass
