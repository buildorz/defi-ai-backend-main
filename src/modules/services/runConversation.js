const { OpenAI } = require("openai");
const { ENVIRONMENT } = require("../../common/utils/environment.js");
const {
  preProcessMessages,
  extendedSystemMessage,
} = require("./preProcessMessage.js");
const constructConversation = require("./conversationConstructor.js");
const { MessageRepository } = require("../repositories/message.repository.js");
const { ErrorHandler } = require("../../common/utils/appError.js");
const {
  functions,
  allTokenDetails,
  getCurrentGasPrice,
  getUserTokenPortfolio,
  getTokenBalance,
  getWalletBalance,
  sendToken,
  swapTokens,
  registerBaseName,
} = require("../components/gpt-functions.js");
const {
  ChatHistoryRepository,
} = require("../repositories/chatHistory.repository.js");
const { ChatHistoryRoleEnum } = require("@prisma/client");

const openai = new OpenAI({ apiKey: ENVIRONMENT.OPEN_AI.API_KEY });
// const gptModel = 'gpt-3.5-turbo-1106';
// const gptModel = 'gpt-4-turbo-2024-04-09';

// prev
const gptModel = "gpt-3.5-turbo-1106";
// const gptModelTwo = 'gpt-3.5-turbo-1106';

// new
// const gptModel = 'gpt-4-turbo';
const gptModelTwo = "gpt-4-turbo";

async function runConversation(userId, message, blockchain) {
  const queryResponse = [];
  try {
    const [{ userMessages, status }] = await Promise.all([
      preProcessMessages(userId, blockchain),
      ChatHistoryRepository.addChatHistory(
        userId,
        message,
        ChatHistoryRoleEnum.USER
      ),
    ]);

    console.log("user message", message);

    if (status === 404) {
      console.log(`Failed to retrieve messages for user ${userId}`);
      const message = "Failed to retrieve users message";
      const reply = constructConversation(message, null, false, false);
      queryResponse.push(reply);
      return queryResponse;
    }

    userMessages.push({
      role: "user",
      content: message,
    });

    const response = await openai.chat.completions.create({
      model: gptModel,
      messages: userMessages,
      tools: functions,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    console.log({ response, responseMessage });
    const toolCalls = responseMessage.tool_calls;

    let _confirmation = false;
    let _data = null;
    let _confirmationTime = 0;
    let _imageData = false;

    if (responseMessage.tool_calls) {
      console.log("Function Called... ");
      // Note: the JSON response may not always be valid; be sure to handle errors
      const availableFunctions = {
        get_wallet_balance: getWalletBalance,
        get_token_balance: getTokenBalance,
        all_token_details: allTokenDetails,
        get_user_token_portfolio: getUserTokenPortfolio,
        get_transaction_fee: getCurrentGasPrice,
        transfer_tokens: sendToken,
        swap_tokens: swapTokens,
        register_base_name: registerBaseName,
      };

      userMessages.push(responseMessage); // extend conversation with assistant's reply

      for (const toolCall of toolCalls) {
        const functionData = toolCall.function;

        if (!functionData) {
          throw new Error();
        }

        const functionName = functionData.name;
        const functionToCall = availableFunctions[functionName];
        console.log("function name: ", functionName);
        const functionArgs = JSON.parse(functionData.arguments);

        // let args = [];
        // Object.keys(functionArgs).forEach((key) => {
        //   const value = functionArgs[key];
        //   args.push(value);
        // });
        // args.push(blockchain);
        // args.push(userId);
        functionArgs.blockchain = blockchain;
        functionArgs.userId = userId;
        console.log("function arguments: ", functionArgs);

        // const functionResponses = await functionToCall.apply(this, args);
        const functionResponses = await functionToCall(functionArgs);

        console.log("checking function Response: ", functionResponses);

        if (!functionResponses?.length) {
          throw new Error("");
        }

        for (let i = 0; i < functionResponses.length; i++) {
          const functionResponse = functionResponses[i];
          const { message, confirmation, data, confirmationTime, imageData } =
            functionResponse;

          if (functionResponses.length - 1 == i) {
            userMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: message,
            });
            _confirmation = confirmation;
            _data = data;
            _confirmationTime = confirmationTime;
            _imageData = imageData;
          } else {
            const response = constructConversation(
              message,
              data,
              confirmation,
              false,
              confirmationTime,
              imageData
            );
            queryResponse.push(response);
          }
        }
      }
    }

    // extend conversation with function response
    console.log("extending conversation...");
    const copiedUserMessage = JSON.parse(JSON.stringify(userMessages));
    copiedUserMessage.push(extendedSystemMessage);
    const secondResponse = await openai.chat.completions.create({
      model: gptModelTwo,
      messages: copiedUserMessage,
    }); // get a new response from GPT where it can see the function response
    const finalResponse = secondResponse["choices"][0]["message"];
    userMessages.push(finalResponse);

    userMessages.shift();

    await MessageRepository.createOrUpdateUserMessage(userId, userMessages);

    console.log("supposed Content: ", finalResponse);

    const { content } = finalResponse;
    // add response to chat history
    await ChatHistoryRepository.addChatHistory(
      userId,
      content,
      ChatHistoryRoleEnum.BOT,
      _imageData ? _data : null
    ).catch((e) => console.error("Error adding chat history", e));

    const resp = constructConversation(
      content,
      _data,
      _confirmation,
      false,
      _confirmationTime,
      _imageData
    );
    queryResponse.push(resp);

    return queryResponse;
  } catch (error) {
    ErrorHandler.asyncErrors(error, "runConversation Error");
    const message =
      "An error occurred while processing your request. Please consider rephrasing your message or attempting again";

    const runConversationError = constructConversation(
      message,
      null,
      false,
      false
    );

    queryResponse.push(runConversationError);

    // clear message for user
    await MessageRepository.deleteUserMessage(userId);

    return queryResponse;
  }
}

module.exports = { runConversation };
