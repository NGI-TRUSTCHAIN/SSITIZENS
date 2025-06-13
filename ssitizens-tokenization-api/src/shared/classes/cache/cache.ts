export default interface Cache {
  has(key: string): Promise<boolean>;
  set(key: string, value: object): Promise<void>;
  get(key: string): Promise<unknown>;
  take(key: string): Promise<unknown>;
}
