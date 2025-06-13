import { autoInjectable, singleton } from "tsyringe";
import { ethers, formatEther } from "ethers";
import Logger from "@/shared/classes/logger.js";
import { getSmartContract } from "../rpc/rpc.utils.js";
import { SETTINGS } from "@/settings.js";



@singleton()
@autoInjectable()
export default class BalanceService {
  constructor(private logger: Logger) { }
  overrides = { maxPriorityFeePerGas: 0, gasLimit: 400000 };
  getEthers = async (address: string) => {
    const balance = await ethers.getDefaultProvider(SETTINGS.blockchain_url).getBalance(address);
    return {
      "ethers": formatEther(balance).toString()
    }
  }

  getTokens = async (address: string) => {
    const contract = getSmartContract();
    const balance = await contract.balanceOf(address);
    return {

      "tokens": formatEther(balance).toString()
    }
  }
  getBalances = async (address: string) => {
    const ethersBalance = await this.getEthers(address);
    const tokensBalance = await this.getTokens(address);
    return {
      "ethers": ethersBalance.ethers,
      "tokens": tokensBalance.tokens
    }
  }
}