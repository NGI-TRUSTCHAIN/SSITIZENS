import { buildModule } from "@nomicfoundation/ignition-core";
import hre from "hardhat";

const IzCompensationModule = buildModule("IzCompensationModule", (builder) => {
  
  const deployer = builder.getAccount(0); 

  console.info("************ DEPLOY IZCOMPENSATION ************");
  console.info("NETWORK: " + hre.network.name);
  let networkConfig: any = hre.config.networks[hre.network.name];
  let config: any = networkConfig.izDEPLOYMENT;
  console.info("OWNER ADDRESS: " + config.OWNER);
  console.info("ISSUER ADDRESS: " + config.ISSUER);

  // Desplegar el contrato izCompensation con los parámetros
  const izCompensation = builder.contract("izCompensation", [
    deployer, // Initially set the deployer as the issuer to allow deployer to change the issuer. Not the real owner, This will be changed later
    deployer, // Initially set the deployer as the issuer to allow iztoken contract to call the compensation contract.Not the real issuer, This will be changed later
  ]);

  return { izCompensation };
});

export default IzCompensationModule;
