# SSITIZENS TOKENIZATION API SERVICE - Database Model

## Events Table

### Table Name
`EVENTS_TABLE`

### Description
The `EVENTS_TABLE` stores blockchain events emitted by smart contracts. Each event contains metadata and details about the transaction and block in which it occurred.

---

### Columns

| Column Name     | Data Type   | Description                                                                 |
|------------------|-------------|-----------------------------------------------------------------------------|
| `id`            | `string`    | Unique identifier for the event.                                            |
| `hash`          | `string`    | Transaction hash associated with the event.                                 |
| `type`          | `string`    | Type of the event (e.g., token transfer, redemption).                       |
| `data`          | `json`      | JSON object containing additional data related to the event.                |
| `timestamp`     | `timestamp` | Timestamp when the event was emitted.                                       |
| `block_number`  | `integer`   | Block number in which the event was included.                               |
| `gas_used`      | `integer`   | Amount of gas used for the transaction that emitted the event.              |

---

### Example Row

| `id`            | `hash`                              | `type`         | `data`                | `timestamp`          | `block_number` | `gas_used` |
|------------------|-------------------------------------|----------------|-----------------------|-----------------------|----------------|------------|
| `event123`       | `0xabc123...`                      | `Transfer`     | `{ "from": "...", "to": "...", "value": 100 }` | `2025-06-05T12:00:00Z` | `123456`       | `21000`    |

---

### Relationships
- **Transaction Hash (`hash`)**: Links events to specific blockchain transactions.
- **Block Number (`block_number`)**: Links events to specific blocks in the blockchain.

---

### Operations Supported

1. **Insert Event**:
   - Add a new event to the table.
   - Example query:
     ```sql
     INSERT INTO EVENTS_TABLE (id, hash, type, data, timestamp, block_number, gas_used)
     VALUES ($1, $2, $3, $4, $5, $6, $7);
     ```

2. **Delete All Events**:
   - Remove all events from the table.
   - Example query:
     ```sql
     DELETE FROM EVENTS_TABLE;
     ```

3. **Paginated Event Retrieval**:
   - Retrieve events with pagination.
   - Example query:
     ```sql
     SELECT * FROM EVENTS_TABLE
     ORDER BY timestamp ASC, id ASC
     LIMIT $1 OFFSET $2;
     ```

4. **Retrieve Events by Transaction Hash**:
   - Fetch events associated with a specific transaction hash.
   - Example query:
     ```sql
     SELECT * FROM EVENTS_TABLE
     WHERE hash = $1
     ORDER BY timestamp ASC;
     ```

---

### Metadata for Pagination

The `getEvents` method provides metadata for paginated results:
- **Total Events**: Total number of events in the table.
- **Next Page URL**: URL to fetch the next page of results.
- **Page Size**: Number of events returned in the current request.

---

### Example Usage in Code

#### Insert Event
```typescript
await pool.execute(`
    INSERT INTO EVENTS_TABLE (id, hash, type, data, timestamp, block_number, gas_used)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`, [event.id, event.hash, event.type, event.data, event.timestamp, event.block_number, event.gas_used]);
```

#### Retrieve Paginated Events
```typescript
const result = await pool.query(`
    SELECT * FROM EVENTS_TABLE
    ORDER BY timestamp ASC, id ASC
    LIMIT $1 OFFSET $2
`, [size, index]);
```

#### Retrieve Events by Transaction Hash
```typescript
const result = await pool.query(`
    SELECT * FROM EVENTS_TABLE
    WHERE hash = $1
    ORDER BY timestamp ASC
`, [txHash]);
```