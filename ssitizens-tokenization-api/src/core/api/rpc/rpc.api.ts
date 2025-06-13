import { autoInjectable, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import Logger from '@/shared/classes/logger.js';
import { RpcSchema } from './rpc.interface.js';
import { RpcServiceEIP1559, RpcServiceLegacy } from '@/services/rpc/rpc.service.js';
import { SETTINGS } from '@/settings.js';
import { ethers } from 'ethers';


type RpcServiceType = RpcServiceEIP1559 | RpcServiceLegacy;

@singleton()
@autoInjectable()
export default class RpcApi {
  private rpcService!: RpcServiceType;

  constructor(
    private logger: Logger,
    private eip1559Service?: RpcServiceEIP1559,
    private legacyService?: RpcServiceLegacy
  ) {}

   async init() {
    const provider = new ethers.JsonRpcProvider(SETTINGS.blockchain_url);
    const block = await provider.getBlock("latest");
    const supportsEIP1559 = !!block?.baseFeePerGas;

    console.log(`Network ${SETTINGS.blockchain_url} ${supportsEIP1559 ? "support" : "NOT support"} EIP-1559`);

    this.rpcService = supportsEIP1559 ? this.eip1559Service! : this.legacyService!;
  }

  rpcHandlerApi = async (req: Request, res: Response) => {

    const rpcRequest = req.body as RpcSchema;
    this.logger.debug("Processing RPC method - " + rpcRequest.method);
    const response = await this.rpcService.rpcHandlerService(rpcRequest);
    return res.status(response.status!).json(response.result);
  }

}
