import { QR_CODE_PREFIX } from "../constants";
import { CitizenQRDataType, MerchantQRDataType } from "../types";

/**
 * Generates a QR code string for a Citizen DID.
 * @param didOrAddress - The DID (Decentralized Identifier) or address of the citizen (string).
 * @returns A formatted QR string with the CITIZEN prefix.
 */
export function generateCitizenQR(didOrAddress: string): string {
  const qr_prefix = QR_CODE_PREFIX.CITIZEN;

  return `${qr_prefix}|${didOrAddress}`;
}

/**
 * Generates a QR code string for a Merchant payment request.
 * @param merchantDID - The merchant's wallet DID.
 * @param citizenDID - The citizen's wallet DID.
 * @param CID - the CID of the IPFS file containing the Merchant's payment request.
 * @returns A formatted QR string with the MERCHANT prefix and serialized data.
 */
export function generateMechantQR(
  merchantDID: string,
  citizenDID: string,
  CID: string
): string {
  const qr_prefix = QR_CODE_PREFIX.MERCHANT;

  const data: MerchantQRDataType = {
    merchantDID,
    citizenDID,
    CID,
  };

  const strData = JSON.stringify(data);

  return `${qr_prefix}|${strData}`;
}

/**
 * Parses a QR code string and determines whether it corresponds to a Merchant or Citizen QR.
 * @param qr - The scanned QR code string.
 * @returns The parsed QR data object (either MerchantQRDataType or CitizenQRDataType).
 * @throws If the QR prefix is invalid or the data format is incorrect.
 */
export function parseMerchOrCitizenQR(
  qr: string
): MerchantQRDataType | CitizenQRDataType {
  const [prefix, data] = qr.split("|", 2);

  if (prefix === QR_CODE_PREFIX.MERCHANT) {
    try {
      const parsedData = JSON.parse(data) as MerchantQRDataType;
      const { merchantDID, citizenDID, CID } = parsedData;

      if (!merchantDID || !citizenDID || !CID) {
        throw new Error("Lib error: Missing fields in QR data");
      }

      return parsedData;
    } catch (err) {
      console.log({ err });
      throw new Error("Lib error: Invalid QR data format");
    }
  } else if (prefix === QR_CODE_PREFIX.CITIZEN) {
    return { address: data };
  } else {
    throw new Error("Lib error: Invalid QR prefix");
  }
}
