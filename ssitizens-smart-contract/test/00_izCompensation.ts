import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
  IzCompensation,
  IzCompensation__factory,
  MockContract,
  MockContract__factory,
} from "../typechain-types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const VALUE:bigint = 1000000000000000000n;

describe("SSITIZENS COMPENSATION TEST", function () {
   // Needed for low level invocation agains Hardhat chain
   let provider: any;
 
   //Signers: deployer is alwais first signer
   let Deployer: Signer;
   let Issuer: Signer;
   let NewIssuer: Signer;
   let Citizen1: Signer;
   let Citizen2: Signer;
   let AllowedContract: Signer;
 
   // Signer address
   let deployerAddress: string;
   let issuerAddress: string;
   let newIssuerAddress: string;
   let citizen1Address: string;
   let citizen2Address: string;
   let allowedContractAddress: string;

   let izCompensation: IzCompensation;

  async function deployFixture(): Promise<IzCompensation> {
    let IzCompensationFactory = (await ethers.getContractFactory("izCompensation")) as IzCompensation__factory;
    let izCompensation = await IzCompensationFactory.deploy(deployerAddress, issuerAddress,{gasPrice:0, gasLimit:10000000});
     return izCompensation;
   }

  beforeEach(async function () {
    provider = ethers.provider;
    [
      Deployer,
      Issuer,
      NewIssuer,
      Citizen1,
      Citizen2,
      AllowedContract
    ] = await ethers.getSigners();

    [
      deployerAddress,
      issuerAddress,
      newIssuerAddress,
      citizen1Address,
      citizen2Address,
      allowedContractAddress,
    ] = await Promise.all([
      Deployer.getAddress(),
      Issuer.getAddress(),
      NewIssuer.getAddress(),
      Citizen1.getAddress(),
      Citizen2.getAddress(),
      AllowedContract.getAddress(),
    ]);

    izCompensation = await loadFixture(deployFixture);
  });

  it("Check initial values", async function () {
    let deployerAddress:string;
    let issuerAddress:string;

    [deployerAddress, issuerAddress] = await Promise.all([
        izCompensation.owner(),
        izCompensation.issuer(),
    ]);
    expect(deployerAddress).to.equal(deployerAddress);
    expect(issuerAddress).to.equal(issuerAddress);
  });

  describe("Issuer functionality", function () {
      it("Should allow owner to change the issuer", async function () {
        await expect(
          izCompensation.connect(Deployer).changeIssuer(newIssuerAddress)
        ).to.emit(izCompensation, "changeIssuerEvent")
        .withArgs(issuerAddress, newIssuerAddress);
        expect(await izCompensation.issuer()).to.equal(newIssuerAddress);
      });
    
      it("Should revert if non-owner tries to change issuer", async function () {
        await expect(
          izCompensation.connect(Issuer).changeIssuer(newIssuerAddress)
        ).to.be.revertedWithCustomError(
          izCompensation,
          "OwnableUnauthorizedAccount"
        );
      });


      it("Should revert if new issier is zero address", async function () {
        await expect(
          izCompensation.connect(Deployer).changeIssuer(ZERO_ADDRESS)
        ).to.be.revertedWithCustomError(
          izCompensation,
          "addressZeroNotAllowed"
        );
      });
  });

  describe("Pause and Unpause functionality", function () {
    it("Should allow owner or issuer to pause the contract", async function () {
      await expect(izCompensation.pause())
        .to.emit(izCompensation, "Paused")
        .withArgs(deployerAddress);

      expect(await izCompensation.paused()).to.be.true;
    });

    it("Should allow owner or issuer to unpause the contract", async function () {
      await izCompensation.pause();
      await expect(izCompensation.unpause())
        .to.emit(izCompensation, "Unpaused")
        .withArgs(deployerAddress);

      expect(await izCompensation.paused()).to.be.false;
    });

    it("Should revert if non-owner or non-issuer tries to pause", async function () {
      await expect(
        izCompensation.connect(Citizen1).pause()
      ).to.be.revertedWithCustomError(izCompensation, "UnauthorizedAddress");
    });

    it("Should revert if non-owner or non-issuer tries to unpause", async function () {
      await izCompensation.pause();
      await expect(
        izCompensation.connect(Citizen1).unpause()
      ).to.be.revertedWithCustomError(izCompensation, "UnauthorizedAddress");
    });
  });

  describe("Allowed contract functionality", function () {
      it("Should revert non issuer authorize a contract", async function () {
        await expect(izCompensation.connect(Deployer).allowContract(citizen1Address))
        .to.be.revertedWithCustomError(izCompensation,"UnauthorizedAddress").withArgs(deployerAddress);
      });

      it("Should allow issuer authorize a contract", async function () {
        await expect(
          izCompensation.connect(Issuer).allowContract(citizen1Address)
        ).to.emit(izCompensation, "contractAllowedEvent")
        .withArgs(citizen1Address,true);
        expect(await izCompensation.isAllowedContract(citizen1Address)).to.be
          .true;
      });
    
      it("Should revert non issuer remove contract authorization", async function () {
         await expect(izCompensation.connect(Deployer).disallowContract(citizen1Address))
        .to.be.revertedWithCustomError(izCompensation,"UnauthorizedAddress").withArgs(deployerAddress);
      });

       it("Should allow issuer remove autorization from a contract", async function () {
         await expect(
           izCompensation.connect(Issuer).disallowContract(citizen2Address)
         )
           .to.emit(izCompensation, "contractAllowedEvent")
           .withArgs(citizen2Address, false);
         expect(await izCompensation.isAllowedContract(citizen2Address)).to.be
           .false;
       });
  });

  describe("Deposit functionality", function () {
        it("Should handle deposits correctly", async function () {
          expect(await izCompensation.getBalance()).to.equal(0n);  
          await expect(
            Deployer.sendTransaction({
              to: await izCompensation.getAddress(),
              value: VALUE,
            })
          ).to.emit(izCompensation, "balanceIncreasedEvent")
          .withArgs(VALUE,VALUE);
          expect(await izCompensation.getBalance()).to.equal(VALUE);
        });
  });

  describe("Transfer all funds functionality", function () {
        let izCompensationAddress:string;

        this.beforeEach(async function () {
            izCompensationAddress = await izCompensation.getAddress();
            await Deployer.sendTransaction({
              to: izCompensationAddress,
              value: VALUE,
            });
        });

        it("Should allow issuer to transfer all funds", async function () {
            const currentCitizen1Balance = await provider.getBalance(citizen1Address);
            expect(await provider.getBalance(izCompensationAddress)).to.equal(VALUE);     

            await expect(izCompensation.connect(Issuer).transferAllFunds(citizen1Address))
            .to.emit(izCompensation,"balanceDecreasedEvent")
            .withArgs(VALUE,0n);

            expect(await provider.getBalance(izCompensationAddress)).to.equal(0);
            expect(await provider.getBalance(citizen1Address)).to.be.equal(currentCitizen1Balance + VALUE);
        });

        it("Should revert if non issuer tries to transfer all funds", async function () {
          await expect(
            izCompensation.connect(Deployer).transferAllFunds(citizen1Address)
          ).to.be.revertedWithCustomError(izCompensation, "UnauthorizedAddress")
          .withArgs(deployerAddress);
        });
    
        it("Should revert transferAllFunds to zero address", async function () {
            await expect(
            izCompensation.connect(Issuer).transferAllFunds(ZERO_ADDRESS)
            ).to.be.revertedWithCustomError(izCompensation, "addressZeroNotAllowed");
        });
  });

  describe("Compensation functionality", function () {
    let izCompensationAddress: string;

    this.beforeEach(async function () {
      izCompensationAddress = await izCompensation.getAddress();

      await izCompensation
        .connect(Issuer)
        .allowContract(allowedContractAddress);

      // Force citizen2 to have 0 balance
      const citizen2Funds: bigint = await provider.getBalance(citizen2Address);
      await Citizen2.sendTransaction({
        to: allowedContractAddress,
        value: citizen2Funds,
        gasPrice: 0
      });
    });

    it("Should revert transferAllFunds to zero address", async function () {
        await expect(
          izCompensation.connect(AllowedContract).compense(ZERO_ADDRESS,VALUE)
        ).to.be.revertedWithCustomError(
          izCompensation,
          "addressZeroNotAllowed"
        );
    });

    it("Should revert compensation if insufficient funds", async function () {
      await expect(
        izCompensation
          .connect(AllowedContract)
          .compense(citizen2Address, VALUE*2n))
      .to.be.revertedWithCustomError(izCompensation, "NotEnoughFunds");
    });

    it("Should revert compensation if not allowed contract", async function () {
       await expect(
         izCompensation.connect(Citizen1).compense(citizen2Address, VALUE)
       ).to.be.revertedWithCustomError(izCompensation, "UnauthorizedContract")
       .withArgs(citizen1Address);
    });

    it("Should revert compensation if paused", async function () {
      await izCompensation.pause();

      await expect(
        izCompensation.connect(AllowedContract).compense(citizen2Address, VALUE)
      ).to.be.revertedWithCustomError(izCompensation, "EnforcedPause");
    });

    it("Should not send compensation if recipient is a contract", async function () {
        let MockContract_Factory: MockContract__factory =
          (await ethers.getContractFactory(
            "MockContract"
          )) as MockContract__factory;
        let Mock: MockContract = await MockContract_Factory.deploy();
        let mockAddress = await Mock.getAddress();
        
        await Deployer.sendTransaction({
          to: izCompensationAddress,
          value: VALUE,
          gasPrice: 0,
        });
        
       const currentExecutorBalance = await provider.getBalance(mockAddress);
        const currentContractBalance = await provider.getBalance(izCompensationAddress);
  
        await expect(
          izCompensation.connect(AllowedContract).compense(mockAddress, VALUE)
        ).to.emit(izCompensation, "notPaymentEvent")
        .withArgs(mockAddress);

        const newExecutorBalance = await provider.getBalance(mockAddress);
        const newContractBalance = await provider.getBalance(izCompensationAddress);
        
        expect(newExecutorBalance).to.equal(currentExecutorBalance);
        expect(newContractBalance).to.equal(currentContractBalance);
    });

    it("Should send compensation to a EOA", async function () {
      await Deployer.sendTransaction({
        to: izCompensationAddress,
        value: VALUE,
      });

      const currentCitizen2Balance = await provider.getBalance(citizen2Address);
      const currentContractBalance = await provider.getBalance(izCompensationAddress);

      expect(currentCitizen2Balance).to.equal(0);
      expect(currentContractBalance).to.equal(VALUE);

      await expect(
        izCompensation.connect(AllowedContract).compense(citizen2Address, VALUE)
      )
        .to.emit(izCompensation, "balanceDecreasedEvent")
        .withArgs(VALUE,0n)
        .to.emit(izCompensation, "paymentEvent")
        .withArgs(citizen2Address,VALUE);

      const newCitizen2Balance = await provider.getBalance(citizen2Address);
      const newContractBalance = await provider.getBalance(
        izCompensationAddress
      );

      //Cannot calcualte the exact value of the gas fee so we just check that the balance is less than the previous one
      expect(newCitizen2Balance).to.be.equal(currentCitizen2Balance + VALUE);
    });

    it("Should not send compensation to a EOA if accout has enough funds", async function () {
      await Deployer.sendTransaction({
        to: izCompensationAddress,
        value: VALUE,
      });

      const currentCitizen1Balance = await provider.getBalance(citizen1Address);
      const currentContractBalance = await provider.getBalance(
        izCompensationAddress
      );

      expect(currentContractBalance).to.equal(VALUE);

      await expect(
        izCompensation
          .connect(AllowedContract)
          .compense(citizen1Address, currentCitizen1Balance)
      ).to.emit(izCompensation, "notPaymentEvent")
      .withArgs(citizen1Address);

      const newCitizen1Balance = await provider.getBalance(citizen1Address);
      const newContractBalance = await provider.getBalance(
        izCompensationAddress
      );

      expect(newCitizen1Balance).to.equal(currentCitizen1Balance);
      expect(newContractBalance).to.equal(currentContractBalance);
    });
  });
});
