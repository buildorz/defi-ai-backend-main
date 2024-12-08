const { ethers } = require("ethers");
const { ErrorHandler } = require("../../common/utils/appError");
const constructConversation = require("../services/conversationConstructor");
const { BaseName } = require("./utilities/blockchains/base/basename");

const checkBaseNameAvailability = async (prop) => {
  const conversationResponses = [];
  try {
    const { name, duration } = prop;

    const checkAvailableName = await BaseName.checkAvailableName(name);
    if (!checkAvailableName) {
      const result = {
        response: `Yikes! ${name} is already taken.`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }

    if (duration < 1) {
      const result = {
        response: `You must register a name for at least 1 year.`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }

    const getBaseNamePrice = await BaseName.getBaseNamePrice(name, duration);

    const formattedPrice = await ethers.formatEther(getBaseNamePrice);

    const result = {
      response: `Yay! ${name} is available and it would cost ${Number(formattedPrice).toFixed(6)} ETH to register it for ${duration} ${duration > 1 ? "years" : "year"}.\n\nWould you like to proceed with purchasing this name? Type 'yes' to continue with the registration process or 'no' to cancel.`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  } catch (error) {
    ErrorHandler.asyncErrors(error);

    const result = {
      response: `Failed to register base name: ${error.message}`,
    };

    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { checkBaseNameAvailability };
