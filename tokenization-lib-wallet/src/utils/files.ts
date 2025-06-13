import { RNFileType } from "../types";

export function isReactNativeFile(file: unknown): file is RNFileType {
  return (
    typeof file === "object" &&
    file !== null &&
    "uri" in file &&
    "name" in file &&
    "type" in file
  );
}
