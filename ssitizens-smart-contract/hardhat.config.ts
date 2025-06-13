import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";
import "./tasks/checkConsole";

const ZERO_PK: string =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0, // So tx fees will be predictable
      gasPrice: 0, // Force all tx to be 0 gas price
      chainId: 20250207,
      izDEPLOYMENT: {
        OWNER: "0xD0048fDd48AA86EA23d19F62D2B3fC1B7156Bf48",
        ISSUER: "0xD0048fDd48AA86EA23d19F62D2B3fC1B7156Bf48",
        NAME: "IzToken",
        SYMBOL: "IZT",
        MIN_TRANSFER: "10000000000000000",
        MIN_USER_BALANCE: "20000000000000000",
      },
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "http://",
      accounts: [
        `${process.env.DEPLOYER_PK || ZERO_PK}`
      ],
      izDEPLOYMENT: {
        OWNER: "0xD0048fDd48AA86EA23d19F62D2B3fC1B7156Bf48",
        ISSUER: "0xD0048fDd48AA86EA23d19F62D2B3fC1B7156Bf48",
        NAME: "IzToken",
        SYMBOL: "IZT",
        MIN_TRANSFER: "10000000000000000",
        MIN_USER_BALANCE: "20000000000000000",
      },
    },
  },
};

export default config;
