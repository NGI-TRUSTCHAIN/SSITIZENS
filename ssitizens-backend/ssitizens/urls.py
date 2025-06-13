from rest_framework.routers import SimpleRouter

from .views import (
    AdministratorView,
    ProfileView,
    SSIView,
    TokenizationAPI,
    TransactionView,
)

router = SimpleRouter(trailing_slash=False)
router.register(r"users", ProfileView, "Users")
router.register(r"transactions", TransactionView, "Transactions")
router.register(r"", SSIView, "Login Users view")
router.register(r"", TokenizationAPI, "Tokenization module")
router.register(r"", AdministratorView, "Generate PDF")
urlpatterns = router.urls
