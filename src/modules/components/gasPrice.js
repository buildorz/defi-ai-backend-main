const { EthUtils } = require("./utilities/blockchains/ethereum/util.eth")
const constructConversation = require("../services/conversationConstructor")

const getCurrentGasPrice = async () => {
  const conversationResponses = []
  try {
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
      await EthUtils.getCurrentGasPrice()

    const result = {
      response: `The current gas price is ${gasPrice} gwei. The maximum fee per gas is ${maxFeePerGas} gwei, and the maximum priority fee per gas is ${maxPriorityFeePerGas} gwei.`,
    }

    const response = constructConversation(result, null, false, true)
    conversationResponses.push(response)
    return conversationResponses
  } catch (error) {
    console.error(error)
    const result = {
      response: `Failed to get current gas prices ${error.message}`,
    }
    const response = constructConversation(result, null, false)
    conversationResponses.push(response)
    return conversationResponses
  }
}

module.exports = { getCurrentGasPrice }
