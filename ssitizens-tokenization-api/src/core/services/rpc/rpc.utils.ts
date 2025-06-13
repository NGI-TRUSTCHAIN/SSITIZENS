import { RpcResponse } from "@/api/rpc/rpc.interface.js";
import { IzToken__factory } from "@/core/contracts/typechain/index.js";
import { SETTINGS } from "@/settings.js";
import { RpcError } from "@/shared/classes/errors.js";
import { ethers, Signer } from "ethers";


export function generateRpcOkResponse(data: any, id?: string): RpcResponse {
  const result: RpcResponse = {
    jsonrpc: "2.0",
    result:{
      hash: data.hash
    } ,
  };
  if (id) {
    result.id = id;
  };
  return result;
}

export function generateRpcErrorResponse(
  error: RpcError,
  id?: string
): RpcResponse {

  const result: RpcResponse = {
    jsonrpc: "2.0",
    error: error,
  };
  if (id) {
    result.id = id;
  };
  return result;
}

/**
* Get a new instance of a getSmartContract to be able to interact with the deployed IzToken contract
* @param defaultSigner (optional) [systemWallet] signer to be used as the default from and to use it's private key to sign transactions
* @returns an instance of a IiztokenSC
*/
export function getSmartContract(defaultSigner?: Signer) {
  let provider = new ethers.JsonRpcProvider(SETTINGS.blockchain_url);
  console.log(SETTINGS.blockchain_url, SETTINGS.sc_address);
  return IzToken__factory.connect(
    SETTINGS.sc_address!,
    defaultSigner
      ? defaultSigner.connect(provider)
      : provider
  );
};
