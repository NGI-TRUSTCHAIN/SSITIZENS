import { describe, it, expect } from "vitest";
import { isReactNativeFile } from "./files";
import { RNFileType } from "../types";

describe("isReactNativeFile", () => {
  it("should return true for a valid RNFileType object", () => {
    const file: RNFileType = {
      uri: "file:///path/to/image.jpg",
      name: "image.jpg",
      type: "image/jpeg",
    };

    expect(isReactNativeFile(file)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isReactNativeFile(null)).toBe(false);
  });

  it("should return false for a string", () => {
    expect(isReactNativeFile("not-a-file")).toBe(false);
  });

  it("should return false for an object missing uri", () => {
    const file = { name: "image.jpg", type: "image/jpeg" };
    expect(isReactNativeFile(file)).toBe(false);
  });

  it("should return false for an object missing name", () => {
    const file = { uri: "file:///image.jpg", type: "image/jpeg" };
    expect(isReactNativeFile(file)).toBe(false);
  });

  it("should return false for an object missing type", () => {
    const file = { uri: "file:///image.jpg", name: "image.jpg" };
    expect(isReactNativeFile(file)).toBe(false);
  });

  it("should return false for an empty object", () => {
    expect(isReactNativeFile({})).toBe(false);
  });
});
