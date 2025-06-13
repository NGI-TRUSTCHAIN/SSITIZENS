import { singleton } from "tsyringe";
import pg from 'pg';
import Logger from "@/shared/classes/logger.js";
import { SETTINGS } from "../../settings.js";

const { Pool } = pg;

export const EVENTS_TABLE = "events_metadata"

const EVENTS_TABLE_DDL =
    `
CREATE TABLE public.${EVENTS_TABLE} (
	id varchar NOT NULL,
	hash varchar NOT NULL,
	type varchar NOT NULL,
	data jsonb NULL,
	timestamp timestamp NOT NULL,
	block_number numeric NOT NULL,
	gas_used numeric NULL,
	CONSTRAINT ${EVENTS_TABLE}_pk PRIMARY KEY (id)
);
`

const HASH_INDEX_DDL = `CREATE INDEX hash_idx ON public.${EVENTS_TABLE} ("hash");`
const BLOCK_NUMBER_INDEX_DDL = `CREATE INDEX block_number_idx ON public.${EVENTS_TABLE} ("block_number","hash");`

// TODO: la parte de creación de tablas no debería estar aquí. Habría que implementar un mecanismo similar al de cargar rutas, de forma que la lógica
// de conexión esté en shared, y en core esté solo la creación de tablas, que es algo específico de la aplicación, no del framework base.
// Además hay que gestionar el versionado, por lo que hay que evaluar utilizar alguna librería o implementar algo.
@singleton()
export default class DbService {

    private pool;

    constructor(private logger: Logger,) {
        const conf = {
            connectionString: SETTINGS.database.url,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        } as pg.PoolConfig;
        if (SETTINGS.database.ssl == true) {
            conf.ssl = { rejectUnauthorized: false };
        }
        this.pool = new Pool(conf);
    }

    public async init() {
        //TODO: en un futuro habría que implementar un mecanismo de versionado de tablas, tal vez con django?
        const dbExists = await this.dbInitialized();
        if (!dbExists) {
            await this.initializeDb();
        }
    }

    private async dbInitialized() {
        const query = `SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '${EVENTS_TABLE}')`;
        const result = await this.query(query);
        const dbExists = result.rows[0].exists;
        this.logger.info("DB already initialized: " + dbExists);
        return dbExists;
    }

    private async initializeDb() {
        this.logger.info(`Creating ${EVENTS_TABLE} table`);
        await this.execute(EVENTS_TABLE_DDL);
        this.logger.info(`Creating indexes`);
        await this.execute(HASH_INDEX_DDL);
        await this.execute(BLOCK_NUMBER_INDEX_DDL);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async execute(query: string, values?: any[] | undefined) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(query, values);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async query(query: string, values?: any[] | undefined) {
        const client = await this.pool.connect();
        try {
            return await client.query(query, values);
        } catch (e) {
            throw e;
        } finally {
            client.release();
        }
    }

}