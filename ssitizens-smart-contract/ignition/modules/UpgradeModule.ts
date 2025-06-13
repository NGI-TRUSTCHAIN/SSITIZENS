import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployIzToken from "./DeployIzToken";


const upgradeModule = buildModule("UpgradeModule", (builder) => {
  //const owner = builder.getAccount(0);

  const proxy = builder.useModule(DeployIzToken);
//   console.dir(proxy.izToken, { depth: null, colors: true });

  const izTokenUpgraded = builder.contract("izTokenUpgraded");

 //console.log("proxy: ", proxy);
 console.log("izTokenUpgraded: ", izTokenUpgraded);

  builder.call(proxy.izToken, "upgradeTo", [izTokenUpgraded]);

  return { proxy };
});

export default upgradeModule;
