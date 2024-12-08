const {
  getContractAddressFromTokenName,
} = require("./utilities/getContractAddress")
const constructConversation = require("../services/conversationConstructor")
const { UserRepository } = require("../repositories/user.repository")
const {
  EthWalletDetails,
} = require("./utilities/blockchains/ethereum/walletDetails.eth")
const { BaseHelper } = require("../../common/utils/helper")

const getWalletBalance = async (prop) => {
  const conversationResponses = []
  try {
    const { userId } = prop
    const user = await UserRepository.getUserById(userId)
    const userAddress = user.wallet

    const balance =
      (await EthWalletDetails.getUserEthWalletBalance(userAddress)) || 0

    const walletBalance = {
      balance: `Your wallet balance is ${BaseHelper.trimNumberToString(balance, 6)} ETH`,
    }

    const response = constructConversation(walletBalance, null, false, true)
    conversationResponses.push(response)
    return conversationResponses
  } catch (error) {
    console.error(error)
    const result = {
      response: `Getting wallet balance failed with ${error.message}. Please try again later or contact support if issue persists.`,
    }

    const response = constructConversation(result, null, false, true)
    conversationResponses.push(response)
    return conversationResponses
  }
}

const getTokenBalance = async (prop) => {
  const conversationResponses = []
  try {
    const { token, userId } = prop

    const user = await UserRepository.getUserById(userId)
    const userAddress = user.wallet

    const {
      statusGetContractAddressFromTokenName,
      resultGetContractAddressFromTokenName,
    } = await getContractAddressFromTokenName(token)

    if (statusGetContractAddressFromTokenName !== 200) {
      const result = {
        response: resultGetContractAddressFromTokenName,
      }
      const response = constructConversation(result, null, false, true)
      conversationResponses.push(response)
      return conversationResponses
    }

    let tokenBalance = 0
    let tokenSymbol = ""
    let tokenDecimal
    const contractAddress = resultGetContractAddressFromTokenName

    console.log({ contractAddress })

    const tokenBalanceResult = await EthWalletDetails.getUserEthTokenBalance(
      userAddress,
      contractAddress[0]
    )

    tokenBalance = tokenBalanceResult.tokenBalance
    tokenSymbol = tokenBalanceResult.tokenSymbol
    tokenDecimal = tokenBalanceResult.tokenDecimal

    const result = {
      balance: `Your token balance is ${Number(
        BaseHelper.convertFromBaseDecimal(tokenBalance, tokenDecimal)
      ).toFixed(4)} ${tokenSymbol}`,
    }
    const response = constructConversation(result, null, false, true)
    conversationResponses.push(response)
    return conversationResponses
  } catch (error) {
    console.error(error)
    const result = {
      response: `Getting Token balance failed with ${error.message}. Please try again later or provide contract address of the token or contact support if issue persists.`,
    }
    const response = constructConversation(result, null, false, true)
    conversationResponses.push(response)
    return conversationResponses
  }
}

module.exports = { getWalletBalance, getTokenBalance }
