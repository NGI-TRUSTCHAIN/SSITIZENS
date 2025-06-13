import os
from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

import sentry_sdk
from django.utils.translation import gettext_lazy as _


def readEnvBool(envVarName: str, default: bool) -> bool:
    return (
        os.environ.get(envVarName) in [True, "true", "TRUE", "True", "1", "t", "T"]
    ) or default


def readEnvList(envVarName: str, default: str) -> str:
    return (
        os.environ.get(envVarName).split(",") if os.environ.get(envVarName) else default
    )


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-e&q@0vqsgl27&#h@8pa@dips7x+@jt+k+mrlwg=84mf31on7be",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = int(os.environ.get("DEBUG", 1))


DJANGO_ENVIRONMENT = os.environ.get("DJANGO_ENVIRONMENT", "local")


BACKEND_DOMAIN = os.environ.get("BACKEND_DOMAIN", "")

DOMAIN_WITHOUT_PROTOCOL = BACKEND_DOMAIN.replace("https://", "").replace("http://", "")

ALLOWED_HOSTS: List[str] = readEnvList(
    "ALLOWED_HOSTS", [DOMAIN_WITHOUT_PROTOCOL.split(":")[0]]
)

CSRF_TRUSTED_ORIGINS: List[str] = readEnvList("CSRF_TRUSTED_ORIGINS", [BACKEND_DOMAIN])
CORS_ORIGIN_ALLOW_ALL: bool = readEnvBool("CORS_ORIGIN_ALLOW_ALL", True)
CORS_ALLOWED_ORIGINS: List[str] = readEnvList("CORS_ALLOWED_ORIGINS", [BACKEND_DOMAIN])

# Base url to serve media files
MEDIA_URL = "/media/"
# Path where media is stored
MEDIA_ROOT = os.path.join(BASE_DIR, "media/")

SERVER_NAME = os.environ.get("DJANGO_ENVIRONMENT", "localhost")

USE_PORT = True if SERVER_NAME == "localhost" else False

USE_HTTPS = int(os.environ.get("USE_HTTPS", False))

SERVER_PORT = os.environ.get("SERVER_PORT", "8000")
if USE_HTTPS:
    SERVER_PORT = "443"

# Application definition

INSTALLED_APPS = [
    "daphne",
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_json_widget",
    "django_jsonform",
    "django_apscheduler",
    "rest_framework",
    "drf_yasg",
    "rest_framework.authtoken",
    "corsheaders",
    "django_celery_results",
    "django_rest_passwordreset",
    "django_filters",
    "project_commands",
    "ssitizens",
    "ticket_processing",
    "tasks",
]

MIDDLEWARE = [
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "project.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "postgres"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
        "HOST": os.environ.get("DB_HOST", "postgres"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

database_url = os.environ.get("DATABASE_URL", None)

if database_url:
    import dj_database_url

    DATABASES["default"] = dj_database_url.parse(database_url)


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/
LOCALE_PATHS = [(os.path.join(BASE_DIR, "locale/"))]
# Set default languaje
LANGUAGES = [("es-ES", _("Spanish")), ("en-EN", _("English"))]
LANGUAGE_CODE = "en-EN"
TIME_ZONE = os.environ.get("TIME_ZONE", "Europe/Madrid")
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC_ROOT = "static"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
# STATICFILES_DIRS = [
#     BASE_DIR / "styles",
# ]

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")


# POSTMARK
POSTMARK_API_KEY = os.environ.get("POSTMARK_API_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "")
POSTMARK = {
    "TOKEN": POSTMARK_API_KEY,
    "TEST_MODE": False,
    "VERBOSITY": 0,
}
if POSTMARK_API_KEY:
    EMAIL_BACKEND = "postmarker.django.EmailBackend"
    EMAIL_HOST = "smtp.postmarkapp.com"
    EMAIL_HOST_USER = POSTMARK_API_KEY
    EMAIL_HOST_PASSWORD = POSTMARK_API_KEY
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    DEFAULT_FROM_EMAIL = DEFAULT_FROM_EMAIL
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    EMAIL_HOST = "localhost"
    EMAIL_PORT = 1025
    EMAIL_USE_TLS = False
    EMAIL_USE_SSL = False

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication,",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissions",
    ],
    # "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    # "PAGE_SIZE": 100,
}

if not DEBUG:
    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN", ""),
        environment=DJANGO_ENVIRONMENT,
        traces_sample_rate=1.0,
        send_default_pii=True,
    )
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


SIMPLE_JWT = {
    "TOKEN_OBTAIN_SERIALIZER": "user.serializers.CustomTokenLoginSerializer",
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=os.environ.get("ACCESS_TOKEN_LIFETIME", 15)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        hours=os.environ.get("REFRESH_TOKEN_LIFETIME", 1)
    ),
}

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

LOGIN_REDIRECT_URL = ""

LOGIN_URL = "/"

SWAGGER_SETTINGS = {
    "USE_SESSION_AUTH": False,
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
        },
        "Basic": {"type": "basic"},
    },
}

JAZZMIN_SETTINGS: Dict[str, Any] = {
    "site_title": "SSITIZENS Admin",
    "site_header": "SSITIZENS",
    "site_brand": "SSITIZENS",
    "login_logo": "",
    "login_logo_dark": "",
    "site_logo_classes": "img-circle",
    "site_icon": "",
    "welcome_sign": _("Welcome to the SSITIZENS Admin Site"),
    "copyright": _("SSITIZENS"),
    "search_model": ["auth.User", "auth.Group"],
    "user_avatar": None,
    ############
    # Top Menu #
    ############
    "topmenu_links": [
        {
            "name": _("Home"),
            "url": "admin:index",
            "permissions": ["auth.view_user"],
        },
        {
            "name": _("Support"),
            "url": "https://github.com/farridav/django-jazzmin/issues",
            "new_window": True,
            "icon": "far fa-question-circle",
        },
        {"model": "auth.User"},
    ],
    #############
    # User Menu #
    #############
    "usermenu_links": [
        {
            "name": _("Support"),
            "url": "https://github.com/farridav/django-jazzmin/issues",
            "new_window": True,
            "icon": "far fa-question-circle",
        },
        {"model": "auth.user"},
    ],
    #############
    # Side Menu #
    #############
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "authtoken.tokenproxy": "fas fa-magic",
        "django_celery_results.groupresult": "far fa-object-group",
        "django_celery_results.taskresult": "fas fa-tasks",
        "django_rest_passwordreset.resetpasswordtoken": "fas fa-exchange-alt",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    #################
    # Related Modal #
    #################
    "related_modal_active": False,
    #############
    # UI Tweaks #
    #############
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    ###############
    # Change view #
    ###############
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    "language_chooser": True,
}

JAZZMIN_UI_TWEAKS = {
    "theme": "minty",
    "dark_mode_theme": "superhero",
}


ASGI_APPLICATION = "project.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}  # TODO USE REDIS ?


INTERNAL_IPS = ["*"]

BACKEND_NOTIFICATIONS_SECRET = os.environ.get(
    "BACKEND_NOTIFICATIONS_SECRET", str(uuid4())
)

REST_FRAMEWORK = {
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ]
}


CELERY_RESULT_BACKEND = "django-db"
CELERY_RESULT_EXTENDED = True

APPEND_SLASH = os.environ.get("APPEND_SLASH", "False")

# Custom Envs
ENT_WALLET_BACK_URL = os.environ.get("ENT_WALLET_BACK_URL", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS", "")
TOKENIZATION_SERVICE_URL = os.environ.get("TOKENIZATION_SERVICE_URL", "")
SESSION_EXPIRATION = os.environ.get("SESSION_EXPIRATION", 2)
BLOCK_EXPLORER_URL = os.environ.get("BLOCK_EXPLORER_URL", "")

# OpenAI Settings
AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_API_BASE = os.environ.get("AZURE_OPENAI_API_BASE", "")
AZURE_OPENAI_API_VERSION = os.environ.get("AZURE_OPENAI_API_VERSION", "")
VISION_LLM_MODEL = os.environ.get("VISION_LLM_MODEL", "")
CLASSIFICATION_LLM_MODEL = os.environ.get("CLASSIFICATION_LLM_MODEL", "")

# Pinata Settings
PINATA_URL = os.environ.get("PINATA_URL", "")
PINATA_GATEWAY_TOKEN = os.environ.get("PINATA_GATEWAY_TOKEN", "")
PINATA_SECRET_JWT = os.environ.get("PINATA_SECRET_JWT", "")

# Local Settings
try:
    from .settings_local import *
except ImportError:
    pass
