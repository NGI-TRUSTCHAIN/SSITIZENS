import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract, Signer } from "ethers";
import { IzCompensation, IzCompensation__factory } from "../typechain-types";
import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";


const MINIMUM_TRANSFER:bigint = 10_000_000_000_000_000n; // 0.01 IZC
const MINIMUM_USER_BALANCE:bigint = 10_000_000_000_000_000n; // 0.01 CRYPTO

describe("UUPS Upgrade Test", function () {
  let izToken: Contract;
  let izTokenUpgraded: Contract;
  let proxy: Contract & { [key: string]: any };
  let Deployer: Signer, Issuer: Signer;

  let izCompensation: IzCompensation;
  let izCompensationAddress: string;

  this.beforeEach(async function () {
    const izCompensationFactory = await ethers.getContractFactory("izCompensation") as IzCompensation__factory;
    izCompensation = await izCompensationFactory.deploy(
      await Deployer.getAddress(),
      await Deployer.getAddress()
  );
    izCompensationAddress = await izCompensation.getAddress();
  });


  before(async function () {
    [Deployer, Issuer] = await ethers.getSigners();
  });

  it("Should deploy izToken as a proxy", async function () {
    const izTokenFactory = await ethers.getContractFactory("izToken");
     proxy = (await upgrades.deployProxy(
       izTokenFactory,
       [
         await Deployer.getAddress(),
         await Issuer.getAddress(), //
         "Initial Token",
         "IZ",
         MINIMUM_TRANSFER,
         MINIMUM_USER_BALANCE,
         izCompensationAddress
       ],
       { initializer: "initialize" }
     )) as Contract;
    await proxy.waitForDeployment();

    expect(await proxy.name()).to.equal("Initial Token");
    expect(await proxy.symbol()).to.equal("IZ");

    const izTokenUpgradedFactory = await ethers.getContractFactory(
    "izTokenUpgraded"
    );

    proxy = await upgrades.upgradeProxy(proxy, izTokenUpgradedFactory) as Contract;

    // Ensure the contract retains its original data
    expect(await proxy.name()).to.equal("Initial Token");
    // Test the newly added functionality
    expect(await proxy.newField()).to.equal(0);
    await proxy.setNewField(11);
    expect(await proxy.newField()).to.equal(11);
  });


  it("Should fail if not the owner", async function () {
    const izTokenFactory = await ethers.getContractFactory("izToken");
    const izTokenFactoryUpgraded = await ethers.getContractFactory("izTokenUpgraded");
    proxy = (await upgrades.deployProxy(
      izTokenFactory,
      [
        await Deployer.getAddress(),
        await Issuer.getAddress(),
        "Initial Token",
        "IZ",
        MINIMUM_TRANSFER,
        MINIMUM_USER_BALANCE,
        izCompensationAddress,
      ],
      { initializer: "initialize" }
    )) as Contract;
    await proxy.waitForDeployment();

    expect(await proxy.name()).to.equal("Initial Token");
    expect(await proxy.symbol()).to.equal("IZ");

    await proxy.transferOwnership(await Issuer.getAddress());

    let  newImplementation = izTokenFactoryUpgraded.deploy();
    
    
    await expect(
      proxy
        .connect(Deployer)
        .upgradeToAndCall((await newImplementation).getAddress(), "0x00")
    ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");

  });
});
