const { EthUtils } = require("./utilities/blockchains/ethereum/util.eth");
const constructConversation = require("../services/conversationConstructor");

const getCurrentGasPrice = async (prop) => {
  const conversationResponses = [];
  try {
    const { blockchain } = prop;
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
      await EthUtils.getCurrentGasPrice(blockchain);

    const result = {
      response: `${gasPrice ? `The current gas price is ${gasPrice} gwei.` : ""} ${
        maxFeePerGas ? `The maximum fee per gas is ${maxFeePerGas} gwei.` : ""
      } ${
        maxPriorityFeePerGas
          ? `The maximum priority fee per gas is ${maxPriorityFeePerGas} gwei.`
          : ""
      }`,
    };

    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  } catch (error) {
    console.error(error);
    const result = {
      response: `Failed to get current gas prices ${error.message}`,
    };
    const response = constructConversation(result, null, false);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { getCurrentGasPrice };
