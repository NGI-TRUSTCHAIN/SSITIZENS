# Ticket Processing Views Documentation

This document provides an overview of the functionalities implemented in the `ticket_processing/views.py` file.

---

## Functionalities

### **1. Image Upload and Processing**
Handles the upload and processing of images for ticket validation.

#### Function: `upload_images`
- **Description**:
  - Uploads one or more images and processes them using Azure OpenAI services.
  - Validates the images against aid products and calculates aid totals.

- **Parameters**:
  - `aid_id`: Identifier for the aid.
  - `images`: List of images (JPEG, PNG, WEBP, static GIF).

- **Steps**:
  1. Validate the input data using `TicketUploadSerializer`.
  2. Fetch the aid object using the provided `aid_id`.
  3. Encode images in Base64 format.
  4. Process images using Azure OpenAI's Vision model.
  5. Fetch aid products associated with the aid.
  6. Process ticket data using Azure OpenAI's Classification model.
  7. Parse ticket records and calculate totals.
  8. Return the aid amount, payment amount, and aid products.

- **Response**:
  - `200`: Successful processing.
  - `400`: Invalid input data.
  - `404`: Aid or products not found.
  - `500`: Error during processing.

---

### **2. Aid Management**
Provides a view for listing aids.

#### Class: `AidsView`
- **Description**:
  - Lists all aids for superusers.
  - Restricts access for non-superusers.

- **Endpoints**:
  - `GET`: Retrieve a list of aids.

- **Authentication**:
  - Requires `SessionAuthentication`, `BasicAuthentication`, or `JWTAuthentication`.

- **Permissions**:
  - Only superusers can access this view.

---

### **3. Helper Functions**
Various utility functions used for image and ticket processing.

#### Function: `base64_encode_images`
- Encodes a list of images in Base64 format.

#### Function: `prepare_chat_messages`
- Prepares chat messages for Azure OpenAI models.

#### Function: `call_json_completion_model`
- Calls Azure OpenAI's JSON completion model and parses the response.

#### Function: `parse_ticket_record`
- Parses a ticket record into a structured `TicketRecord` object.

#### Function: `process_ticket_total`
- Calculates the total aid amount and payment amount from ticket records.

#### Function: `process_ticket_products`
- Extracts aid products from ticket records.

#### Function: `print_ticket_product_list`
- Logs the ticket product list in a formatted manner.

#### Function: `get_aid_products_list`
- Retrieves the list of products associated with an aid.

#### Function: `add_products_to_aid_prompt`
- Formats aid products into a structured prompt for Azure OpenAI models.

---

## Notes

- **Integration**:
  - Uses Azure OpenAI services for image and data processing.
  - Fetches aid data from the database using Django ORM.

- **Validation**:
  - Ensures proper input data validation using serializers.
  - Validates ticket records for correct structure and data types.

- **Authentication**:
  - Requires authentication for all endpoints.
  - Supports `SessionAuthentication`, `BasicAuthentication`, and `JWTAuthentication`.

- **Error Handling**:
  - Handles errors gracefully and provides meaningful responses for invalid inputs or processing failures.

---