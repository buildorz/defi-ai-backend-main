const { EthUtils } = require("../utilities/blockchains/ethereum/util.eth");
const ethers = require("ethers");
const dotenv = require("dotenv");
dotenv.config();
const erc20Abi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

const strategyManagerAbi = require("./abi/strategyManagerABI.json");
// const delegateManagerAbi = require('./abi/delegationManagerABI.json');
const constructConversation = require("../../services/conversationConstructor");

const strategyManagerContractAddress =
  "0x858646372CC42E1A627fcE94aa7A7033e7CF075A";
const stETHStrategyAddress = "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const eigeinStrategyAddress = "0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7";
const daiStrategyAddress = "0x71cB984BbcbaE0E85c8d59dB131246FA694e100D";

const strategyAddress = {
  "0xec53bf9167f50cdeb3ae105f56099aaab9061f83": eigeinStrategyAddress,
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": stETHStrategyAddress,
  "0x6b175474e89094c44da98b954eedeac495271d0f": daiStrategyAddress,
};
const supportedStakeTokensMap = {
  EIGEN: "0xec53bf9167f50cdeb3ae105f56099aaab9061f83",
  STETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
  // "PEPE": "0x6982508145454ce325ddbe47a25d4ec3d2311933",
  // "USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
};

async function getTokenDecimal(tokencontractAddress) {
  try {
    const provider = await EthUtils.getProvider();
    const tokenContract = new ethers.Contract(
      tokencontractAddress,
      erc20Abi,
      provider
    );
    const decimal = await tokenContract.decimals();
    return decimal;
  } catch (error) {
    console.log("get token Decimal Error", error);
    return false;
  }
}

async function createRestakeTransaction({ tokenName, amount }) {
  const conversationResponses = [];
  try {
    if (!tokenName || !amount) {
      const result = {
        response: `Please provide a valid token name and amount`,
      };
      const response = constructConversation(result);
      conversationResponses.push(response);
      return conversationResponses;
    }
    if (amount <= 0) {
      const result = {
        response: `Please provide a valid amount`,
      };
      const response = constructConversation(result);
      conversationResponses.push(response);
      return conversationResponses;
    }

    const isSupported = supportedStakeTokensMap[tokenName.toUpperCase()];
    if (!isSupported) {
      const result = {
        response: `This token is not currently supported, tey EIGEN token, stETH and PEPE`,
      };
      const response = constructConversation(result);
      conversationResponses.push(response);
      return conversationResponses;
    }
    const tokenContractAddress =
      supportedStakeTokensMap[tokenName.toUpperCase()];
    const provider = await EthUtils.getProvider();
    const strategyManagerContract = new ethers.Contract(
      strategyManagerContractAddress,
      strategyManagerAbi,
      provider
    );

    // Get the contract interface
    const strategyManagerInterface = strategyManagerContract.interface;

    const tokenDecimal = await getTokenDecimal(tokenContractAddress);

    const amountInWei = ethers.parseUnits(amount.toString(), tokenDecimal);

    // Create the transaction data
    const txData = strategyManagerInterface.encodeFunctionData(
      "depositIntoStrategy",
      [strategyAddress[tokenContractAddress], tokenContractAddress, amountInWei]
    );

    const message = `you are about to stake ${amount} ${tokenName}`;
    // Return transaction object
    const data = {
      function: "restake",
      blockchain: "ethereum",
      to: strategyManagerContractAddress,
      txData: txData,
      amount: amountInWei,
      tokenContractAddress: tokenContractAddress,
      tokenDecimal: tokenDecimal,
      constructedMessage: message,
      strategy: strategyAddress[tokenContractAddress],
    };
    const result = {
      response: `Confirm To Restake ${tokenName}`,
    };
    const response = constructConversation(result, data, true, true);
    conversationResponses.push(response);
    return conversationResponses;
    // All other function including Approval and Delegation would happen on the FrontEnd
  } catch (error) {
    console.error("createRestakeTransaction error", error);
    return null;
  }
}

module.exports = {
  createRestakeTransaction,
};
