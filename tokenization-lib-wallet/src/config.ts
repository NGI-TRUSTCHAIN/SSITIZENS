type EnvVarsType = {
  BACK_END_URL: string;
  BLOCKCHAIN_RPC_URL: string;
  SMART_CONTRACT_ADDRESS: string;
};

let ENV_VARS: EnvVarsType = {
  BACK_END_URL: "",
  BLOCKCHAIN_RPC_URL: "",
  SMART_CONTRACT_ADDRESS: "",
};

export function initTokenizationLibEnvVars(newVars: Partial<EnvVarsType>) {
  ENV_VARS = { ...ENV_VARS, ...newVars };
}

export function getEnvVars(): EnvVarsType {
  return ENV_VARS;
}
