# SSITIZENS TOKENIZATION API SERVICE - Endpoints

## API Endpoints

### System
- **Health Check**: `/api/system/health`
  - **Description**: Returns the health status of the API service.

### Events
- **Retrieve Contract Events**: `/api/events`
  - **Description**: Retrieve stored contract events with pagination.
  - **Parameters**:
    - `index`: Starting index for events (default: 0).
    - `size`: Number of events per page (default: 10, max: 100).
- **Retrieve Events by Transaction Hash**: `/api/events/{tx_hash}`
  - **Description**: Retrieve events associated with a specific transaction hash.

### Balance
- **Retrieve Ether and Token Balances**: `/api/balance/all/{address}`
  - **Description**: Get both Ether and token balances for a specific address.
- **Retrieve Ether Balance**: `/api/balance/ethers/{address}`
  - **Description**: Get Ether balance for a specific address.
- **Retrieve Token Balance**: `/api/balance/tokens/{address}`
  - **Description**: Get token balance for a specific address.

### RPC
- **JSON-RPC Interface**: `/rpc`
  - **Description**: Interact with smart contracts using JSON-RPC methods.
  - **Supported Methods**:
    - `generateTokens`: Generate tokens as an issuer.
    - `distributeTokens`: Distribute tokens to specific users.
    - `distributeTokensInBatch`: Distribute tokens to multiple users in batches.
    - `forceTokenRedemption`: Force token redemption for a user.
    - `assignRole`: Assign roles to users.
    - `unassignRole`: Revoke roles from users.