import { autoInjectable, singleton } from "tsyringe";
import Logger from "@/shared/classes/logger.js";
import { getSmartContract } from "../rpc/rpc.utils.js";




@singleton()
@autoInjectable()
export default class PermissionService {
  constructor(private logger: Logger) { }
  overrides = { maxPriorityFeePerGas: 0, gasLimit: 400000 };
  permissions = async (address: string) => {
    const contract = getSmartContract();
    const permissions = await contract.partyPermission(address, Math.floor(Date.now()/1000));
    const attached = await contract.getAttachedData(address);
    return {
      "permission": (permissions).toString()
    }
  }


}