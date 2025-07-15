# SSITIZENS TOKENIZATION API SERVICE

## Instalation and Run

In order to be able to implement the project, the following steps must be taken and install previusly tools and versions:

Node 22.6
Npm 10.8
Ethers 6.13
Typescript 5.5

In order to run the services using docker or not, navigate to the root folder and run the following commands will show you how to run it locally:

### Local run

Install dependencies:

```bash
npm install
```

You need to define this ENVS in a .env local file:
```bash
DATABASE_URL="" # PostgreSQL DB connection string (E.g. postgresql://...)
SMART_CONTRACT_ADDRESS="" # Deployed smart contract address (E.g. 0x...)
BLOCKCHAIN_RPC_URL="" # RPC endpoint of the blockchain node (E.g. http://...)
ISSUER_PRIVATE_KEY="" # Private key of the issuer  (E.g. {"address":"07...)
BLOCKCHAIN_FIRST_BLOCK_INTERVAL_EVENT_INDEXER="" # Starting block number for event indexer (E.g. 1000)
BLOCKCHAIN_BLOCK_INTERVAL_EVENT_INDEXER="" # Block range size to query each iteration (E.g. 10)
TIME_INTERVAL_MILISECONDS_EVENT_INDEXER="" # Interval (ms) between each polling loop (E.g. 5000)
```

### Run locally without Docker

🟠 You will need to set an additional PostgreSQL and Redis service running


```bash
npm run start:without-docker
```

### Run locally hybrid
DB services running in Docker and main tokenization service in terminal/IDE (for develop and debugging)


```bash
npm run start
```

### Run locally all in Docker

```bash
docker compose up --build
```


If you want to stop and remove docker containers

```bash
docker compose down
```

### Check API Service

```bash
curl --location 'http://localhost:8080/api/system/health'
```

### Swagger Documentation

If you have deployed it locally you can see it in the Openapi/Swagger [here](http://localhost:8080/docs/). Or in the url that you have indicated by adding the path /docs.


### Documentation

You can find more information in /docs.

- **functionalities.md:** Provides an overview of the general functionalities implemented in the project, including key features such as token management, smart contract interaction, blockchain integration, authentication mechanisms, and health monitoring.

- **endpoints.md:** Detailed documentation of the API endpoints available in the project. Includes descriptions of system health checks, event retrieval (paginated and by transaction hash), balance queries (Ether and token balances), and JSON-RPC methods for interacting with smart contracts.

- **models.md:** Comprehensive documentation of the database models used in the project, specifically the `EVENTS_TABLE`. Includes information about fields (e.g., `id`, `hash`, `type`, `data`, `timestamp`, `block_number`, `gas_used`), relationships, supported operations (insert, delete, retrieve), and metadata for pagination.

---

## 📢 Credits

This project has received funding from the European Union's Horizon 2020 research and innovation programme within the framework of the LEDGER Project funded under grant agreement No825268.

<p align="center">
  <a href="https://www.ngi.eu" target="_blank">
    <img src="./assets/ngi-logo.png" alt="NGI Logo" style="height:80px; margin-right: 40px;"/>
  </a>
  <img src="./assets/eu-flag.png" alt="EU Flag" style="height:80px;"/>
</p>

Please, remember to link the NGI project logo to [www.ngi.eu](https://www.ngi.eu).