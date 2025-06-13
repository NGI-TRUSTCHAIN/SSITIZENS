# Database Models Documentation

This document provides an overview of the database models used in the project.

---

## Models

### 1. **Profile**
Represents a user profile in the system.

- **Fields**:
  - `id`: Unique identifier for the profile.
  - `email`: Email address of the user.
  - `address`: Blockchain address associated with the user.
  - `type`: Type of profile (e.g., store, beneficiary).
  - `data`: JSON field containing additional data.
  - `aid_type`: Foreign key to the `Aid` model.
  - `terms_accepted`: Boolean indicating whether terms are accepted.
  - `active_since`: Date when the profile became active.
  - `active_until`: Date when the profile will be inactive.
  - `balance_tokens`: Token balance of the user.
  - `balance_ethers`: Ether balance of the user.

---

### 2. **Transaction**
Represents a blockchain transaction.

- **Fields**:
  - `id`: Unique identifier for the transaction.
  - `event`: Type of event associated with the transaction.
  - `from_user`: Foreign key to the `Profile` model (sender).
  - `to`: Foreign key to the `Profile` model (receiver).
  - `amount_tokens`: Amount of tokens transferred.
  - `amount_ethers`: Amount of ethers transferred.
  - `data`: JSON field containing additional transaction data.
  - `hash`: Transaction hash.
  - `timestamp`: Timestamp of the transaction.

---

### 3. **PreCodes**
Represents pre-generated codes for users.

- **Fields**:
  - `pre_code`: Unique pre-code identifier.
  - `user`: Foreign key to the `Profile` model.

---

### 4. **UserIdentification**
Represents user identification sessions.

- **Fields**:
  - `session_id`: Unique session identifier.
  - `state`: State of the session.
  - `user`: Foreign key to the `Profile` model.
  - `expiration`: Expiration date of the session.

---

### 5. **IssuedVerifiableCredential**
Represents issued verifiable credentials.

- **Fields**:
  - `status`: Boolean indicating revocation status.
  - `vc_id`: Unique identifier for the credential.
  - `vc_type`: Type of the credential.
  - `did`: Decentralized identifier of the holder.
  - `issuance_date`: Date when the credential was issued.

---

### 6. **Register**
Represents key-value pairs for system-wide settings.

- **Fields**:
  - `key`: Key name.
  - `value`: Value associated with the key.

---

### 7. **Product**
Represents products associated with aids.

- **Fields**:
  - `id`: Unique identifier for the product.
  - `name`: Name of the product.
  - `additional_information`: Additional information about the product.

---

### 8. **Aid**
Represents aids provided to beneficiaries.

- **Fields**:
  - `id`: Unique identifier for the aid.
  - `name`: Name of the aid.
  - `products`: Many-to-many relationship with the `Product` model.

---

## Relationships

- **Profile**:
  - Related to `Aid` via `aid_type`.
  - Related to `Transaction` via `from_user` and `to`.

- **Transaction**:
  - Related to `Profile` via `from_user` and `to`.

- **PreCodes**:
  - Related to `Profile` via `user`.

- **UserIdentification**:
  - Related to `Profile` via `user`.

- **IssuedVerifiableCredential**:
  - Independent model.

- **Product**:
  - Related to `Aid` via `products`.

- **Aid**:
  - Related to `Product` via `products`.

---

## Notes

- All models use Django's ORM for database interactions.
- Foreign key relationships ensure data integrity across models.