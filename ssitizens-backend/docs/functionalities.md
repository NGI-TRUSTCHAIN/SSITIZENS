# Views Functionalities Documentation

This document provides an overview of the functionalities implemented in the `views.py` file.

---

## Functionalities

### **1. Profile Management**
Handles CRUD operations for user profiles.

- **Endpoints**:
  - `GET`: Retrieve profiles based on user permissions.
  - `POST`: Create new profiles with validation for `beneficiary` and `store` types.
  - `PUT`: Update existing profiles with validation for `beneficiary` and `store` types.
  - `GET (retrieve)`: Fetch a single profile and update its balance.

---

### **2. Transaction Management**
Provides read-only access to transactions.

- **Endpoints**:
  - `GET`: Retrieve transactions based on user permissions.
  - Supports filtering and ordering by fields such as `timestamp`, `event`, `from_user`, `to_user`, `amount_tokens`, and `amount_ethers`.

---

### **3. Server-Sent Events (SSE)**
Handles real-time communication using Server-Sent Events.

- **Class**: `SSEConsumer`
  - **Features**:
    - Adds the client to a channel group for real-time updates.
    - Sends events to the client.
    - Handles disconnection.

---

### **4. SSI (Self-Sovereign Identity) Management**
Manages SSI-related operations, including QR code generation and verifiable presentation validation.

- **Endpoints**:
  - `GET /presentation-beneficiary-identity/qr`: Generate a QR code for beneficiary identity verification.
  - `GET /presentation-store-identity/qr`: Generate a QR code for store identity verification.
  - `POST /presentations/external-data`: Validate verifiable presentation data.
  - `GET /credentials/external-data`: Fetch credential data.
  - `POST /credentials/external-data`: Save credential data.
  - `GET /credential-offer/url`: Generate a deep link for credential offers.
  - `GET /credential-offer/qr`: Generate a QR code for credential offers.

---

### **5. Tokenization API**
Handles token generation and distribution.

- **Endpoints**:
  - `POST /generate`: Generate tokens.
  - `POST /distribute`: Distribute tokens to a specific profile.

---

### **6. Administrator Operations**
Provides administrative functionalities such as generating reports and fetching contract balances.

- **Endpoints**:
  - `GET /generate_pdf`: Generate a PDF report of transactions for a specific user within a date range.
  - `GET /balance`: Fetch the contract's balance.

---

## Notes

- **Authentication**:
  - Most endpoints use `SessionAuthentication`, `BasicAuthentication`, and `JWTAuthentication`.
  - Permissions are enforced based on user roles and session validity.

- **Validation**:
  - Extensive validation is performed for profile creation and updates.
  - Verifiable presentation data is validated before processing.

- **Integration**:
  - Integrates with external services for SSI and tokenization operations.
  - Uses `weasyprint` for PDF generation.

- **Real-Time Communication**:
  - SSE is used for real-time updates to clients.

---