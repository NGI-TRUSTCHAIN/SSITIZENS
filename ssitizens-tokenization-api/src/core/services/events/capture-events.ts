import "reflect-metadata";
import { container } from "tsyringe";
import { EventCaptureStore } from "./event-capture-store.js";
import { ethers } from "ethers";
import { SETTINGS } from "@/settings.js";

async function firstCaptureEvents() {

    try {
        console.log("Starting initial event capture...");

        const provider = ethers.getDefaultProvider(SETTINGS.blockchain_url);
        const toBlock = await provider.getBlockNumber();
        // Al iniciar con 10.000 bloques de antiguedad, que es el maximo del free ier del RPC que utilizamos
        const fromBlock = (toBlock - (SETTINGS.first_block_interval_event_indexer || 10000)) < 0 ? 0 : (toBlock - (SETTINGS.first_block_interval_event_indexer || 10000));
        console.log("first_block_interval_event_indexer: ", SETTINGS.first_block_interval_event_indexer);
        const eventCapture = container.resolve(EventCaptureStore);
        await eventCapture.captureAndStoreEvents(fromBlock, toBlock);

        console.log('Initial capture completed successfully');
    } catch (error) {
        console.error('Error at initial capture:', error);
    } finally {
        isRunning = false;
    }
}

firstCaptureEvents().then(() => {
    console.log("event capture service initialized");
}).catch((error) => {
    console.error("Error at start initial service:", error);
});

let isRunning = false;
export async function captureEvents() {
    if (isRunning) {
        console.log("Already capture service in progress, skipping execution...");
        return;
    }

    try {
        isRunning = true;
        console.log("Starting event capture process...");

        const provider = ethers.getDefaultProvider(SETTINGS.blockchain_url);
        const toBlock = await provider.getBlockNumber();
        const fromBlock = (toBlock - (SETTINGS.block_interval_event_indexer || 10)) < 0 ? 0 : (toBlock - (SETTINGS.block_interval_event_indexer || 10));
        const eventCapture = container.resolve(EventCaptureStore);
        await eventCapture.captureAndStoreEvents(fromBlock, toBlock);

        console.log('Event capture completed successfully');
    } catch (error) {
        console.error('Error in process:', error);
    } finally {
        isRunning = false;
    }
}

console.log("block_interval_event_indexer: ", SETTINGS.block_interval_event_indexer);
console.log("Starting event capture every " + (SETTINGS.time_interval_miliseconds_event_indexer) + " miliseconds");
setInterval(captureEvents, SETTINGS.time_interval_miliseconds_event_indexer);

process.on('SIGINT', () => {
    console.log('Stopping event capture service...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Stopping event capture service...');
    process.exit(0);
});
