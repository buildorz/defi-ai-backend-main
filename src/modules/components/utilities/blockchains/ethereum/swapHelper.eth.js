const axios = require("axios");
const { ethers } = require("ethers");
const { getContractAddressFromTokenName } = require("../../getContractAddress");
const { EthWalletDetails } = require("./walletDetails.eth");
const { UserRepository } = require("../../../../repositories/user.repository");
const constructConversation = require("../../../../services/conversationConstructor");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");
const { getTokenAudit } = require("../../../tokenAuditInfo");

// eslint-disable-next-line no-undef
const feeReceiverAddress = ENVIRONMENT.SWAP.FEE_RECEIVER;

class SwapEth {
  async swapTokens(tokenIn, tokenOut, amountToSwap, slippageAmount, userId) {
    const conversationResponses = [];
    try {
      console.log(
        new Date(Date.now()),
        tokenIn,
        tokenOut,
        amountToSwap,
        slippageAmount,
        userId,
      );
      if (amountToSwap <= 0 || slippageAmount < 0) {
        const result = {
          response: `You cannot swap ${amountToSwap} tokens. Please adjust your parameters and try again`,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      }

      console.log("Starting Swap...");
      const user = await UserRepository.getUserById(userId);
      const userAddress = user.wallet;

      let tokenInContractAddress;
      let tokenOutContractAddress;
      let tokenInDetails;
      let tokenOutDetails;
      let result;
      let amount;
      let tokenInBalance;

      let feeDetails = {
        feeAmount: 0,
        feeDecimals: 0,
        feeSymbol: "",
      };

      const EthAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      const slippage = slippageAmount * 100;

      if (tokenIn.toString().toLowerCase() === "eth") {
        console.log("Token In == ETH", new Date(Date.now()));
        tokenInContractAddress = [EthAddress];
        tokenInBalance = await EthWalletDetails.getUserEthWalletBalance(
          userAddress,
          false,
        );

        tokenInDetails = {
          tokenBalance: tokenInBalance,
          tokenName: "Ethereum",
          tokenSymbol: "ETH",
          tokenDecimal: 18,
        };

        console.log("Token In Details: ", new Date(Date.now()), tokenInDetails);

        if (tokenInBalance === 0) {
          const result = {
            response: `Apologies, the swap cannot be executed due to insufficient ${tokenInDetails.tokenSymbol} balance`,
          };
          const response = constructConversation(result, null, false, true);
          conversationResponses.push(response);
          return conversationResponses;
        }

        amount = ethers.parseEther(amountToSwap.toString());

        feeDetails = {
          feeAmount: 0,
          feeDecimals: 18,
          feeSymbol: "ETH",
        };
      } else {
        const {
          statusGetContractAddressFromTokenName,
          resultGetContractAddressFromTokenName,
        } = await getContractAddressFromTokenName(tokenIn);

        if (statusGetContractAddressFromTokenName !== 200) {
          const result = {
            response: resultGetContractAddressFromTokenName,
          };
          const response = constructConversation(result, null, false, true);
          conversationResponses.push(response);
          return conversationResponses;
        }

        tokenInContractAddress = resultGetContractAddressFromTokenName;
        tokenInDetails = await EthWalletDetails.getUserEthTokenBalance(
          userAddress,
          tokenInContractAddress[0],
        );

        if (tokenInDetails.tokenBalance === 0) {
          const result = {
            response: `Apologies, the swap cannot be executed due to insufficient ${tokenInDetails.tokenSymbol} balance`,
          };

          const response = constructConversation(result, null, false, true);
          conversationResponses.push(response);
          return conversationResponses;
        }

        amount = ethers.parseUnits(
          amountToSwap.toString(),
          Number(tokenInDetails.tokenDecimal),
        );

        feeDetails = {
          feeAmount: 0,
          feeDecimals: tokenInDetails.tokenDecimal,
          feeSymbol: tokenInDetails.tokenSymbol,
        };
      }

      if (tokenOut.toString().toLowerCase() === "eth") {
        tokenOutContractAddress = [EthAddress];
        tokenOutDetails = {
          tokenBalance: null,
          tokenName: "Ethereum",
          tokenSymbol: "ETH",
        };
      } else {
        const {
          statusGetContractAddressFromTokenName,
          resultGetContractAddressFromTokenName,
        } = await getContractAddressFromTokenName(tokenOut);

        if (statusGetContractAddressFromTokenName !== 200) {
          const result = {
            response: resultGetContractAddressFromTokenName,
          };
          const response = constructConversation(result, null, false, true);
          conversationResponses.push(response);
          return conversationResponses;
        }

        tokenOutContractAddress = resultGetContractAddressFromTokenName;

        tokenOutDetails = await EthWalletDetails.getUserEthTokenBalance(
          userAddress,
          tokenOutContractAddress[0],
        );
      }

      console.log(
        `Parameters: \nToken in:  ${tokenIn} - ${tokenInContractAddress}
  		\nToken Out: ${tokenOut} - ${tokenOutContractAddress}
  		\nAmount to swap: ${amountToSwap} ${tokenInDetails.tokenSymbol} [${amount}]
  		\nSlippage: ${slippage}
  		\nFees: ${feeDetails.feeAmount}`,
      );

      // Check if the user has enough tokens for the swap

      if (amount > tokenInDetails.tokenBalance) {
        console.log("User doesn't have enough tokens for swap");
        result = {
          response: `You do not have enough tokens to perform the swap. Your ${tokenIn} balance is ${ethers.formatUnits(
            tokenInDetails.tokenBalance.toString(),
            Number(tokenInDetails.tokenDecimal),
          )} while you're attempting to swap ${amountToSwap} ${tokenInDetails.tokenSymbol}`,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      } else {
        let tokenInSellTax,
          tokenOutBuyTax,
          tokenInSlippageModify,
          tokenOutSlippageModify;
        if (tokenInContractAddress[0] !== EthAddress) {
          const { statusGetAuditDetails, resultGetAuditDetails } =
            await getTokenAudit(tokenInContractAddress[0]);
          if (statusGetAuditDetails !== 200) {
            const result = {
              response: resultGetAuditDetails,
            };
            const response = constructConversation(result, null, false, true);
            conversationResponses.push(response);
            return conversationResponses;
          }
          const { slippageModifiable, sellTax } = resultGetAuditDetails;
          const maxSellTax = sellTax.max;
          tokenInSellTax = maxSellTax ? maxSellTax : 0;
          tokenInSlippageModify = slippageModifiable;
        }
        if (tokenOutContractAddress[0] !== EthAddress) {
          const { statusGetAuditDetails, resultGetAuditDetails } =
            await getTokenAudit(tokenOutContractAddress[0]);
          if (statusGetAuditDetails !== 200) {
            const result = {
              response: resultGetAuditDetails,
            };
            const response = constructConversation(result, null, false, true);
            conversationResponses.push(response);
            return conversationResponses;
          }
          const { slippageModifiable, buyTax } = resultGetAuditDetails;
          const maxBuyTax = buyTax.max;
          tokenOutBuyTax = maxBuyTax ? maxBuyTax : 0;
          tokenOutSlippageModify = slippageModifiable;
        }

        const slippageModify =
          tokenInSlippageModify === "yes" || tokenOutSlippageModify === "yes"
            ? "yes"
            : "no";

        console.log("slippage modifiable: ", slippageModify);

        const suggestedSlip = await this.computeSlippage(
          tokenInSellTax,
          tokenOutBuyTax,
          slippageModify,
        );

        let suggestedSlippage = suggestedSlip;

        console.log("Suggested slippage: ", suggestedSlippage);

        if (!suggestedSlip) {
          console.log(
            "An issue occurred while trying to estimate an appropriate slippage for your swap. The swap will proceed using either your stated slippage or the default slippage.",
          );
          suggestedSlippage = slippage;
        }

        const usedSlippage =
          slippage === 0 || slippage === 100 ? suggestedSlippage : slippage;

        console.log("used slippage is: ", usedSlippage);

        const routeResponse = await this.getRouteSummary(
          tokenOutContractAddress[0],
          tokenInContractAddress[0],
          Number(amount).toString(),
          feeReceiverAddress,
          feeDetails.feeAmount,
        );
        if (routeResponse.status !== 200) {
          const response = constructConversation(
            routeResponse,
            null,
            false,
            true,
          );
          conversationResponses.push(response);
          return conversationResponses;
        }
        const routeSummary = routeResponse.data.data.routeSummary;
        const postRouteResponse = await this.postRouteSummary(
          userAddress,
          routeSummary,
          usedSlippage,
        );
        if (postRouteResponse.status !== 200) {
          const response = constructConversation(
            postRouteResponse,
            null,
            false,
            true,
          );
          conversationResponses.push(response);
          return conversationResponses;
        }
        const { amountInUsd, data, routerAddress } =
          postRouteResponse.data.data;
        const {
          tokenIn: expectedTokenIn,
          tokenOut: expectedTokenOut,
          amountIn: expectedAmountIn,
          amountOut: expectedAmountOut,
          gasPrice: gasPrice,
          gas: gasFee,
          gasUsd: gasUsd,
        } = routeSummary;
        const { feeAmount: feeAmount } = routeSummary.extraFee;

        const formattedFeeAmount = ethers.formatUnits(
          feeAmount.toString(),
          Number(feeDetails.feeDecimals),
        );

        const txnFee = BigInt(gasFee) * BigInt(gasPrice);
        let formattedExpectedAmountOut;
        let formattedExpectedAmountIn;

        if (
          tokenOutContractAddress[0].toLowerCase() === EthAddress.toLowerCase()
        ) {
          formattedExpectedAmountOut = ethers.formatEther(
            expectedAmountOut.toString(),
          );
        } else {
          formattedExpectedAmountOut = ethers.formatUnits(
            expectedAmountOut.toString(),
            Number(tokenOutDetails.tokenDecimal),
          );
        }
        let value;
        if (
          tokenInContractAddress[0].toLowerCase() === EthAddress.toLowerCase()
        ) {
          formattedExpectedAmountIn = ethers.formatEther(
            expectedAmountIn.toString(),
          );
          value = BigInt(Number(expectedAmountIn));
        } else {
          formattedExpectedAmountIn = ethers.formatUnits(
            expectedAmountIn.toString(),
            Number(tokenInDetails.tokenDecimal),
          );
          value = 0;
        }
        console.log("data before Store in DB :", JSON.stringify(data));

        const messageData = {
          tokenIn: tokenInDetails.tokenName,
          tokenInSymbol: tokenInDetails.tokenSymbol,
          tokenInCA: tokenInContractAddress[0],
          expectedTokenIn: expectedTokenIn,
          tokenOut: tokenOutDetails.tokenName,
          tokenOutSymbol: tokenOutDetails.tokenSymbol,
          tokenOutCA:
            tokenOutContractAddress[0].toLowerCase() ===
            EthAddress.toLowerCase()
              ? null
              : tokenOutContractAddress[0],
          expectedTokenOut: expectedTokenOut,
          expectedAmountIn: formattedExpectedAmountIn,
          expectedAmountOut: formattedExpectedAmountOut,
          gasPrice: gasPrice,
          txnCost: ethers.formatEther(txnFee),
          txnCostUsd: gasUsd,
          txnValue: value,
          tax: formattedFeeAmount * 2,
          feeDetails: feeDetails,
          feeSymbol: feeDetails.feeSymbol,
          amountInUsd: amountInUsd,
          tokenInSellTax: tokenInSellTax ? tokenInSellTax * 100 : 0,
          tokenOutBuyTax: tokenOutBuyTax ? tokenOutBuyTax * 100 : 0,
          txnFee: txnFee,
          slippageAmount: slippageAmount,
          data: data,
          rawExpectedAmountIn: expectedAmountIn,
          rawExpectedAmountOut: expectedAmountOut,
          routerAddress: routerAddress,
        };

        const message = `You are about to swap ${messageData.expectedAmountIn} ${
          messageData.tokenIn
        } (${messageData.tokenInSymbol}) for ${Number(
          messageData.expectedAmountOut,
        ).toFixed(4)} ${messageData.tokenOut} (${
          messageData.tokenOutSymbol
        })${messageData.tokenOutCA ? `, with contract address: ${messageData.tokenOutCA}` : ""}.\nEstimated transaction cost is ${Number(
          messageData.txnCost,
        ).toFixed(4)} ETH ($${Number(messageData.txnCostUsd).toFixed(2)}).${
          messageData.tax === 0
            ? ""
            : `\nFee: ${messageData.tax} ${messageData.feeSymbol}`
        }.${
          messageData.tokenInSellTax === 0
            ? ""
            : `\nPlease note that the token you're about to swap from has a sell tax of about ${parseInt(messageData.tokenInSellTax)}%`
        }
                    ${
                      messageData.tokenOutBuyTax === 0
                        ? ""
                        : `\nPlease note that the token you're about to swap to has a buy tax of about ${parseInt(messageData.tokenOutBuyTax)}%`
                    }`;

        result = `Awaiting Confirmation... Please confirm the transaction within the next 60 seconds`;

        const tx = {
          to: routerAddress,
          data: data,
          value: value,
          gasLimit: 500000,
        };

        const finalData = {
          function: "swap",
          sub_function: null,
          blockchain: "ethereum",
          tx: tx,
          txData: messageData,
          constructedMessage: message,
        };
        const response = constructConversation(
          result,
          finalData,
          true,
          false,
          60000,
        );
        conversationResponses.push(response);

        return conversationResponses;
      }
    } catch (error) {
      console.error(error);
      const result = {
        response: `Failed to swap tokens: ${error.message}`,
      };
      const response = constructConversation(result, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }
  }

  async getRouteSummary(
    tokenOutContractAddress,
    tokenInContractAddress,
    amountToSwap,
    feeReceiver,
    feeAmount,
  ) {
    try {
      console.log("Getting Route...");
      const getRoute = await axios.get(
        "https://aggregator-api.kyberswap.com/ethereum/api/v1/routes",
        {
          params: {
            tokenIn: tokenInContractAddress,
            tokenOut: tokenOutContractAddress,
            amountIn: amountToSwap,
            saveGas: true,
            gasInclude: true,
            feeReceiver: feeReceiver,
            feeAmount: `${feeAmount}`,
            isInBps: false,
            chargeFeeBy: "currency_in",
          },
        },
      );
      console.log("Get Route successful...");
      return getRoute;
    } catch (error) {
      console.error(error);
      const result = {
        response: `Getting route summary failed. Please adjust your swap parameters and try again.`,
      };
      return JSON.stringify(result);
    }
  }

  async postRouteSummary(userAddress, routeSummary, slippage) {
    try {
      console.log("Posting Route...");
      const swapData = await axios.post(
        "https://aggregator-api.kyberswap.com/ethereum/api/v1/route/build",
        {
          recipient: userAddress,
          sender: userAddress,
          routeSummary: routeSummary,
          slippageTolerance: slippage ? slippage : 100,
        },
      );
      console.log("Post Route Successful...");
      return swapData;
    } catch (error) {
      console.error(error);
      const result = {
        response: `Posting route summary failed, please adjust your swap parameters`,
      };
      return JSON.stringify(result);
    }
  }

  async computeSlippage(
    tokenInSellTax = 0,
    tokenOutBuyTax = 0,
    slippageModifiable,
  ) {
    try {
      console.log("Suggesting slippage...");
      console.log(tokenInSellTax, tokenOutBuyTax, slippageModifiable);
      if (slippageModifiable === "yes") {
        const slippage =
          tokenInSellTax === 0 || tokenOutBuyTax === 0
            ? parseInt((tokenInSellTax + tokenOutBuyTax) * 30000)
            : parseInt((tokenInSellTax + tokenOutBuyTax) * 15000);
        console.log("slippage compute: ", slippage);
        return slippage;
      }
      const slippage = parseInt(
        Math.max(tokenInSellTax, tokenOutBuyTax) * 15000,
      );
      console.log("slippage compute: ", slippage);
      return slippage;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

module.exports = { SwapEth: new SwapEth() };
