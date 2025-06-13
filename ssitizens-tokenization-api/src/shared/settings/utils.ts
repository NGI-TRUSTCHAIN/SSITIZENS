import nconf from "nconf";

export function getOptionalNumber(key: string, defaultValue?: number ): number | undefined {
  return nconf.get(key) ? Number(nconf.get(key)) : defaultValue;
}

export function getNumber(key: string, defaultValue?: number ): number {
  const value = getOptionalNumber(key, defaultValue);
  if (!value) {
    throw new Error(`Setting '${key}' not defined`);
  }
  return value;
}

export function getOptionalString(key: string, defaultValue?: string ): string | undefined {
  return nconf.get(key) ? String(nconf.get(key)) : defaultValue;
}

export function getString(key: string, defaultValue?: string): string {
  const value = getOptionalString(key, defaultValue);
  if (!value) {
    throw new Error(`Setting '${key}' not defined`);
  }
  return value;
}

export function getOptionalStringArray(key: string, defaultValue?: string[]): string[] | undefined {
  const value = getOptionalString(key);
  if (!value) {
    return defaultValue;
  }
  return value.split(",").map((element) => element.trim());
}

export function getStringArray(key: string, defaultValue?: string[]): string[] {
  const value = getOptionalStringArray(key, defaultValue);
  if (!value) {
    throw new Error(`Setting '${key}' not defined`);
  }
  return value;
}

export function getOptionalObject(key: string, defaultValue?: object): object | undefined {
  return nconf.get(key) ? nconf.get(key) as string[] : defaultValue;
}

export function getObject(key: string, defaultValue?: object): object {
  const value = getOptionalObject(key, defaultValue);
  if (value == undefined) {
    throw new Error(`Setting '${key}' not defined`);
  }
  return value;
}

export function getOptionalBoolean(key: string, defaultValue?: boolean): boolean | undefined {
  return typeof nconf.get(key) === "boolean" ? nconf.get(key) : defaultValue;
}

export function getBoolean(key: string, defaultValue?: boolean): boolean {
  const value = getOptionalBoolean(key, defaultValue);
  if (value == undefined) {
    throw new Error(`Setting '${key}' not defined`);
  }
  return value;
}
