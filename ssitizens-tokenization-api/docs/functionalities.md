# SSITIZENS TOKENIZATION API SERVICE - Functionalities

## Key Features

1. **Token Management**:
   - Generate tokens with optional additional data.
   - Distribute tokens to individual addresses or in batches.
   - Redeem tokens from specific addresses.

2. **Smart Contract Interaction**:
   - Change the issuer of the smart contract.
   - Manage minimum transfer amounts and user balances.
   - Assign and unassign roles to parties with permissions and expiration dates.

3. **Blockchain Integration**:
   - Connect to blockchain nodes via RPC endpoints.
   - Handle events such as token transfers, redemptions, and ownership changes.
   - Support for EIP-1559 and legacy transaction types.

4. **Authentication**:
   - API key and JWT-based authentication mechanisms.
   - Validate claims and permissions using JSONPath.

5. **Health Monitoring**:
   - Check the health status of the API service.

6. **Balance Queries**:
   - Retrieve Ether and token balances for specific addresses.

7. **Configuration Management**:
   - Define environment variables for database connections, blockchain settings, and smart contract details.