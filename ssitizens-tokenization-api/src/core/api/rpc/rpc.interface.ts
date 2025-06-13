export interface RpcSchema {
  jsonrpc: string;
  method: string;
  id: string;
  params: GenerateTokens | DistributeTokens | DistributeTokensInBatch | ForceTokenRedemption | AssignRole
  | UnassignRole;
}

export interface GenerateTokens {
  quantity: number;
  additionalData?: string;
}

export interface DistributeTokens {
  to: string;
  quantity: number;
  additionalData?: string;
}

export interface DistributeTokensInBatch {
  toBatch: string[];
  quantityBatch: number[];
}

export interface ForceTokenRedemption {
  addr: string;
  quantity: number;
  additionalData?: string;
  operatorData?: string;
}

export interface AssignRole {
  addr: string;
  role: number;
  exp: number;
  attachedData?: string;
}

export interface UnassignRole {
  addr: string;
}

export interface RpcResponse {
  jsonrpc: string;
  id?: string;
  result?: any,
  error?: Record<string, any>
}