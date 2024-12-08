const { ErrorHandler } = require("../../common/utils/appError");
const constructConversation = require("../services/conversationConstructor");
const {
  transferEthToken,
} = require("./utilities/blockchains/ethereum/sendTokenHelper.eth");

const sendToken = async (prop) => {
  const conversationResponses = [];
  try {
    const { token, toAddress, amount, userId } = prop;
    console.log("send token main function ", {
      token,
      toAddress,
      amount,
      userId,
    });

    return await transferEthToken(token, toAddress, amount, userId);
  } catch (error) {
    ErrorHandler.asyncErrors(error);

    const result = {
      response: `Failed to transfer tokens: ${error.message}`,
    };

    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { sendToken };
