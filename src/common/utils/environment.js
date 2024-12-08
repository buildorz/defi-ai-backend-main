/* eslint-disable no-undef */
require("dotenv").config();

const ENVIRONMENT = {
  APP: {
    PORT: process.env.PORT || 8080,
    ENV: process.env.ENV || "development",
    PROJECT_PASSWORD: process.env.PROJECT_PASSWORD || "PASSWORD",
  },
  DB: {
    URL: process.env.DATABASE_URL,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET,
  },
  OPEN_AI: {
    API_KEY: process.env.OPEN_AI_API_KEY,
  },
  ALCHEMY: {
    API_KEY: process.env.ALCHEMY_API_KEY,
    NETWORK: process.env.NETWORK,
  },
  DEXTOOLS: {
    API_KEY: process.env.DEXTOOLS_API_KEY,
  },
  ETHERSCAN: {
    API_KEY: process.env.ETHERSCAN_API_KEY,
  },
  COVALENT: {
    API_KEY: process.env.COVALENT_API_KEY,
  },
  SWAP: {
    TYPEAI_CONTRACT_ADDRESS: process.env.TYPEAI_TOKEN_ADDRESS,
    FEE_RECEIVER: process.env.SWAP_FEE_RECEIVER_ADDRESS,
  },
  BRIDGE: {
    CHANGENOW_API_KEY: process.env.CHANGENOW_API_KEY,
  },
  PLOTLY: {
    PLOTLY_API_KEY: process.env.PLOTLY_API,
    PLOTLY_NAME: process.env.PLOTLY_NAME,
  },
  RPC_URLS: {
    ETH: process.env.ETH_RPC_URL,
    BSC: process.env.BSC_RPC_URL,
    POLYGON: process.env.POLYGON_RPC_URL,
    BASE: process.env.BASE_RPC_URL,
  },
  BASE_REGISTRAR: {
    REGISTRAR_ADDRESS: process.env.BASE_REGISTRAR_ADDRESS,
    L2_RESOLVER_ADDRESS: process.env.BASE_L2_RESOLVER_ADDRESS,
  },
  MIRA_POLYGON_STACK: {
    API_KEY: process.env.MIRA_POLYGON_STACK_API_KEY,
  },
};

(() => {
  console.log("=== validating environments ===");

  const validateEnv = (environment) => {
    Object.keys(environment).forEach((item) => {
      if (typeof environment[item] === "object") {
        validateEnv(environment[item]);
      } else {
        if (!environment[item]) {
          throw new Error(`Environment variable for ${item} not set`);
        }
      }
    });
  };

  validateEnv(ENVIRONMENT);
})();

module.exports = { ENVIRONMENT };
