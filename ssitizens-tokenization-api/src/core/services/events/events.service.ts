import { autoInjectable, singleton } from "tsyringe";
import DbPool, { EVENTS_TABLE } from "@/services/db.service.js";
import Logger from "@/shared/classes/logger.js";

interface Event {
    id: string;
    hash: string;
    type: string;
    data: any;
    timestamp: Date;
    block_number: number;
    gas_used: number;
}

interface PaginatedEvents {
    metadata: {
        total: number;
        next_page: string | null;
        page_size: number;
    };
    events: Array<{
        index: number;
        id: string;
        hash: string;
        type: string;
        data: any;
        timestamp: string;
        block_number: number;
        gas_used: number;
    }>;
}

interface EventByTxHash {
    id: string;
    hash: string;
    type: string;
    data: any;
    timestamp: string;
    block_number: number;
    gas_used: number;
}

// TODO: pensar si hacer una clase genérica
@singleton()
@autoInjectable()
export default class EventsService {
    constructor(private pool: DbPool, private logger: Logger) { }

    public async add(event: Event) {
        const query = `
            INSERT INTO ${EVENTS_TABLE}
            (id, hash, type, data, timestamp, block_number, gas_used)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        `;

        await this.pool.execute(query, [
            event.id,
            event.hash,
            event.type,
            event.data,
            event.timestamp,
            event.block_number,
            event.gas_used
        ]);
    }

    public async deleteAll() {
        const query = `DELETE FROM ${EVENTS_TABLE}`;
        await this.pool.execute(query);
    }

    public async getEvents(index: number = 0, size: number = 10): Promise<PaginatedEvents> {
        // Validar parámetros
        if (index < 0) {
            throw new Error("El índice debe ser mayor o igual a 0");
        }
        if (size < 1 || size > 100) {
            throw new Error("El tamaño de página debe estar entre 1 y 100");
        }

        // Obtener el total de eventos
        const countQuery = `SELECT COUNT(*) FROM ${EVENTS_TABLE}`;
        const countResult = await this.pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

        // Obtener los eventos paginados usando el index como offset
        const query = `
            SELECT * FROM ${EVENTS_TABLE}
            ORDER BY timestamp ASC, id ASC
            LIMIT $1 OFFSET $2
        `;
        const result = await this.pool.query(query, [size, index]);

        // Construir la URL de la siguiente página
        const nextPage = index + size < total ? `/api/events?index=${index + size}&size=${size}` : null;

        // Transformar los datos manteniendo el ID original y añadiendo el índice secuencial
        const transformedEvents = result.rows.map((row, idx) => ({
            index: index + idx,
            id: row.id,
            hash: row.hash,
            type: row.type,
            data: row.data,
            timestamp: row.timestamp.toISOString(),
            block_number: row.block_number,
            gas_used: row.gas_used
        }));

        return {
            metadata: {
                total,
                next_page: nextPage,
                page_size: size
            },
            events: transformedEvents
        };
    }

    public async getEventsByTxHash(txHash: string): Promise<EventByTxHash[]> {
        const query = `
            SELECT * FROM ${EVENTS_TABLE}
            WHERE hash = $1
            ORDER BY timestamp ASC
        `;
        const result = await this.pool.query(query, [txHash]);

        if (result.rows.length === 0) {
            throw new Error("No se encontraron eventos para la transacción especificada");
        }

        return result.rows.map(row => ({
            id: row.id,
            hash: row.hash,
            type: row.type,
            data: row.data,
            timestamp: row.timestamp.toISOString(),
            block_number: row.block_number,
            gas_used: row.gas_used
        }));
    }
}
