const { ethers } = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");
const { EthUtils } = require("../ethereum/util.eth");
const { BaseName } = require("./basename");
const constructConversation = require("../../../../services/conversationConstructor");
const { UserRepository } = require("../../../../repositories/user.repository");
const { gasEstimate } = require("../ethereum/gasEstimate.eth");
const { registrarABI } = require("./constants/registrar_abi.json");

const purchaseBaseName = async (prop) => {
  const conversationResponses = [];
  try {
    const { name, duration, userId } = prop;

    // Input validation
    if (!name || !duration) {
      const result = {
        response: "Name and duration are required for registration",
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }

    // Get user's address
    const user = await UserRepository.getUserById(userId);
    const userAddress = user.wallet;

    // Check name availability
    const isAvailable = await BaseName.checkAvailableName(name);
    if (!isAvailable) {
      const result = {
        response: `The name ${name} is not available for registration`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }

    // Get registration price
    const price = await BaseName.getBaseNamePrice(name, duration);
    const durationInSeconds = BaseName.convertYearToSeconds(duration);

    // Prepare registration request
    const registrationRequest = {
      name: name,
      owner: userAddress,
      duration: durationInSeconds,
      resolver: ENVIRONMENT.BASE_REGISTRAR.L2_RESOLVER_ADDRESS,
      data: [], // Empty array for basic registration
      reverseRecord: true, // Enable reverse record lookup
    };

    // Get contract instance for gas estimation
    const provider = await EthUtils.getProvider("BASE");
    const { REGISTRAR_ADDRESS } = ENVIRONMENT.BASE_REGISTRAR;
    const BaseNameContract = new ethers.Contract(
      REGISTRAR_ADDRESS,
      registrarABI,
      provider
    );

    // Encode the function data
    const txData = BaseNameContract.interface.encodeFunctionData("register", [
      registrationRequest,
    ]);

    // Estimate gas
    const { status, gasEstimateResponse } = await gasEstimate(
      REGISTRAR_ADDRESS,
      txData,
      price,
      "BASE"
    );

    if (status === 404) {
      const response = constructConversation(
        gasEstimateResponse,
        null,
        false,
        true
      );
      conversationResponses.push(response);
      return conversationResponses;
    }

    // Prepare transaction data for frontend
    const tx = {
      to: REGISTRAR_ADDRESS,
      value: price,
      gasLimit: 500000,
      data: txData,
    };

    const data = {
      name: name,
      duration: duration,
      price: ethers.formatEther(price),
      gasEstimate: gasEstimateResponse,
      registrationRequest: registrationRequest,
    };

    const message = `You are about to register ${name}.base for ${duration} year(s) at ${ethers.formatEther(price)} BASE.\nEstimated transaction cost is ${Number(
      ethers.formatEther(Number(gasEstimateResponse).toString())
    ).toFixed(8)} BASE`;

    const result = `Awaiting Confirmation... Please confirm the transaction within the next 60 seconds`;

    const finalData = {
      function: "register_base_name",
      sub_function: null,
      blockchain: "base",
      tx: tx,
      txData: data,
      constructedMessage: message,
    };

    const response = constructConversation(result, finalData, true, false);
    conversationResponses.push(response);
    return conversationResponses;
  } catch (error) {
    ErrorHandler.asyncErrors(error);
    const result = {
      response: `Failed to prepare Base name registration: ${error.message}`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { purchaseBaseName };
