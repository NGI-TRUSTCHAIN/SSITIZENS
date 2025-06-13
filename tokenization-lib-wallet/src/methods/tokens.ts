import { ethers } from "ethers";
import {
  getContract,
  getLatestBlockTimestamp,
  getSigner,
} from "../utils/contract";
import { AidCodeType, RoleIdType } from "../types";

/**
 * Retrieves the token balance of a given address.
 * @param address - The wallet address to query.
 * @returns The token balance formatted as a string.
 */
export async function getTokenBalance(address: string): Promise<string> {
  const contract = getContract();
  const balance = await contract.balanceOf(address);
  return ethers.utils.formatUnits(balance, 18);
}

/**
 * Retrieves the aid type code assigned to a citizen's address.
 * @param citizenAddress - The citizen's wallet address.
 * @returns The aid code as int (0, 1, 2).
 */
export async function getCitizenAidType(
  citizenAddress: string
): Promise<AidCodeType> {
  const contract = getContract();
  const rawAidId = await contract.getAttachedData(citizenAddress);
  const aidType = ethers.utils.toUtf8String(rawAidId);
  return Number(aidType) as AidCodeType;
}

/**
 * Retrieves the merchant name from a specific merchant's address.
 * @param merchantAddress - The merchantAddress's wallet address.
 * @returns The merchang name as string.
 */
export async function getMerchantName(
  merchantAddress: string
): Promise<string> {
  const contract = getContract();
  const rawName = await contract.getAttachedData(merchantAddress);
  const merchantName = ethers.utils.toUtf8String(rawName);
  return merchantName;
}

/**
 * Retrieves the permission role assigned to an address at the latest block timestamp.
 * @param address - The user's wallet address.
 * @returns The role ID associated with the address.
 */
export async function getPartyPermission(address: string): Promise<RoleIdType> {
  const contract = getContract();
  const timestamp = await getLatestBlockTimestamp();
  const role = (await contract.partyPermission(
    address,
    timestamp
  )) as RoleIdType;
  return role;
}

/**
 * Transfers tokens from the user's wallet to another address.
 * Uses `transferFromWithData` to attach additional event data.
 * @param privateKey - The sender's private key.
 * @param toAddress - The recipient's wallet address.
 * @param amount - The amount of tokens to transfer.
 * @param eventData - Optional event data to attach.
 * @returns An object with the transaction hash (txHash) and receipt of the transfer.
 */
export async function sendTokens(
  privateKey: string,
  toAddress: string,
  amount: number,
  eventData?: string
): Promise<{ txHash: string; receipt: ethers.ContractReceipt }> {
  const signer = getSigner(privateKey);
  const contract = getContract(signer);
  const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
  const data = eventData ? ethers.utils.toUtf8Bytes(eventData) : "0x00";

  try {
    const tx = await contract.transferWithData(toAddress, parsedAmount, data, {
      gasLimit: 400000,
    });
    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error("Transaction reverted by the EVM");
    }

    return { txHash: tx.hash, receipt };
  } catch (error: any) {
    const errMsg =
      error?.reason ||
      error?.data?.message ||
      error?.message ||
      "Unknown error";
    throw new Error(`Send Tokens Error: ${errMsg}`);
  }
}

/**
 * Burns (redeems) a specific amount of tokens from the user's wallet.
 * @param privateKey - The wallet's private key.
 * @param amount - The amount of tokens to burn.
 * @param eventData - Optional event data to attach.
 * @returns An object with the transaction hash (txHash) and receipt of the burn operation.
 */
export async function burnTokens(
  privateKey: string,
  amount: number,
  eventData?: string
): Promise<{ txHash: string; receipt: ethers.ContractReceipt }> {
  const signer = getSigner(privateKey);
  const contract = getContract(signer);
  const address = await signer.getAddress();
  const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
  const data = eventData ? ethers.utils.toUtf8Bytes(eventData) : "0x00";

  try {
    const tx = await contract.redeemFrom(address, parsedAmount, data, {
      gasLimit: 400000,
    });

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error("Transaction reverted by the EVM");
    }

    return { txHash: tx.hash, receipt };
  } catch (error: any) {
    const errMsg =
      error?.reason ||
      error?.data?.message ||
      error?.message ||
      "Unknown error";
    throw new Error(`Burn Tokens Error: ${errMsg}`);
  }
}
