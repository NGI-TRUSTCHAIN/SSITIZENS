import { ethers } from "ethers";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { singleton } from "tsyringe";
import DbPool, { EVENTS_TABLE } from "../db.service.js";

@singleton()
export class EventCaptureStore {
    private contract: ethers.Contract;
    private provider: ethers.JsonRpcProvider;

    constructor(private pool: DbPool) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileRead = join(__dirname, '../../../core/contracts/izToken.json');
        const contractJson = JSON.parse(readFileSync(fileRead, 'utf8'));
        const abi = contractJson.abi;
        const rpc = process.env.BLOCKCHAIN_RPC_URL;
        this.provider = new ethers.JsonRpcProvider(rpc);
        const contractAddress = process.env.SMART_CONTRACT_ADDRESS || '';
        this.contract = new ethers.Contract(contractAddress, abi, this.provider);
    }

    async storeEvent(eventData: any, blockNumber: number, txHash: string, eventName: string, gasUsed: bigint) {
        const event = {
            id: `${txHash}_${eventName}`,
            hash: txHash,
            type: eventName,
            data: eventData,
            timestamp: new Date(),
            block_number: blockNumber,
            gas_used: gasUsed.toString()
        };

        const query = `
            INSERT INTO ${EVENTS_TABLE}
            (id, hash, type, data, timestamp, block_number, gas_used)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
        `;

        try {
            await this.pool.execute(query, [
                event.id,
                event.hash,
                event.type,
                event.data,
                event.timestamp,
                event.block_number,
                event.gas_used
            ]);
            console.log(`Event ${eventName} stored successfully.`);
        } catch (error) {
            console.error(`Error at try to store: ${eventName}:`, error);
            throw error;
        }
    }

    async captureAndStoreEvents(fromBlock: number, toBlock: number) {
        console.log(`Searching from block ${fromBlock} to ${toBlock}`);

        try {
            const allEventFilters = this.contract.interface.fragments.filter(
                fragment => fragment.type === "event"
            );

            for (const eventName of allEventFilters) {
                const eventFragment = this.contract.interface.getEvent((eventName as ethers.EventFragment)?.name);
                
                if (!eventFragment?.name) {
                    console.warn(`Event ${eventName} not found, looking next one...`);
                    continue;
                }

                const filter = await this.contract.filters[eventFragment.name]();
                const logs = await this.contract.queryFilter(filter, fromBlock, toBlock);

                // console.log(`${eventFragment.name} — encontrados: ${logs.length} eventos`);

                for (const log of logs) {
                    const parsed = this.contract.interface.parseLog(log);
                    if (!parsed) continue;

                    const receipt = await this.provider.getTransactionReceipt(log.transactionHash);
                    const gasUsed = receipt?.gasUsed || 0n;

                    const eventData: Record<string, string> = {};
                    parsed.args.forEach((arg: any, index: number) => {
                        const paramName = eventFragment.inputs[index]?.name || `param${index}`;
                        eventData[paramName] = arg?.toString() || arg;
                    });

                    await this.storeEvent(
                        eventData,
                        log.blockNumber,
                        log.transactionHash,
                        parsed.name,
                        gasUsed
                    );
                }
            }
            
        } catch (err) {
            console.error("Error fetching events:", err);
            throw err;
        }
    }
} 