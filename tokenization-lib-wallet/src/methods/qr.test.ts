import { describe, it, expect } from "vitest";
import { QR_CODE_PREFIX } from "../constants";
import {
  generateCitizenQR,
  generateMechantQR,
  parseMerchOrCitizenQR,
} from "./qr";

const validData = {
  merchantDID: "0xAB000",
  citizenDID: "0xABC123",
  CID: "Coffee Payment",
};

const validQR = `${QR_CODE_PREFIX.MERCHANT}|${JSON.stringify(validData)}`;

describe("parseMerchOrCitizenQR", () => {
  it("parses valid QR string correctly", () => {
    const result = parseMerchOrCitizenQR(validQR);
    expect(result).toEqual(validData);
  });

  it("throws error for invalid prefix", () => {
    const qr = `INVALID|${JSON.stringify(validData)}`;
    expect(() => parseMerchOrCitizenQR(qr)).toThrowError(
      "Lib error: Invalid QR prefix"
    );
  });

  it("throws error for malformed JSON", () => {
    const qr = `${QR_CODE_PREFIX.MERCHANT}|not-a-json`;
    expect(() => parseMerchOrCitizenQR(qr)).toThrowError(
      "Lib error: Invalid QR data format"
    );
  });
});

describe("generateCitizenQR", () => {
  it("should generate a valid citizen QR string", () => {
    const did = "did:example:123456";
    const result = generateCitizenQR(did);
    expect(result).toBe(`${QR_CODE_PREFIX.CITIZEN}|${did}`);
  });
});

describe("generateMechantQR", () => {
  it("should generate a valid merchant QR string", () => {
    const merchantDID = "0xAB000";
    const citizenDID = "0xABC123";
    const CID = "0210kxooek01w0xm";

    const expectedData = JSON.stringify({
      merchantDID,
      citizenDID,
      CID,
    });
    const result = generateMechantQR(merchantDID, citizenDID, CID);
    expect(result).toBe(`${QR_CODE_PREFIX.MERCHANT}|${expectedData}`);
  });

  it("should handle empty strings correctly", () => {
    const merchantDID = "";
    const citizenDID = "";
    const CID = "";

    const expectedData = JSON.stringify({
      merchantDID,
      citizenDID,
      CID,
    });
    const result = generateMechantQR(merchantDID, citizenDID, CID);
    expect(result).toBe(`${QR_CODE_PREFIX.MERCHANT}|${expectedData}`);
  });
});
