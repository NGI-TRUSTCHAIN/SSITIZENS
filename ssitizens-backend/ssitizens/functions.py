from datetime import datetime, timedelta

from hdwallet import HDWallet
from hdwallet.addresses.ethereum import EthereumAddress
from hdwallet.cryptocurrencies import Qtum as Cryptocurrency
from hdwallet.hds import BIP32HD

from project import settings
from ssitizens.models import Profile, UserIdentification


def check_address(did: str, profile: Profile):
    if profile.address is None:
        address = EthereumAddress.encode(
            public_key=(
                HDWallet(
                    cryptocurrency=Cryptocurrency,
                    hd=BIP32HD,
                ).from_xpublic_key(xpublic_key=did[did.find("xpub") :])
            ).public_key()
        )
        profile.address = address
        profile.save()


def access_time_session_id(profile: Profile, user_id: UserIdentification):
    if user_id.expiration is None:
        user_id.user = profile
        user_id.expiration = datetime.now() + timedelta(
            hours=settings.SESSION_EXPIRATION
        )
        user_id.save()
