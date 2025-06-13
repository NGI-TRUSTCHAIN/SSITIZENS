import { ethers } from "ethers";
import { IzToken, IzToken__factory } from "../contracts/typechain";
import { getEnvVars } from "../config";

type RpcProvider = ethers.providers.JsonRpcProvider;
type SignerOrProvider = ethers.Signer | ethers.providers.Provider;
type Wallet = ethers.Wallet;

export function getProvider(): RpcProvider {
  const { BLOCKCHAIN_RPC_URL } = getEnvVars();
  return new ethers.providers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
}

export function getSigner(privateKey: string): Wallet {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

export function getContract(signer?: SignerOrProvider): IzToken {
  const { SMART_CONTRACT_ADDRESS } = getEnvVars();
  const provider = getProvider();
  return IzToken__factory.connect(SMART_CONTRACT_ADDRESS, signer || provider);
}

export async function getLatestBlockTimestamp(): Promise<number> {
  const provider = getProvider();
  const block = await provider.getBlock("latest");
  return block.timestamp;
}
