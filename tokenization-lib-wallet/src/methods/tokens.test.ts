import { describe, it, expect, vi, beforeEach } from "vitest";
import * as contractUtils from "../utils/contract";
import * as ethersUtils from "ethers";

import {
  getTokenBalance,
  getCitizenAidType,
  getPartyPermission,
  sendTokens,
  burnTokens,
  getMerchantName,
} from "./tokens";

vi.mock("../utils/contract");

describe("tokens utils", () => {
  const mockContract = {
    balanceOf: vi.fn(),
    getAttachedData: vi.fn(),
    partyPermission: vi.fn(),
    transferWithData: vi.fn(),
    redeemFrom: vi.fn(),
  };

  const mockSigner = {
    getAddress: vi.fn().mockResolvedValue("0xFROMADDRESS"),
  };

  beforeEach(() => {
    vi.mocked(contractUtils.getContract).mockReturnValue(mockContract as any);
    vi.mocked(contractUtils.getSigner).mockReturnValue(mockSigner as any);
    vi.mocked(contractUtils.getLatestBlockTimestamp).mockResolvedValue(
      1234567890
    );

    vi.spyOn(ethersUtils.ethers.utils, "formatUnits").mockImplementation(
      () => "100.0"
    );
    vi.spyOn(ethersUtils.ethers.utils, "parseUnits").mockImplementation(
      () => "1000000000000000000" as any
    );
    vi.spyOn(ethersUtils.ethers.utils, "toUtf8String").mockImplementation(
      (v: any) => v
    );
    vi.spyOn(ethersUtils.ethers.utils, "toUtf8Bytes").mockImplementation(
      (s: string) => s as any
    );
  });

  it("getTokenBalance returns formatted balance", async () => {
    mockContract.balanceOf.mockResolvedValue("1000000000000000000");
    const result = await getTokenBalance("0xABC123");
    expect(result).toBe("100.0");
    expect(mockContract.balanceOf).toHaveBeenCalledWith("0xABC123");
  });

  it("getCitizenAidType returns correct numeric aid code", async () => {
    mockContract.getAttachedData.mockResolvedValue("2"); // simulate UTF-8 string "2"
    const result = await getCitizenAidType("0xABC123");
    expect(result).toBe(2);
  });

  it("getMerchantName returns merchant name string", async () => {
    mockContract.getAttachedData.mockResolvedValue("Supermarket XYZ");
    const result = await getMerchantName("0xMERCHANT");
    expect(result).toBe("Supermarket XYZ");
    expect(mockContract.getAttachedData).toHaveBeenCalledWith("0xMERCHANT");
  });

  it("getPartyPermission returns correct role", async () => {
    mockContract.partyPermission.mockResolvedValue(2);
    const result = await getPartyPermission("0xABC123");
    expect(result).toBe(2);
  });

  it("sendTokens returns tx hash", async () => {
    mockContract.transferWithData.mockResolvedValue({
      hash: "0xTXHASH",
      wait: vi.fn().mockResolvedValue({ status: 1, some: "receipt" }),
    });
    const result = await sendTokens("privKey", "0xTO", 1, "event");
    expect(result.txHash).toBe("0xTXHASH");
    expect(result.receipt.status).toBe(1);
  });

  it("burnTokens returns tx hash", async () => {
    mockContract.redeemFrom.mockResolvedValue({
      hash: "0xBURNHASH",
      wait: vi.fn().mockResolvedValue({ status: 1, some: "receipt" }),
    });
    const result = await burnTokens("privKey", 1, "event");
    expect(result.txHash).toBe("0xBURNHASH");
    expect(result.receipt.status).toBe(1);
  });

  it("sendTokens throws formatted error on fail", async () => {
    mockContract.transferWithData.mockRejectedValue({ message: "Boom" });
    await expect(sendTokens("privKey", "0xTO", 1)).rejects.toThrow(
      "Send Tokens Error: Boom"
    );
  });

  it("burnTokens throws formatted error on fail", async () => {
    mockContract.redeemFrom.mockRejectedValue({ message: "Boom" });
    await expect(burnTokens("privKey", 1)).rejects.toThrow(
      "Burn Tokens Error: Boom"
    );
  });
});
