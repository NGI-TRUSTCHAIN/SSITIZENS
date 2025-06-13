/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test, describe, beforeAll } from '@jest/globals';
import { ethers, Signer, Wallet } from "ethers";
import Logger from "@/shared/classes/logger.js";
import { RpcServiceEIP1559 } from "@/services/rpc/rpc.service.js";
import { SETTINGS } from '@/settings.js';
import { getSmartContract } from '@/services/rpc/rpc.utils.js';

async function getTransactionCount(signer: Signer | undefined): Promise<number> {
    if (!signer) throw new Error("Signer is undefined");
    const address: string = await signer.getAddress();
    const provider: ethers.Provider | null = signer.provider
    if (!provider) throw new Error("Signer has no provider");
    return await provider.getTransactionCount(address);
}
process.env.appRoot = "./src";
let rpcService: RpcServiceEIP1559;
let logger: Logger;
describe("Rpc Service", () => {
    let sitizenTest: Signer | undefined;
    let sitizenTestAddress: string = "";
    let storeTest: Signer | undefined;
    let storeTestAddress: string = "";
    let issuer: Signer;
    let deployer: Signer | undefined;


    beforeAll(async () => {
        logger = new Logger;
        rpcService = new RpcServiceEIP1559(logger);
        // SETTINGS.blockchain_url = "http://localhost:8545";
        // SETTINGS.sc_address = "0xDAF342782AdCD088774771EEBDA94EF5f2a60f1F";
        console.log(SETTINGS.blockchain_url, SETTINGS.sc_address);
        issuer = await ethers.Wallet.fromEncryptedJson(JSON.stringify(SETTINGS.issuer_private_key!), "");
        console.log(issuer.getAddress());
        // const contract = getSmartContract(issuer);
        sitizenTest = Wallet.fromPhrase("girl raccoon goose chest define afford end siren tomato citizen check exercise");
        sitizenTestAddress = await sitizenTest.getAddress();
        logger.info(`address: ${sitizenTestAddress}`);
        storeTest = Wallet.fromPhrase("jelly token purse benefit tiny joke report tired dwarf enjoy fun lesson");
        storeTestAddress = await storeTest.getAddress();
        logger.info(`address: ${storeTestAddress}`);
    });

    describe("Service", () => {
        describe("Error Not Found Method", () => {
            test("Error 404", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "notMethod",
                        "params": {
                            "quantity": 10,
                            "additionalData": "Additional information"
                        },
                        "id": "1"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    expect(response.status).toBe(404);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(404);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

        });

        describe("Generate Tokens", () => {

            test("Error Parameter", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "generateTokens",
                        "params": {
                            "quantity": -10
                        },
                        "id": "1"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(400);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(400);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correct generation", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "generateTokens",
                    "params": {
                        "quantity": 10
                    },
                    "id": "1"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });

        });
        describe("Add Party", () => {

            test("Error Parameter", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "assignRole",
                        "params": {
                            "addr": sitizenTestAddress,
                            "role": 1,
                            "exp": 0,
                            "attachedData": "1"
                        },
                        "id": "1"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(500);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(500);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correctly added Sitizen", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "assignRole",
                    "params": {
                        "addr": sitizenTestAddress,
                        "role": 1,
                        "exp": Math.floor(Date.now() / 1000) + (15 * 60),
                        "attachedData": "1"
                    },
                    "id": "1"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });
            test("Correctly added Store", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "assignRole",
                    "params": {
                        "addr": storeTestAddress,
                        "role": 2,
                        "exp": Math.floor(Date.now() / 1000) + (15 * 60)
                    },
                    "id": "1"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });

        });
        describe("Distribute Tokens", () => {
            test("Error Parameter to", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "distributeTokens",
                        "params": {
                            "to": sitizenTestAddress + "00",
                            "quantity": 1
                        },
                        "id": "2"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(400);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(400);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correct distribution", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "distributeTokens",
                    "params": {
                        "to": sitizenTestAddress,
                        "quantity": 1,
                        // "additionalData": "Additional information"
                    },
                    "id": "2"
                };

                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });

        });

        describe("Distribute Tokens Batch", () => {
            test("Error Parameter to", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "distributeTokensInBatch",
                        "params": {
                            "toBatch": [
                                "0x00"
                            ],
                            "quantityBatch": [
                                10
                            ]
                        },
                        "id": "2"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(400);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(400);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correct distribution", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "distributeTokensInBatch",
                    "params": {
                        "toBatch": [
                            sitizenTestAddress,

                        ],
                        "quantityBatch": [
                            10,

                        ]
                    },
                    "id": "2"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });

        });
        describe("Force Redeem Tokens", () => {
            test("Error Parameter to", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "forceTokenRedemption",
                        "params": {
                            "addr": "0x00",
                            "quantity": 1
                        },
                        "id": "2"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(400);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(400);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correct redeem", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "forceTokenRedemption",
                    "params": {
                        "addr": sitizenTestAddress,
                        "quantity": 1
                    },
                    "id": "2"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();



            });
        });
        describe("Remove Party", () => {

            test("Error Parameter", async () => {
                try {
                    const schema = {
                        "jsonrpc": "2.0",
                        "method": "unassignRole",
                        "params": {
                            "addr": "0x00",
                        },
                        "id": "1"
                    };
                    const response = await rpcService.rpcHandlerService(schema);
                    console.log(response);
                    expect(response.status).toBe(400);
                } catch (error: any) {
                    console.log(error);
                    expect(error.status).toBe(400);
                    expect(error).toBeDefined();
                    expect(error.result).toBeDefined();
                }
            });

            test("Correctly removed Sitizen", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "unassignRole",
                    "params": {
                        "addr": sitizenTestAddress,
                    },
                    "id": "16"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });
            test("Correctly removed Store", async () => {
                const schema = {
                    "jsonrpc": "2.0",
                    "method": "unassignRole",
                    "params": {
                        "addr": storeTestAddress,
                    },
                    "id": "17"
                };
                const response = await rpcService.rpcHandlerService(schema);
                expect(response.status).toBe(200);
                expect(response.result).toBeDefined();
                expect(response.result.result.hash).toBeDefined();

            });


        });
        });
    });