import { autoInjectable, singleton } from "tsyringe";
import { ethers, Signer } from "ethers";
import Logger from "@/shared/classes/logger.js";
import { AssignRole, DistributeTokens, DistributeTokensInBatch, ForceTokenRedemption, GenerateTokens, RpcSchema, UnassignRole } from "@/api/rpc/rpc.interface.js";
import { generateRpcErrorResponse, generateRpcOkResponse, getSmartContract } from "./rpc.utils.js";
import { RpcMethodNotFound } from "@/shared/classes/errors.js";
import { SETTINGS } from "@/settings.js";


@singleton()
@autoInjectable()
export class RpcServiceEIP1559 {
    constructor(private logger: Logger) { }
    overrides = { maxPriorityFeePerGas: 1, gasLimit: 400000 };
    rpcHandlerService = async (rpc: RpcSchema) => {
        let response: any;
        const signer: Signer = await ethers.Wallet.fromEncryptedJson(JSON.stringify(SETTINGS.issuer_private_key!), "");
        const contract = getSmartContract(signer);

        try {
            let params;
            switch (rpc.method) {
                case "generateTokens":
                    params = rpc.params as GenerateTokens;
                    response = await contract.generate(ethers.parseUnits(params.quantity.toString(), "ether"), (params.additionalData != undefined ? Buffer.from(params.additionalData!) : "0x00"), this.overrides);
                    break;
                case "distributeTokens":
                    params = rpc.params as DistributeTokens;
                    response = await contract.distribute(params.to, ethers.parseUnits(params.quantity.toString(), "ether"), (params.additionalData! ? Buffer.from(params.additionalData!) : "0x00"), this.overrides);
                    break;
                case "distributeTokensInBatch":
                    params = rpc.params as DistributeTokensInBatch;
                    const ethersBatch = params.quantityBatch.map((quantity) => ethers.parseUnits(quantity.toString(), "ether"));
                    response = await contract.distributeBatch(params.toBatch, ethersBatch, this.overrides);
                    break;
                case "forceTokenRedemption":
                    params = rpc.params as ForceTokenRedemption;
                    response = await contract.controllerRedeem(params.addr, ethers.parseUnits(params.quantity.toString(), "ether"), (params.additionalData! ? Buffer.from(params.additionalData!) : "0x00"), (params.operatorData! ? Buffer.from(params.operatorData!) : "0x00"), this.overrides);
                    break;
                case "assignRole":
                    params = rpc.params as AssignRole;
                    response = await contract.addParty(params.addr, params.role, params.exp, (params.attachedData! ? Buffer.from(params.attachedData!) : "0x00"), this.overrides);
                    break;
                case "unassignRole":
                    params = rpc.params as UnassignRole;
                    response = await contract.removeParty(params.addr, this.overrides);
                    break;
                default:
                    return { status: 404, result: generateRpcErrorResponse(new RpcMethodNotFound(), rpc.id) };

            }
        } catch (error: any) {
            console.log(error);
            let code;
            switch (error.code) {
                case "Method not found":
                    code = 404;
                    break;
                case "Invalid Request":
                    code = 400;
                    break;
                case "INVALID_ARGUMENT":
                    code = 400;
                    break;
                case "UNCONFIGURED_NAME":
                    code = 400;
                    break;
                case "Internal error":
                    code = 500;
                    break;
                case "CALL_EXCEPTION":
                    code = 500;
                    break;
                case "Server error":
                    code = 500;
                    break;
                case "UNKNOWN_ERROR":
                    code = 500;
                    break;
            }
            const response = generateRpcErrorResponse(error, rpc.id);
            return { status: code, result: response };
            // } else if (error instanceof ExecutionFailed) {
            //     const response = generateRpcErrorResponse(new RpcInternalError(error.message), rpc.id);
            //     return { status: 500, result: response };
            // } else if (error instanceof InvalidParameters) {
            //     const response = generateRpcErrorResponse(new RpcInvalidParams(error.message), rpc.id);
            //     return { status: 400, result: response };
            // }
            // return { status: code, result: generateRpcErrorResponse(error, rpc.id) };
        }
        this.logger.debug("RPC Method has finished execution");
        return { status: 200, result: generateRpcOkResponse(response, rpc.id) };
    }

}

@singleton()
@autoInjectable()
export class RpcServiceLegacy {
    private overrides: any;
    constructor(private logger: Logger) { }
    private async buildOverrides(signer: Signer): Promise<any> {
        if (!signer.provider) {
            throw new Error("Signer provider is not set");
        }
        const feeData = await signer.provider.getFeeData();
        this.overrides = {
            gasLimit: 300000, // Establecer un gasLimit por defecto
        };
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            this.overrides.maxFeePerGas = feeData.maxFeePerGas;
            this.overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        } else {
            this.overrides.gasPrice = feeData.gasPrice;
        }
        return this.overrides;
    }

    rpcHandlerService = async (rpc: RpcSchema) => {
        let response: any;
        const provider = new ethers.JsonRpcProvider(SETTINGS.blockchain_url);
        const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(SETTINGS.issuer_private_key!), "");
        const signer = wallet.connect(provider);
        const contract = getSmartContract(signer);
        await this.buildOverrides(signer);
        try {
            let params;
            switch (rpc.method) {
                case "generateTokens":
                    params = rpc.params as GenerateTokens;
                    const data = params.additionalData ? Buffer.from(params.additionalData) : "0x00";
                    response = await contract.generate(
                        ethers.parseUnits(params.quantity.toString(), "ether"),
                        data,
                        this.overrides
                    );
                    break;
                case "distributeTokens":
                    params = rpc.params as DistributeTokens;
                    response = await contract.distribute(params.to, ethers.parseUnits(params.quantity.toString(), "ether"), (params.additionalData! ? Buffer.from(params.additionalData!) : "0x00"), this.overrides);
                    break;
                case "distributeTokensInBatch":
                    params = rpc.params as DistributeTokensInBatch;
                    const ethersBatch = params.quantityBatch.map((quantity) => ethers.parseUnits(quantity.toString(), "ether"));
                    response = await contract.distributeBatch(params.toBatch, ethersBatch, this.overrides);
                    break;
                case "forceTokenRedemption":
                    params = rpc.params as ForceTokenRedemption;
                    response = await contract.controllerRedeem(params.addr, ethers.parseUnits(params.quantity.toString(), "ether"), (params.additionalData! ? Buffer.from(params.additionalData!) : "0x00"), (params.operatorData! ? Buffer.from(params.operatorData!) : "0x00"), this.overrides);
                    break;
                case "assignRole":
                    params = rpc.params as AssignRole;
                    response = await contract.addParty(params.addr, params.role, params.exp, (params.attachedData! ? Buffer.from(params.attachedData!) : "0x00"), this.overrides);
                    break;
                case "unassignRole":
                    params = rpc.params as UnassignRole;
                    response = await contract.removeParty(params.addr, this.overrides);
                    break;
                default:
                    return { status: 404, result: generateRpcErrorResponse(new RpcMethodNotFound(), rpc.id) };

            }
        } catch (error: any) {
            console.log(error);
            let code;
            switch (error.code) {
                case "Method not found":
                    code = 404;
                    break;
                case "Invalid Request":
                    code = 400;
                    break;
                case "INVALID_ARGUMENT":
                    code = 400;
                    break;
                case "UNCONFIGURED_NAME":
                    code = 400;
                    break;
                case "Internal error":
                    code = 500;
                    break;
                case "CALL_EXCEPTION":
                    code = 500;
                    break;
                case "Server error":
                    code = 500;
                    break;
                case "UNKNOWN_ERROR":
                    code = 500;
                    break;
            }
            const response = generateRpcErrorResponse(error, rpc.id);
            return { status: code, result: response };
        }
        this.logger.debug("RPC Method has finished execution");
        return { status: 200, result: generateRpcOkResponse(response, rpc.id) };
    }
}