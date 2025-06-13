# Ssitizens-Backend

## 1. Services

### Backend

This project provides a Backoffice for Ssitizens project.

## 2. Requirements

- Python 3.12
- You can install all the requirements with:

```bash
pip install -r requirements.txt
or
pip3 install -r requirements.txt
```

## 3. Deployment

To deploy this repo locally, you need to follow these steps

### step-0

The following environment variables are used in the project. Ensure they are properly configured in your environment.

### Backend Configuration
- **`BACKEND_DOMAIN`**: The domain for the backend service.

- **`DEBUG`**: Debug mode (1 for enabled, 0 for disabled).
  - Example: `1`
- **`CONTRACT_ADDRESS`**: Blockchain contract address.
  - Example: `0xBd3E2971e62195E4a2Ef20c0036f31d0bBB025cF`
- **`DEFAULT_FROM_EMAIL`**: Default email address for outgoing emails.
- - **`POSTMARK_API_KEY`**: Default api key for send emails.

- **`ENT_WALLET_BACK_URL`**: URL for Enterprise Wallet backend service. This is needed for SSI service, it generates Verifiable Credentials to log in at Front side.

- **`TOKENIZATION_SERVICE_URL`**: URL for the tokenization service.
- **`BLOCK_EXPLORER_URL`**: URL for the block explorer view.

### Azure OpenAI Configuration
- **`AZURE_OPENAI_API_BASE`**: Base URL for Azure OpenAI API.
  - Example: `https://your-resource-name.cognitiveservices.azure.com`
- **`AZURE_OPENAI_API_KEY`**: API key for Azure OpenAI.
- **`AZURE_OPENAI_API_VERSION`**: Version of the Azure OpenAI API.
  - Example: `2024-06-01-preview`
- **`VISION_LLM_MODEL`**: Vision model for Azure OpenAI.
  - Example: `gpt-4.1-mini`
- **`CLASSIFICATION_LLM_MODEL`**: Classification model for Azure OpenAI.
  - Example: `gpt-4.1-mini`
  -
### Pinata Configuration (IPFS)
- **`PINATA_URL`**: Base URL for Pinata endpoint.
  - Example: `https://app.pinata.cloud`
- **`PINATA_GATEWAY_TOKEN`**: API key for Pinata.
- **`PINATA_SECRET_JWT`**: JWT for Pinata.

### CORS Configuration
- **`CORS_ORIGIN_ALLOW_ALL`**: Allow all origins for CORS.
  - Example: `True`


### step-1

The backend runs in Docker. We need to have docker (docker-engine) and docker-compose installed

To build Docker images (remember that you have to do this everytime you add a new dependency to Pipfile too)

```bash
docker compose build
```

### step-2

The first time we start the project locally it will be necessary to migrate the data and create a superuser

```bash
docker compose run --rm backend python manage.py migrate
docker compose run --rm backend python manage.py createsuperuser
```

If you run with docker compose, those commands are included in entrypoint.sh file.

### step-3

Start everything (redis, postgress, server, celery and rest of things written in docker-compose.yml)

```bash
docker compose up --build
```


## 4. How to use

### 4.1 Ticket processing endpoint

---

 Endpoint

**POST** `/ticket_processing/upload/`

---

#### Description

Uploads one or more receipt images for automated processing. The service will return the total payment amount, the portion eligible for aid, and a breakdown of each aid-eligible product.

---

#### Request

- **Content-Type:** `multipart/form-data`

#### Form Data Parameters

| Field    | Type   | Description                                                                              |
| -------- | ------ | ---------------------------------------------------------------------------------------- |
| `aid_id` | string | Dummy field; may be any value (for now).                                                 |
| `images` | file[] | One or more image files of receipts. Supported formats: JPEG, PNG, WEBP, Non-animatd GIF |

#### Response


| Field                   | Type   | Description                                       |
| ----------------------- | ------ | ------------------------------------------------- |
| `payment_amount`        | string | Total amount paid (same currency as the receipt). |
| `aid_amount`            | string | Portion of the payment eligible for aid.          |
| `aid_products`          | array  | List of products counted toward the aid amount.   |
| • `product_name`        | string | Name of the aid-eligible product.                 |
| • `product_total_price` | string | Total price of that product line.                 |

Example:

```json
{
  "payment_amount": "19.61",
  "aid_amount": "12.10",
  "aid_products": [
    {
      "product_name": "LECHE ENTERA",
      "product_total_price": "2.73"
    },
    {
      "product_name": "CAFE MOLIDO MEZCLA",
      "product_total_price": "1.6"
    },
    {
      "product_name": "ROLLO HOGAR DOBLE",
      "product_total_price": "4.7"
    },
    {
      "product_name": "BANANA",
      "product_total_price": "1.16"
    },
    {
      "product_name": "BANANA",
      "product_total_price": "1.91"
    }
  ]
}
```

#### 5. Documentation

You can find more information in /docs.

- **functionalities.md:** Provides an overview of the general functionalities implemented in the project, including key features and workflows.

- **models.md:** Detailed documentation of the database models used in the project, including fields, relationships, and notes about their implementation.

- **openapi.yaml:** Contains the OpenAPI specification for the project's API, including endpoint definitions, request/response formats, and authentication methods.

- **tasks.md:** Documentation of the task management system, including scheduled jobs, event processing, and token distribution tasks.

- **ticket_processing/functionalities.md:** Focused documentation on the ticket processing module, detailing image upload, aid management, and helper functions for processing tickets.