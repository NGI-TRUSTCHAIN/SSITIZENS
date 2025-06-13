import { serialize, deserialize } from "bson";
import { gzipSync, gunzipSync,constants } from "zlib";

/**
 * Converts a JSON object to a compressed BSON string in hexadecimal format.
 * @param jsonData JSON object to be converted.
 * @returns Hexadecimal string representing compressed BSON.
 */
export function compressJsonToHex(jsonData: object): string {
  // Convert JSON to BSON (returns a Uint8Array)
  const bsonDataUint8: Uint8Array = serialize(jsonData);

  // Convert Uint8Array to Buffer
  const bsonData: Buffer = Buffer.from(bsonDataUint8);

  // Compress BSON using GZIP: NOT USED AS IT INCREASES THE SIZE
  //const compressedBson: Buffer = gzipSync(bsonData, { level: constants.Z_BEST_COMPRESSION });

  // console.info(`Original JSON size: ${bsonData.length} bytes`);
  // console.info(`Compressed BSON size: ${compressedBson.length} bytes`);


  // Convert compressed BSON to a hexadecimal string (compatible with Solidity bytes)
  return "0x" + bsonData.toString("hex");
}

/**
 * Decompresses a BSON string in hexadecimal format and converts it back to JSON.
 * @param hexString Hexadecimal string containing compressed BSON.
 * @returns Deserialized JSON object.
 */
export function decompressHexToJson(hexString: string): object {
  // Remove "0x" prefix if present
  const hexWithoutPrefix = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;

  // Convert hexadecimal string to Buffer
  const compressedBuffer: Buffer = Buffer.from(hexWithoutPrefix, "hex");

  // Decompress BSON
  const decompressedBson: Buffer = gunzipSync(compressedBuffer);

  // Convert decompressed BSON back to JSON
  return deserialize(Uint8Array.from(decompressedBson));
}

// // 🔹 Example usage
// const jsonData = {
//   name: "John",
//   age: 30,
//   isActive: true,
//   skills: ["TypeScript", "Node.js", "MongoDB"],
// };

// // Compress JSON to BSON and get a hexadecimal string
// const hexBson = compressJsonToHex(jsonData);
// console.log("Compressed BSON in hexadecimal:", hexBson);

// // Decompress BSON from hexadecimal
// const jsonDeserialized = decompressHexToJson(hexBson);
// console.log("Deserialized JSON:", jsonDeserialized);


