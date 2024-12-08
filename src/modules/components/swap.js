const { SwapEth } = require("./utilities/blockchains/ethereum/swapHelper.eth");
const constructConversation = require("../services/conversationConstructor");

const swapTokens = async (prop) => {
  const conversationResponses = [];
  try {
    const { tokenIn, tokenOut, amountToSwap, slippage, blockchain, userId } =
      prop;

    console.log("swap tokens payload", prop);

    return await SwapEth.swapTokens(
      tokenIn,
      tokenOut,
      amountToSwap,
      slippage,
      userId,
      blockchain
    );
  } catch (error) {
    const result = {
      response: `Failed to Swap Tokens due to ${error.message}, Please try again later.`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { swapTokens };
