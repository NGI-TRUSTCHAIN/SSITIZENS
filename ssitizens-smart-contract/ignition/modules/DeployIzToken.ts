import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre  from "hardhat";

import IzCompensationModule from "./DeployCompensation";


const DeployIzToken = buildModule("DeployIzToken", (builder) => {



  // Implementation deployment
  const implementation = builder.contract("izToken");

  const compensationContract = builder.useModule(IzCompensationModule);

  // Get configuration from hardhat-config
  console.info("************ DEPLOY IZTOKEN ************");
  console.info("NETWORK: "+hre.network.name);
  let networkConfig: any = hre.config.networks[hre.network.name];
  let config: any = networkConfig.izDEPLOYMENT;

  console.info("OWNER ADDRESS: "+config.OWNER);
  console.info("ISSUER ADDRESS: " + config.ISSUER);
  console.info("NAME:          "+config.NAME);
  console.info("SYMBOL:        "+config.SYMBOL);
  console.info("MIN_TRANSFER:  "+config.MIN_TRANSFER);
  console.info("MIN_USER_BALANCE:  "+config.MIN_USER_BALANCE);

  // Generate Bytecode for initialize function
  const initialize = builder.encodeFunctionCall(implementation, "initialize", [
    config.OWNER,
    config.ISSUER,
    config.NAME,
    config.SYMBOL,
    config.MIN_TRANSFER,
    config.MIN_USER_BALANCE,
    compensationContract.izCompensation,
  ]);

  // Deploy the proxy contract
  const izToken = builder.contract("ERC1967Upgrade", [
    implementation,
    initialize,
  ]);

  // Allow izToken to have permission to call the compensation contract. NOTE: this is possible because the issuer is the deployer
  const allowContractCall = builder.call(compensationContract.izCompensation, "allowContract", [izToken]);
  // Change issuer to the real issuer. NOTE: this is possible because the owner is the deployer
  const changeIssuerCall = builder.call(
    compensationContract.izCompensation, 
    "changeIssuer", 
    [config.ISSUER],
    {after:[allowContractCall]}); // To ensure it is execute after allowContractCall 
  const changeOwnerCall = builder.call(
    compensationContract.izCompensation,
    "transferOwnership",
    [config.OWNER],
    { after: [changeIssuerCall] }
  );

  return { izToken };
});

export default DeployIzToken;
