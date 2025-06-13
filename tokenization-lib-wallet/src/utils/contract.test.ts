import { describe, it, expect, vi } from "vitest";
import { ethers } from "ethers";
import {
  getProvider,
  getSigner,
  getContract,
  getLatestBlockTimestamp,
} from "./contract";

const TEST_RPC_URL = "http://localhost:8545";

export const TEST_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044976f9d49e7e6b7a0f5aa8dfb0e7e3d9e0f8b6e0c6c1";

describe("utils/contract", () => {
  it("should return a JsonRpcProvider", () => {
    const provider = getProvider();
    expect(provider).toBeInstanceOf(ethers.providers.JsonRpcProvider);
    expect(provider.connection.url).toBe(TEST_RPC_URL);
  });

  it("should return a Wallet instance", () => {
    const signer = getSigner(TEST_PRIVATE_KEY);
    expect(signer).toHaveProperty("address");
    expect(signer.provider).toBeDefined();
  });

  it("should return a contract instance", () => {
    const contract = getContract();
    expect(contract.address).toBeDefined();
    expect(typeof contract.functions.balanceOf).toBe("function");
  });
});
