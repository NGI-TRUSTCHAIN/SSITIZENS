import { expect, util } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers,network } from "hardhat";
import { Signer, Block, AddressLike, ContractTransactionResponse, ContractTransactionReceipt } from "ethers";
import {compressJsonToHex} from "../lib/json2bson";
import {
  IzToken,
  IzToken__factory,
  IzCompensation,
  IzCompensation__factory,
  MockContract__factory,
  MockContract
} from "../typechain-types";

const TICKET:object = {
  "name": "INVOICE_001",
  "hash":"0x1234567890abcdef1234567890abcdef",
  "URI": "https://www.example.com/uri/01010202", 
};

const CONTROLLER_TICKET: object = {
  name: "INVOICE_002",
  hash: "0x1234567890abcdef1234567890abcdef",
  URI: "https://www.example.com/uri/019877",
};

const ATTACHED_DATA: object = {
  name: "INVOICE_002",
  hash: "0x1234567890abcdef1234567890abcdef",
  URI: "https://www.example.com/uri/019877",
};


const TOKEN_NAME: string      = "IZCOIN";
const TOKEN_SYMBOL: string    = "IZC";
const DATA:string             = compressJsonToHex(TICKET);
const DATA_CONTROLLER: string = compressJsonToHex(CONTROLLER_TICKET);
const PARTY_ATTACHED_DATA: string = compressJsonToHex(ATTACHED_DATA);

const ZERO_ADDRESS: string = "0x0000000000000000000000000000000000000000";


const EIP1066_SUCCESS:string = "0x01";
const EIP1066_TRANSFER_FAILED: string = "0x50";

const MINIMUM_TRANSFER:bigint = 10_000_000_000_000_000n; // 0.01 IZC
const MINIMUM_USER_BALANCE:bigint = 10_000_000_000_000_000n; // 0.01 CRYPTO

// Coverage requires addtional gas to process the transactions so we need to adapt BATCH_TX_GAS
// to the coverage mode
let BATCH_TX_GAS: number;
if (process.argv.some((arg) => arg.includes("coverage"))) { // checks if any command line parameter contains "coverage"
  BATCH_TX_GAS = 220_000;
} else {
  BATCH_TX_GAS = 210_000;
}




describe("SSITIZENS TOKEN TEST", function () {
  // Needed for low level invocation agains Hardhat chain
  let provider: any;

  //Signers: deployer is alwais first signer
  let Deployer: Signer;
  let Issuer: Signer;
  let NewIssuer: Signer;
  let Citizen1: Signer;
  let Citizen2: Signer;
  let Merchant1: Signer;
  let Merchant2: Signer;
  let NewCompensation: Signer;

  // Signer address
  let deployerAddress: string;
  let issuerAddress: string;
  let newIssuerAddress: string;
  let citizen1Address: string;
  let citizen2Address: string;
  let merchant1Address: string;
  let merchant2Address: string;
  let newCompensationAddress: string;

  let IzToken__factory: IzToken__factory;
  let IzToken: IzToken;
  let IzCompensation: IzCompensation;

  async function deployFixture(): Promise<
    [IzToken__factory, IzToken, IzCompensation]
  > {
    let IzCompensation_factory: IzCompensation__factory =
      (await ethers.getContractFactory(
        "izCompensation"
      )) as IzCompensation__factory;
    
      let _IzCompensation: IzCompensation = await IzCompensation_factory.deploy(
      deployerAddress,
      issuerAddress
    );
   
    let IzToken__factoryFixture: IzToken__factory =
      (await ethers.getContractFactory("izToken")) as IzToken__factory;
    
    let _IzToken: IzToken = await IzToken__factoryFixture.deploy();
    
    await _IzToken.initialize(
      deployerAddress,
      issuerAddress,
      TOKEN_NAME,
      TOKEN_SYMBOL,
      MINIMUM_TRANSFER,
      MINIMUM_USER_BALANCE,
      await _IzCompensation.getAddress()
    );

     await _IzCompensation.connect(Issuer).allowContract(
       await _IzToken.getAddress()
     );

    return [IzToken__factoryFixture, _IzToken, _IzCompensation];
  }

  this.beforeEach(async function () {
    provider = ethers.provider;

    [
      Deployer,
      Issuer,
      NewIssuer,
      Citizen1,
      Citizen2,
      Merchant1,
      Merchant2,
      NewCompensation,
    ] = await ethers.getSigners();

    // Create addresses
    [
      deployerAddress,
      issuerAddress,
      newIssuerAddress,
      citizen1Address,
      citizen2Address,
      merchant1Address,
      merchant2Address,
      newCompensationAddress,
    ] = await Promise.all([
      Deployer.getAddress(),
      Issuer.getAddress(),
      NewIssuer.getAddress(),
      Citizen1.getAddress(),
      Citizen2.getAddress(),
      Merchant1.getAddress(),
      Merchant2.getAddress(),
      NewCompensation.getAddress(),
    ]);

    [IzToken__factory, IzToken, IzCompensation] = await loadFixture(
      deployFixture
    );
  });

  describe("Deployment", function () {

    it("Check initial values", async function () {
      let currentOwner: string;
      let currentIssuer: string;
      let isControllable: boolean;
      let isIsuable: boolean;
      let minimuTransfer: bigint;
      let minimumUserBalance: bigint;
  
      [
        currentOwner,
        currentIssuer,
        isControllable,
        isIsuable,
        minimuTransfer,
        minimumUserBalance,
      ] = await Promise.all([
        IzToken.owner(),
        IzToken.issuer(),
        IzToken.isControllable(),
        IzToken.isIssuable(),
        IzToken.minimumTransfer(),
        IzToken.minimumUserBalance(),
      ]);
  
      expect(currentOwner).to.be.equal(deployerAddress);
      expect(currentIssuer).to.be.equal(issuerAddress);
      expect(isControllable).to.be.true;
      expect(isIsuable).to.be.true;
      expect(minimuTransfer).to.be.equal(MINIMUM_TRANSFER);
      expect(minimumUserBalance).to.be.equal(MINIMUM_USER_BALANCE);
  
      await expect(
        IzToken.initialize(
          deployerAddress,
          issuerAddress,
          TOKEN_NAME,
          TOKEN_SYMBOL,
          MINIMUM_TRANSFER,
          MINIMUM_USER_BALANCE,
          await IzCompensation.getAddress()
        )
      ).to.be.revertedWithCustomError(IzToken, "InvalidInitialization");
    });

    it("Should revert if compensation contract not implements ICompensation", async function () {
       let MockContract_Factory: MockContract__factory =
                (await ethers.getContractFactory(
                  "MockContract"
                )) as MockContract__factory;
              let Mock: MockContract = await MockContract_Factory.deploy();
              let mockAddress = await Mock.getAddress();

      let newIzToken: IzToken = await IzToken__factory.deploy();

      await expect(
        newIzToken.initialize(
          deployerAddress,
          issuerAddress,
          TOKEN_NAME,
          TOKEN_SYMBOL,
          MINIMUM_TRANSFER,
          MINIMUM_USER_BALANCE,
          mockAddress
        )
      ).to.be.revertedWith("Invalid compensation contract");
      
    });
  });


  /************************************************************************************* */

  describe("Issuer change functionality", function () {
    it("Should allow owner to change issuer", async function () {
      await expect(IzToken.changeIssuer(newIssuerAddress))
        .to.emit(IzToken, "changeIssuerEvent")
        .withArgs(issuerAddress, newIssuerAddress);

      expect(await IzToken.issuer()).to.equal(newIssuerAddress);
    });

    it("Should revert if non-owner tries to change issuer", async function () {
      await expect(
        IzToken.connect(Issuer).changeIssuer(newIssuerAddress)
      ).to.be.revertedWithCustomError(IzToken, "OwnableUnauthorizedAccount");
    });

    it("Should revert if wrong address ", async function () {
      await expect(
        IzToken.connect(Deployer).changeIssuer(ZERO_ADDRESS)
      ).to.be.revertedWith("Invalid address");
    });
  });

  /************************************************************************************* */

  describe("Pause and Unpause functionality", function () {
    it("Should allow owner or issuer to pause the contract", async function () {
      await expect(IzToken.pause())
        .to.emit(IzToken, "Paused")
        .withArgs(deployerAddress);

      expect(await IzToken.paused()).to.be.true;
    });

    it("Should allow owner or issuer to unpause the contract", async function () {
      await IzToken.pause();
      await expect(IzToken.unpause())
        .to.emit(IzToken, "Unpaused")
        .withArgs(deployerAddress);

      expect(await IzToken.paused()).to.be.false;
    });

    it("Should revert if non-owner or non-issuer tries to pause", async function () {
      await expect(
        IzToken.connect(Citizen1).pause()
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should revert if non-owner or non-issuer tries to unpause", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen1).unpause()
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });
  });

  /************************************************************************************* */

  describe("Party management functionality", function () {
    const PERMISSION = 1;
    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    it("Should revert add party if not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).addParty(
          citizen1Address,
          PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        )
      ).to.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should revert add party if wrong address", async function () {
      await expect(
        IzToken.connect(Issuer).addParty(
          ZERO_ADDRESS,
          PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        )
      ).to.revertedWith("Invalid address");
    });

    it("Should revert add party if wrong timestamp", async function () {
      let block: Block = await provider.getBlock("latest");
      let timestamp = block.timestamp;

      timestamp += 8;
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
      //await network.provider.send("evm_mine");

      await expect(
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          PERMISSION,
          timestamp,
          PARTY_ATTACHED_DATA
        )
      ).to.revertedWith("Expiration must be in the future");
    });

    it("Should add a party", async function () {
      await expect(
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        )
      )
        .to.emit(IzToken, "PartyUpdated")
        .withArgs(citizen1Address, PERMISSION, EXPIRATION, PARTY_ATTACHED_DATA);

      const currentPermission: any = await IzToken.parties(citizen1Address);
      expect(currentPermission.permission).to.be.equal(PERMISSION);
      expect(currentPermission.expiration).to.be.equal(EXPIRATION);
      expect(currentPermission.attachedData).to.be.equal(PARTY_ATTACHED_DATA);
      
      const attachedData = await IzToken.getAttachedData(citizen1Address);
      expect(attachedData).to.be.equal(PARTY_ATTACHED_DATA);


      const storedParty = await IzToken.partyPermission(
        citizen1Address,
        EXPIRATION
      );
      expect(storedParty).to.equal(PERMISSION);

      const storedPartyExpired = await IzToken.partyPermission(
        citizen1Address,
        EXPIRATION + 1
      );
      expect(storedPartyExpired).to.equal(0);

      await expect(
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          PERMISSION,
          EXPIRATION + 7200,
          PARTY_ATTACHED_DATA
        )
      ).not.to.be.reverted;
    });

    it("Should revert add a party if role differs", async function () {
      const OTHER_PERMISSION = 2;
      await expect(
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        )
      )
        .to.emit(IzToken, "PartyUpdated")
        .withArgs(citizen1Address, PERMISSION, EXPIRATION, PARTY_ATTACHED_DATA);

      const currentPermission: any = await IzToken.parties(citizen1Address);
      expect(currentPermission.permission).to.be.equal(PERMISSION);
      expect(currentPermission.expiration).to.be.equal(EXPIRATION);

      const storedParty = await IzToken.partyPermission(
        citizen1Address,
        EXPIRATION
      );
      expect(storedParty).to.equal(PERMISSION);

      const storedPartyExpired = await IzToken.partyPermission(
        citizen1Address,
        EXPIRATION + 1
      );
      expect(storedPartyExpired).to.equal(0);

      await expect(
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          OTHER_PERMISSION,
          EXPIRATION + 7200,
          PARTY_ATTACHED_DATA
        )
      ).to.be.revertedWith(
        "Party already registered with different permission"
      );
    });

    it("Should revert remove party if not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).removeParty(citizen1Address)
      ).to.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should revert remove party if wrong address", async function () {
      await expect(
        IzToken.connect(Issuer).removeParty(citizen1Address)
      ).to.revertedWith("Party not registered");
    });

    it("Should remove a party", async function () {
      await IzToken.connect(Issuer).addParty(
        citizen1Address,
        PERMISSION,
        EXPIRATION,
        PARTY_ATTACHED_DATA
      );

      await expect(IzToken.connect(Issuer).removeParty(citizen1Address))
        .to.emit(IzToken, "PartyRemoved")
        .withArgs(citizen1Address);

      const currentPermission: any = await IzToken.parties(citizen1Address);
      expect(currentPermission.permission).to.be.equal(0);
      expect(currentPermission.expiration).to.be.equal(0);

      const storedParty = await IzToken.partyPermission(
        citizen1Address,
        EXPIRATION - 1
      );
      expect(storedParty).to.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Minimun transfer functionality", function () {
    it("Should revert if is not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).setMinimumTransfer(MINIMUM_TRANSFER)
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should change minimum transfer", async function () {
      const NEW_MINIMUM_TRANSFER: bigint = 1_000_000_000_000_000n; // 0.01 IZC
      await expect(
        IzToken.connect(Issuer).setMinimumTransfer(NEW_MINIMUM_TRANSFER)
      )
        .to.emit(IzToken, "MinimumTransferChanged")
        .withArgs(MINIMUM_TRANSFER, NEW_MINIMUM_TRANSFER);

      expect(await IzToken.minimumTransfer()).to.be.equal(NEW_MINIMUM_TRANSFER);
    });
  });

  /************************************************************************************* */

  describe("Minimun user balance functionality", function () {
    it("Should revert if is not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).setMinimumUserBalance(MINIMUM_USER_BALANCE)
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should change minimum usr balance", async function () {
      const NEW_MINIMUM_USER_BALANCE: bigint = 2_000_000_000_000_000n; // 0.002 CRYPTO
      await expect(
        IzToken.connect(Issuer).setMinimumUserBalance(NEW_MINIMUM_USER_BALANCE)
      )
        .to.emit(IzToken, "MinimumUserBalanceChanged")
        .withArgs(MINIMUM_USER_BALANCE, NEW_MINIMUM_USER_BALANCE);

      expect(await IzToken.minimumUserBalance()).to.be.equal(
        NEW_MINIMUM_USER_BALANCE
      );
    });
  });

  /************************************************************************************* */

  describe("Compensation change functionality", function () {
    let newCompensationContract: IzCompensation;
    let newCompensationContractAddress: string;

     beforeEach(async function () {
        let IzCompensation_factory: IzCompensation__factory = await ethers.getContractFactory("izCompensation") as IzCompensation__factory; 
        newCompensationContract = await IzCompensation_factory.deploy(deployerAddress, issuerAddress);

        newCompensationContractAddress = await newCompensationContract.getAddress();
     });


    it("Should allow owner to change compensation contract", async function () {
      
      await expect(
        IzToken.setCompensationContract(newCompensationContractAddress)
      )
        .to.emit(IzToken, "CompensationContractChanged")
        .withArgs(IzCompensation, newCompensationContractAddress);

      expect(await IzToken.compensationContract()).to.equal(
        newCompensationContractAddress
      );
    });

    it("Should allow issuer to change compensation contract", async function () {
        const compensationAddress: string = await IzCompensation.getAddress();
        await expect(
          IzToken.connect(Issuer).setCompensationContract(
            newCompensationContractAddress
          )
        )
          .to.emit(IzToken, "CompensationContractChanged")
          .withArgs(IzCompensation, newCompensationContractAddress);

        expect(await IzToken.compensationContract()).to.equal(
          newCompensationContractAddress
        );
    });

    it("Should revert if non-owner tries to change compensation contract", async function () {
      await expect(
        IzToken.connect(Citizen1).setCompensationContract(newIssuerAddress)
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should revert if wrong address ", async function () {
      await expect(
        IzToken.connect(Issuer).setCompensationContract(ZERO_ADDRESS)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should revert if contract does not implement correct interface ", async function () {
      await expect(
        IzToken.connect(Issuer).setCompensationContract(newCompensationAddress)
      ).to.be.reverted;
    });

  });

  /************************************************************************************* */

  describe("Controller Transfer and Redeem functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
    });

    it("Should allow issuer to perform a controller transfer", async function () {
      let currentCitizen1Balance: bigint;
      let currentCitizen2Balance: bigint;
      let newCitizen1Balance: bigint;
      let newCitizen2Balance: bigint;

      [currentCitizen1Balance, currentCitizen2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(citizen2Address),
      ]);

      expect(currentCitizen1Balance).to.be.equal(VALUE);
      expect(currentCitizen2Balance).to.be.equal(0n);

      await expect(
        IzToken.connect(Issuer).controllerTransfer(
          citizen1Address,
          citizen2Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      )
        .to.emit(IzToken, "ControllerTransfer")
        .withArgs(
          issuerAddress,
          citizen1Address,
          citizen2Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
        .to.emit(IzToken, "Transfer")
        .withArgs(citizen1Address, citizen2Address, VALUE);

      [newCitizen1Balance, newCitizen2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(citizen2Address),
      ]);

      expect(newCitizen1Balance).to.be.equal(0n);
      expect(newCitizen2Balance).to.be.equal(VALUE);

      // Controller operations ignore paused mode
      await IzToken.pause();
      await expect(
        IzToken.connect(Issuer).controllerTransfer(
          citizen2Address,
          citizen1Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      ).not.to.be.reverted;
    });

    it("Should revert if non-issuer try to perform a controller transfer", async function () {
      await expect(
        IzToken.connect(Deployer).controllerTransfer(
          citizen1Address,
          citizen2Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      )
        .to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress")
        .withArgs(deployerAddress);
    });

    it("Should allow issuer to perform a controller redeem", async function () {
      let currentCitizen1Balance: bigint;
      let newCitizen1Balance: bigint;

      [currentCitizen1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
      ]);

      expect(currentCitizen1Balance).to.be.equal(VALUE);

      await expect(
        IzToken.connect(Issuer).controllerRedeem(
          citizen1Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      )
        .to.emit(IzToken, "ControllerRedemption")
        .withArgs(issuerAddress, citizen1Address, VALUE, DATA, DATA_CONTROLLER)
        .to.emit(IzToken, "Transfer")
        .withArgs(citizen1Address, ZERO_ADDRESS, VALUE);

      [newCitizen1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
      ]);

      expect(newCitizen1Balance).to.be.equal(0n);

      // Controller operations ignore paused mode
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      await IzToken.pause();
      await expect(
        IzToken.connect(Issuer).controllerRedeem(
          citizen1Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      ).not.to.be.reverted;
    });

    it("Should revert if non-issuer try to perform a controller transfer", async function () {
      await expect(
        IzToken.connect(Deployer).controllerRedeem(
          citizen1Address,
          VALUE,
          DATA,
          DATA_CONTROLLER
        )
      )
        .to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress")
        .withArgs(deployerAddress);
    });
  });

  /************************************************************************************* */

  describe("Transfer with data functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);
    });

    it("Should revert if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen1).transferWithData(citizen2Address, VALUE, DATA)
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen1).transferWithData(
          citizen2Address,
          MINIMUM_TRANSFER - 1n,
          DATA
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should allow when sent to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen1).transferWithData(
          merchant1Address,
          VALUE - 1n,
          DATA
        )
      )
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(citizen1Address, merchant1Address, VALUE - 1n, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(citizen1Address)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant1Address);

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(1n);
      expect(merchant1Balance).to.be.equal(VALUE - 1n);
    });

    it("Should not be comensated if sent all tokens to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen1).transferWithData(
          merchant1Address,
          VALUE,
          DATA
        )
      )
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(citizen1Address, merchant1Address, VALUE, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant1Address);

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(0);
      expect(merchant1Balance).to.be.equal(VALUE);
    });

    it("Should revert if sent to a non-merchant address", async function () {
      await expect(
        IzToken.connect(Citizen1).transferWithData(deployerAddress, VALUE, DATA)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen1).transferWithData(issuerAddress, VALUE, DATA)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen1).transferWithData(citizen2Address, VALUE, DATA)
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should revert when sent to a merchant (citizen expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        merchant1Address,
        MERCHANT_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(citizen1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen1).transferWithData(
          merchant1Address,
          VALUE,
          DATA
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });

    it("Should revert when sent to a merchant (merchant expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        citizen1Address,
        CITIZEN_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(merchant1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen1).transferWithData(
          merchant1Address,
          VALUE,
          DATA
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Transfer from with data functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);

      await IzToken.connect(Citizen1).approve(citizen2Address, VALUE);
    });

    it("Should revert if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          citizen2Address,
          VALUE,
          DATA,
          {maxPriorityFeePerGas:0}
        )
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          citizen2Address,
          MINIMUM_TRANSFER - 1n,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should allow when sent to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant2Balance: bigint;

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant2Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          merchant2Address,
          VALUE - 1n,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      )
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(citizen1Address, merchant2Address, VALUE - 1n, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(citizen1Address)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant2Address);

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(1n);
      expect(merchant2Balance).to.be.equal(VALUE - 1n);
    });


    it("Should not compensate when sent all tokens to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant2Balance: bigint;

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant2Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          merchant2Address,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      )
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(citizen1Address, merchant2Address, VALUE, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant2Address);

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(0);
      expect(merchant2Balance).to.be.equal(VALUE);
    });

    it("Should revert if sent to a non-merchant address", async function () {
      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          deployerAddress,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          issuerAddress,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          citizen2Address,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should revert when sent to a merchant (citizen expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        merchant1Address,
        MERCHANT_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(citizen1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          merchant1Address,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });

    it("Should revert when sent to a merchant (merchant expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        citizen1Address,
        CITIZEN_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(merchant1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen2).transferFromWithData(
          citizen1Address,
          merchant1Address,
          VALUE,
          DATA,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Mint/Issue/Generate functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    it("Should revert Issue is called", async function () {
      await expect(
        IzToken.connect(Citizen1).issue(citizen1Address, VALUE, DATA)
      ).to.be.revertedWith("Not implemented");
    });

    it("Should allow generate/ditribute when issuer", async function () {
      let currentSupply: bigint = await IzToken.totalSupply();
      const IzTokenAddress: string = await IzToken.getAddress();

      // await expect(IzToken.connect(Issuer).issue(citizen1Address, VALUE, DATA))
      //   .to.emit(IzToken, "Issued")
      //   .withArgs(issuerAddress, citizen1Address, VALUE, DATA);

      await expect(IzToken.connect(Issuer).generate(VALUE, DATA))
        .to.emit(IzToken, "Issued")
        .withArgs(issuerAddress, IzTokenAddress, VALUE, DATA);

      let currentContractBalance: bigint = await IzToken.balanceOf(
        IzTokenAddress
      );
      expect(currentContractBalance).to.be.equal(VALUE);

      await expect(
        IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA)
      )
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(IzTokenAddress, citizen1Address, VALUE, DATA);

      let newContractBalance: bigint = await IzToken.balanceOf(IzTokenAddress);
      expect(newContractBalance).to.be.equal(0);

      let newBalance: bigint = await IzToken.balanceOf(citizen1Address);
      expect(newBalance).to.be.equal(VALUE);

      let newSupply: bigint = await IzToken.totalSupply();
      expect(newSupply).to.be.equal(currentSupply + VALUE);
    });
    it("Should revert generate if not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).generate(VALUE, DATA)
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });

    it("Should revert distribute if not issuer", async function () {
      await expect(
        IzToken.connect(Deployer).distribute(citizen1Address, VALUE, DATA)
      ).to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress");
    });
  });

  /************************************************************************************* */

  describe("Burn/Redeem functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);
    });

    it("Should revert redeem if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen1).redeem(VALUE, DATA)
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert redeem if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen1).redeem(MINIMUM_TRANSFER - 1n, DATA)
      ).to.be.revertedWith("CHECK:Burn not allowed");
    });

    it("Should revert redeem if not merchant", async function () {
      await expect(
        IzToken.connect(Citizen1).redeem(VALUE, DATA)
      ).to.be.revertedWith("CHECK:Burn not allowed");
    });

    it("Should allow redeem if merchant", async function () {
      await IzToken.connect(Citizen1).transferWithData(
        merchant1Address,
        VALUE,
        DATA
      );

      await expect(IzToken.connect(Merchant1).redeem(VALUE - 1n, DATA))
        .to.emit(IzToken, "Redeemed")
        .withArgs(merchant1Address, merchant1Address, VALUE - 1n, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant1Address);

      let merchant1Balance: bigint = await IzToken.balanceOf(merchant1Address);
      expect(merchant1Balance).to.be.equal(1n);
    });

    it("Should not compemse redeemption if merchant if merchan has no tokens", async function () {
      await IzToken.connect(Citizen1).transferWithData(
        merchant1Address,
        VALUE,
        DATA
      );

      await expect(IzToken.connect(Merchant1).redeem(VALUE, DATA))
        .to.emit(IzToken, "Redeemed")
        .withArgs(merchant1Address, merchant1Address, VALUE, DATA)
        .not.to.emit(IzCompensation, "notPaymentEvent");

      let merchant1Balance: bigint = await IzToken.balanceOf(merchant1Address);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Burn / Redeem from functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);

      await IzToken.connect(Citizen1).approve(citizen2Address, VALUE);
      await IzToken.connect(Merchant1).approve(citizen2Address, VALUE);
    });

    it("Should revert redeem if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen1).redeemFrom(merchant1Address, VALUE, DATA)
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert redeem if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen1).redeemFrom(
          merchant1Address,
          MINIMUM_TRANSFER - 1n,
          DATA
        )
      ).to.be.revertedWith("CHECK:Burn not allowed");
    });

    it("Should revert redeem if not merchant", async function () {
      await expect(
        IzToken.connect(Citizen2).redeemFrom(citizen1Address, VALUE, DATA,  {maxPriorityFeePerGas:0})
      ).to.be.revertedWith("CHECK:Burn not allowed");
    });

    it("Should allow redeem if merchant", async function () {
      await IzToken.connect(Citizen1).transferWithData(
        merchant1Address,
        VALUE,
        DATA
      );

      await expect(
        IzToken.connect(Citizen2).redeemFrom(merchant1Address, VALUE - 1n, DATA, {
          maxPriorityFeePerGas: 0,
        })
      )
        .to.emit(IzToken, "Redeemed")
        .withArgs(citizen2Address, merchant1Address, VALUE -1n, DATA)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant1Address);

      let merchant1Balance: bigint = await IzToken.balanceOf(merchant1Address);
      expect(merchant1Balance).to.be.equal(1n);
    });

    it("Should not compense redemtion if merchant has no tokens", async function () {
      await IzToken.connect(Citizen1).transferWithData(
        merchant1Address,
        VALUE,
        DATA
      );

      await expect(
        IzToken.connect(Citizen2).redeemFrom(merchant1Address, VALUE, DATA, {
          maxPriorityFeePerGas: 0,
        })
      )
        .to.emit(IzToken, "Redeemed")
        .withArgs(citizen2Address, merchant1Address, VALUE, DATA)
        .not.to.emit(IzCompensation, "notPaymentEvent");

      let merchant1Balance: bigint = await IzToken.balanceOf(merchant1Address);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Regular transfer functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);
    });

    it("Should revert if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen1).transfer(citizen2Address, VALUE)
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen1).transfer(
          citizen2Address,
          MINIMUM_TRANSFER - 1n
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should allow when sent to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      await expect(IzToken.connect(Citizen1).transfer(merchant1Address, VALUE - 1n))
        .to.emit(IzToken, "Transfer")
        .withArgs(citizen1Address, merchant1Address, VALUE - 1n)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(citizen1Address)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant1Address);

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(1n);
      expect(merchant1Balance).to.be.equal(VALUE - 1n);
    });

     it("Should not compensate when sent all tokens to a merchant", async function () {
       let citizen1Balance: bigint;
       let merchant1Balance: bigint;

       [citizen1Balance, merchant1Balance] = await Promise.all([
         IzToken.balanceOf(citizen1Address),
         IzToken.balanceOf(merchant1Address),
       ]);
       expect(citizen1Balance).to.be.equal(VALUE);
       expect(merchant1Balance).to.be.equal(0);

       await expect(IzToken.connect(Citizen1).transfer(merchant1Address, VALUE))
         .to.emit(IzToken, "Transfer")
         .withArgs(citizen1Address, merchant1Address, VALUE)
         .to.emit(IzCompensation, "notPaymentEvent")
         .withArgs(merchant1Address);

       [citizen1Balance, merchant1Balance] = await Promise.all([
         IzToken.balanceOf(citizen1Address),
         IzToken.balanceOf(merchant1Address),
       ]);
       expect(citizen1Balance).to.be.equal(0);
       expect(merchant1Balance).to.be.equal(VALUE);
     });

    it("Should revert if sent to a non-merchant address", async function () {
      await expect(
        IzToken.connect(Citizen1).transfer(deployerAddress, VALUE)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen1).transfer(issuerAddress, VALUE)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen1).transfer(citizen2Address, VALUE)
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should revert when sent to a merchant (citizen expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        merchant1Address,
        MERCHANT_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(citizen1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen1).transfer(merchant1Address, VALUE)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });

    it("Should revert when sent to a merchant (merchant expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        citizen1Address,
        CITIZEN_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(merchant1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen1).transfer(merchant1Address, VALUE)
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Regular transfer from functionality", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant2Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);

      await IzToken.connect(Citizen1).approve(citizen2Address, VALUE);
    });

    it("Should revert if paused", async function () {
      await IzToken.pause();
      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          citizen2Address,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWithCustomError(IzToken, "EnforcedPause");
    });

    it("Should revert if value bellow minimum", async function () {
      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          citizen2Address,
          MINIMUM_TRANSFER - 1n,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should allow when sent to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant2Balance: bigint;

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant2Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          merchant2Address,
          VALUE - 1n,
          { maxPriorityFeePerGas: 0 }
        )
      )
        .to.emit(IzToken, "Transfer")
        .withArgs(citizen1Address, merchant2Address, VALUE - 1n)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(citizen1Address)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant2Address);

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(1n);
      expect(merchant2Balance).to.be.equal(VALUE - 1n);
    });

    it("Should no compenate when sent all tokens to a merchant", async function () {
      let citizen1Balance: bigint;
      let merchant2Balance: bigint;

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant2Balance).to.be.equal(0);

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          merchant2Address,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      )
        .to.emit(IzToken, "Transfer")
        .withArgs(citizen1Address, merchant2Address, VALUE)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(merchant2Address);

      [citizen1Balance, merchant2Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant2Address),
      ]);
      expect(citizen1Balance).to.be.equal(0);
      expect(merchant2Balance).to.be.equal(VALUE);
    });

    it("Should revert if sent to a non-merchant address", async function () {
      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          deployerAddress,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          issuerAddress,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          citizen2Address,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");
    });

    it("Should revert when sent to a merchant (citizen expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        merchant1Address,
        MERCHANT_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(citizen1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          merchant1Address,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });

    it("Should revert when sent to a merchant (merchant expired)", async function () {
      let citizen1Balance: bigint;
      let merchant1Balance: bigint;

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);

      IzToken.connect(Issuer).addParty(
        citizen1Address,
        CITIZEN_PERMISSION,
        EXPIRATION + 7200,
        PARTY_ATTACHED_DATA
      );

      let block: Block = await provider.getBlock("latest");
      let timestamp: number = block.timestamp;

      const userExpiration: bigint = (
        (await IzToken.parties(merchant1Address)) as any
      ).expiration;

      timestamp = Number(userExpiration);
      await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);

      await expect(
        IzToken.connect(Citizen2).transferFrom(
          citizen1Address,
          merchant1Address,
          VALUE,
          { maxPriorityFeePerGas: 0 }
        )
      ).to.be.revertedWith("CHECK:Transfer not allowed");

      [citizen1Balance, merchant1Balance] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(merchant1Address),
      ]);
      expect(citizen1Balance).to.be.equal(VALUE);
      expect(merchant1Balance).to.be.equal(0);
    });
  });

  /************************************************************************************* */

  describe("Can transfer functionalilty", function () {
    const VALUE: bigint = 1000000000000000000n;

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await IzToken.connect(Issuer).generate(VALUE, DATA);
      await IzToken.connect(Issuer).distribute(citizen1Address, VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          merchant1Address,
          MERCHANT_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);
      await IzToken.connect(Citizen1).transfer(merchant1Address, VALUE);
    });

    it("Should return not accepted if merchant not burning", async function () {
      let result: boolean;
      let resultCode: string;
      let data: string;

      [result, resultCode, data] = await IzToken.connect(Merchant1).canTransfer(
        merchant1Address,
        VALUE,
        DATA
      );
      expect(result).to.be.false;
      expect(resultCode).to.be.equal(EIP1066_TRANSFER_FAILED);
    });

    it("Should return  accepted if merchant is burning", async function () {
      let result: boolean;
      let resultCode: string;
      let data: string;

      [result, resultCode, data] = await IzToken.connect(Merchant1).canTransfer(
        ZERO_ADDRESS,
        VALUE,
        DATA
      );
      expect(result).to.be.true;
      expect(resultCode).to.be.equal(EIP1066_SUCCESS);
    });

    it("Should return not accepted if mechant is burning but value bellow minimum", async function () {
      let result: boolean;
      let resultCode: string;
      let data: string;

      [result, resultCode, data] = await IzToken.connect(Merchant1).canTransfer(
        ZERO_ADDRESS,
        MINIMUM_TRANSFER - 1n,
        DATA
      );
      expect(result).to.be.false;
      expect(resultCode).to.be.equal(EIP1066_TRANSFER_FAILED);
    });
  });

  /************************************************************************************* */

  describe("Send batch functionality", async function () {
    const VALUE: bigint = 4000000000000000000n;
    const VALUES: bigint[] = [
      2000000000000000000n,
      1000000000000000000n,
      1000000000000000000n,
    ];
    //  10000000000000000n;
    //1000000000000000000n
    const VALUES4: bigint[] = [
      2000000000000000000n,
      1000000000000000000n,
      1000000000000000000n,
      1000000000000000000n,
    ];

    let ADDRESSES: string[] = [];

    const NO_PERMISSION = 0;
    const CITIZEN_PERMISSION = 1;
    const MERCHANT_PERMISSION = 2;

    const EXPIRATION = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      ADDRESSES = [citizen1Address, citizen2Address, citizen1Address];

      await IzToken.connect(Issuer).generate(VALUE, DATA);
      // PROVIDE APROPRIATE PERMISSIONS
      await Promise.all([
        IzToken.connect(Issuer).addParty(
          citizen1Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
        IzToken.connect(Issuer).addParty(
          citizen2Address,
          CITIZEN_PERMISSION,
          EXPIRATION,
          PARTY_ATTACHED_DATA
        ),
      ]);

      await Citizen1.sendTransaction({
        to: await IzCompensation.getAddress(),
        value: await provider.getBalance(citizen1Address),
        maxPriorityFeePerGas: 0,
      });

      await Citizen2.sendTransaction({
        to: await IzCompensation.getAddress(),
        value: await provider.getBalance(citizen2Address),
        maxPriorityFeePerGas: 0,
      });
    });

    it("Should revert if arrays have different length", async function () {
      await expect(IzToken.connect(Issuer).distributeBatch(ADDRESSES, VALUES4))
        .to.be.revertedWithCustomError(IzToken, "ArraysLengthMismatch")
        .withArgs(ADDRESSES.length, VALUES4.length);
    });

    it("Should revert if not issuer", async function () {
      await expect(IzToken.connect(Deployer).distributeBatch(ADDRESSES, VALUES))
        .to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress")
        .withArgs(deployerAddress);
    });

    it("Should allow distribution", async function () {
      const izTokenAddress: string = await IzToken.getAddress();
      await expect(IzToken.connect(Issuer).distributeBatch(ADDRESSES, VALUES))
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(izTokenAddress, ADDRESSES[0], VALUES[0], "0x")
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(izTokenAddress, ADDRESSES[1], VALUES[1], "0x")
        .to.emit(IzToken, "transferWithDataEvent")
        .withArgs(izTokenAddress, ADDRESSES[2], VALUES[2], "0x")
        .to.emit(IzCompensation, "paymentEvent")
        .withArgs(ADDRESSES[0], MINIMUM_USER_BALANCE)
        .to.emit(IzCompensation, "paymentEvent")
        .withArgs(ADDRESSES[1], MINIMUM_USER_BALANCE)
        .to.emit(IzCompensation, "notPaymentEvent")
        .withArgs(ADDRESSES[2]);

      let balances: bigint[] = await Promise.all([
        IzToken.balanceOf(citizen1Address),
        IzToken.balanceOf(citizen2Address),
      ]);

      expect(balances[0]).to.be.equal(3000000000000000000n);
      expect(balances[1]).to.be.equal(1000000000000000000n);
    });

    it("Should allow complete execution", async function () {
      const ELEMENTS: number = 10;
      const izTokenAddress: string = await IzToken.getAddress();
      let ADDRESSES_PARTIAL: string[] = [];
      let VALUES_PARTIAL: bigint[] = [];
      for (let i = 0; i < ELEMENTS; i++) {
        ADDRESSES_PARTIAL.push(citizen1Address);
        VALUES_PARTIAL.push(MINIMUM_TRANSFER);
      }

      // const tx:ContractTransactionResponse = await IzToken.connect(Issuer).distributeBatch(
      //   ADDRESSES_PARTIAL,
      //   VALUES_PARTIAL
      // );

      // const receipt:ContractTransactionReceipt | null = await tx.wait();
      // console.log(
      //   `Gas used for partial  distribution ${receipt?.gasUsed.toString()} array length ${ADDRESSES_PARTIAL.length}`
      // );

      await expect(
        IzToken.connect(Issuer).distributeBatch(
          ADDRESSES_PARTIAL,
          VALUES_PARTIAL,
          { gasLimit: BATCH_TX_GAS }
        )
      ).to.emit(IzToken, "executionComplete");
    });

    it("Should allow partial execution", async function () {
      const ELEMENTS: number = 11;

      const izTokenAddress: string = await IzToken.getAddress();
      let ADDRESSES_PARTIAL: string[] = [];
      let VALUES_PARTIAL: bigint[] = [];
      for (let i = 0; i < ELEMENTS; i++) {
        ADDRESSES_PARTIAL.push(citizen1Address);
        VALUES_PARTIAL.push(MINIMUM_TRANSFER);
      }

      // const tx:ContractTransactionResponse = await IzToken.connect(Issuer).distributeBatch(
      //   ADDRESSES_PARTIAL,
      //   VALUES_PARTIAL
      // );

      // const receipt:ContractTransactionReceipt | null = await tx.wait();
      // console.log(
      //   `Gas used for partial  distribution ${receipt?.gasUsed.toString()} array length ${ADDRESSES_PARTIAL.length}`
      // );


      // There is not enough gas to complete transacion
      await expect(
        IzToken.connect(Issuer).distributeBatch(
          ADDRESSES_PARTIAL,
          VALUES_PARTIAL,
          { gasLimit: BATCH_TX_GAS }
        )
      )
      .to.emit(IzToken, "partialExecution")
      .withArgs(ADDRESSES_PARTIAL.length - 1);

      // EXCLUDE PROCESSED ELEMENTS AND RETRY. NOW EXECUTION SHOULD BE COMPLETED
      const ADDRESSES_SLIDED:string[] = ADDRESSES_PARTIAL.slice(ADDRESSES_PARTIAL.length - 1);
      const VALUES_SLIDED:bigint[] = VALUES_PARTIAL.slice(VALUES_PARTIAL.length - 1);
      
      await expect(
        IzToken.connect(Issuer).distributeBatch(
          ADDRESSES_SLIDED,
          VALUES_SLIDED,
          { gasLimit: BATCH_TX_GAS }
        )
      )
      .to.emit(IzToken, "executionComplete");
    });
  });
  /************************************************************************************* */
  describe("Compense mecanism", function () {

   it("Should revert if not issuer", async function () {
      await expect(IzToken.connect(Deployer).compense(citizen1Address))
        .to.be.revertedWithCustomError(IzToken, "UnauthorizedAddress")
        .withArgs(deployerAddress);
    });

    it("Should revert if wrong address", async function () {
      await expect(IzToken.connect(Issuer).compense(ZERO_ADDRESS))
        .to.be.revertedWith("Invalid address");
    });

    it("Should compensate user if balance is bellow minimum", async function () {
      const BALANCE: bigint = await provider.getBalance(citizen1Address);

      await Citizen1.sendTransaction({
        to: await IzCompensation.getAddress(),
        value: BALANCE,
        gasPrice: 0
      });

      const currentCitizen1Balance: bigint = await provider.getBalance(citizen1Address);
      expect(currentCitizen1Balance).to.be.equal(0);  
      
      await expect(IzToken.connect(Issuer).compense(citizen1Address))
      .to.emit(IzCompensation,"paymentEvent")
      .withArgs(citizen1Address, MINIMUM_USER_BALANCE);

      const newCitizen1Balance: bigint = await provider.getBalance(citizen1Address);
      expect(newCitizen1Balance).to.be.equal(MINIMUM_USER_BALANCE);  
    }); 

      it("Should not compensate user if balance is not bellow minimum", async function () {
        const BALANCE: bigint = await provider.getBalance(citizen1Address);

        const currentCitizen1Balance: bigint = await provider.getBalance(
          citizen1Address
        );
        
        await expect(IzToken.connect(Issuer).compense(citizen1Address))
          .to.emit(IzCompensation, "notPaymentEvent")
          .withArgs(citizen1Address);

        const newCitizen1Balance: bigint = await provider.getBalance(citizen1Address);
        expect(newCitizen1Balance).to.be.equal(currentCitizen1Balance);
      }); 
  });
});
