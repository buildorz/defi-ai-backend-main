const { ethers } = require("ethers");
const { getContractAddressFromTokenName } = require("../../getContractAddress");
const constructConversation = require("../../../../services/conversationConstructor");
const { UserRepository } = require("../../../../repositories/user.repository");
const { EthWalletDetails } = require("./walletDetails.eth");
const { EthUtils } = require("./util.eth");
const { gasEstimate } = require("./gasEstimate.eth");

const resolveName = async (ensName, blockchain) => {
  const provider = await EthUtils.getProvider(blockchain);
  const address = await provider.resolveName(ensName);
  console.log("Resolved Address: ", address);
  return address;
};

const transferEthToken = async (
  token,
  toAddress,
  amount,
  userId,
  blockchain
) => {
  const conversationResponses = [];
  try {
    if (amount <= 0) {
      const result = {
        response: `You cannot transfer ${amount} tokens. Please adjust your parameters and try again`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }
    const address = ethers.isAddress(toAddress)
      ? toAddress
      : await resolveName(toAddress, blockchain);
    if (!address) {
      const result = {
        response: `${toAddress} is invalid. Please adjust your parameters and try again`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }
    let txData;
    let tokenAddress;
    let formattedamount;
    const user = await UserRepository.getUserById(userId);
    const userAddress = user.wallet;
    if (token.toLowerCase() === "eth") {
      txData = "";
      tokenAddress = "";
      const userBalance = await EthWalletDetails.getUserEthWalletBalance(
        userAddress,
        false
      );
      formattedamount = ethers.parseEther(amount.toString());
      if (formattedamount > userBalance) {
        const result = {
          response: `You do not have enough ETH to send. Your balance is ${ethers.formatEther(
            userBalance.toString()
          )} while you're attempting to transfer ${amount} ETH`,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      }
    } else {
      const {
        statusGetContractAddressFromTokenName,
        resultGetContractAddressFromTokenName,
      } = await getContractAddressFromTokenName(token);
      if (statusGetContractAddressFromTokenName !== 200) {
        const result = {
          response: resultGetContractAddressFromTokenName,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      }
      tokenAddress = resultGetContractAddressFromTokenName;
      const provider = await EthUtils.getProvider(blockchain);
      const contract = new ethers.Contract(
        tokenAddress[0],
        EthWalletDetails.abi,
        provider
      );
      const { tokenBalance, tokenDecimal, tokenSymbol } =
        await EthWalletDetails.getUserEthTokenBalance(
          userAddress,
          tokenAddress[0]
        );
      formattedamount = ethers.parseUnits(
        amount.toString(),
        Number(tokenDecimal)
      );
      if (formattedamount > tokenBalance) {
        const result = {
          response: `You do not have enough tokens to send. Your ${tokenSymbol} balance is ${ethers.formatUnits(
            tokenBalance.toString(),
            Number(tokenDecimal)
          )} while you're attempting to transfer ${amount} ${tokenSymbol}`,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      }
      txData = contract.interface.encodeFunctionData("transfer", [
        address,
        BigInt(formattedamount),
      ]);
    }

    const value =
      token.toLowerCase() === "eth" ? ethers.parseEther(amount.toString()) : 0;
    const recipient = token.toLowerCase() === "eth" ? address : tokenAddress[0];
    const { status, gasEstimateResponse } = await gasEstimate(
      address,
      txData,
      value,
      blockchain
    );

    if (status === 404) {
      const response = constructConversation(
        gasEstimateResponse,
        null,
        false,
        false
      );
      conversationResponses.push(response);
      return conversationResponses;
    }

    const tx = {
      to: recipient,
      value: value,
      gasLimit: 500000,
      data: txData,
    };

    const data = {
      token: token,
      toAddress: address,
      amount: formattedamount,
      gasEstimate: gasEstimateResponse,
      tokenAddress: tokenAddress[0],
      recipient: recipient,
      rawAmount: amount,
    };

    const message = `You are about to transfer ${data.rawAmount} ${
      data.token
    } ${data.token.toLowerCase() === "eth" ? "" : `(${data.tokenAddress})`} to ${data.toAddress}.\nEstimated transaction cost is ${Number(
      ethers.formatEther(Number(data.gasEstimate).toString())
    ).toFixed(8)} ETH`;

    const result = `Awaiting Confirmation... Please confirm the transaction within the next 60 seconds`;

    const finalData = {
      function: "send",
      sub_function: null,
      blockchain: "ethereum",
      tx: tx,
      txData: data,
      constructedMessage: message,
    };
    const response = constructConversation(
      result,
      finalData,
      true,
      false,
      60000
    );
    conversationResponses.push(response);

    return conversationResponses;
  } catch (error) {
    console.log(error);
    const result = {
      response: `Failed to transfer tokens: ${error.message}`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { transferEthToken };
