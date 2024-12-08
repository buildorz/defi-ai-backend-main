const { ethers } = require("ethers");
const constructConversation = require("../services/conversationConstructor");
const { CovalentClient } = require("@covalenthq/client-sdk");
const { UserRepository } = require("../repositories/user.repository");
const { ENVIRONMENT } = require("../../common/utils/environment");

const getNetworkFromBlockchain = (blockchain) => {
  blockchain = blockchain.toLowerCase()

  if (['eth', 'ethereum'].includes(blockchain)) {
    return 'eth-mainnet'
  } else if (blockchain === 'base') {
    return 'base-mainnet'
  } else if (blockchain === 'polygon') {
    return 'matic-mainnet'
  } else if (blockchain === 'bsc') {
    return 'bsc-mainnet'
  }
}

const getUserPortfolio = async (userAddress, nftConfirmation, blockchain) => {
  try {
    // eslint-disable-next-line no-undef
    const covalentAPI = ENVIRONMENT.COVALENT.API_KEY;
    const client = new CovalentClient(covalentAPI);
    const network = getNetworkFromBlockchain(blockchain);

    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      network,
      userAddress,
      { nft: nftConfirmation }
    );

    const isDate = resp.data?.updated_at ? resp.data.updated_at : null;
    let dateTimeUpdated = null;

    if (isDate) {
      const dateUpdated = new Date(resp.data.updated_at).toDateString();
      const timeUpdated = new Date(resp.data.updated_at).toLocaleTimeString();
      dateTimeUpdated = dateUpdated + " " + timeUpdated;
    }

    let portfolio = [];

    // check if user has no portfolio
    if (resp.data.items.length === 0) {
      throw new Error("It looks like your portfolio is currently empty.");
    }

    for (let i = 0; i < resp.data.items.length; i++) {
      const item = resp.data.items[i];

      const tokenBalance = ethers.formatUnits(
        item.balance.toString(),
        item.contract_decimals
      );

      const usdBalance = item.pretty_quote;

      const element = {
        name: item.contract_name,
        symbol: item.contract_ticker_symbol,
        contract_name: item?.contract_name,
        contract_address: item.contract_address,
        type: item.type,
        balance: tokenBalance,
        balanceUSD: item.pretty_quote,
        quote: item?.quote,
      };

      const tokenValue = usdBalance ? parseFloat(usdBalance.substring(1)) : 0;
      if (tokenBalance > 0 || tokenValue > 0) {
        portfolio.push(element);
      }
    }

    // filter null portfolio items
    portfolio = portfolio.filter(
      (item) => item?.contract_name && item?.contract_address
    );

    const status = 200;
    return { portfolio, dateTimeUpdated, status };
  } catch (error) {
    console.error(error);
    console.log("Getting User Token Balances Failed");
    return {
      status: 404,
      response: `Getting all user Token Balances failed. (${error.message}). Please try again later.`,
    };
  }
};

const getUserTokenPortfolio = async (prop) => {
  const conversationResponses = [];
  try {
    const { nftConfirmation, userId, blockchain } = prop;
    console.log("getUserTokenPortfolio", {
      nftConfirmation,
      userId,
    });

    const user = await UserRepository.getUserById(userId);
    const userAddress = user.wallet;

    const { portfolio, dateTimeUpdated, status } = await getUserPortfolio(
      userAddress,
      nftConfirmation,
        blockchain
    );

    if (status !== 200) {
      const FailedResult = {
        response: `Getting Users Token Portfolio failed, please try again later`,
      };
      const response = constructConversation(FailedResult, null, false, true);
      conversationResponses.push(response);
      return conversationResponses;
    }
    console.log("Getting portfolio...");
    let tokenList = ``;
    let nftList = ``;
    let portfolioValue = 0;

    for (let i = 0; i < portfolio.length; i++) {
      const token = portfolio[i];
      if (token.type === "nft") {
        const tokenResponse = `\n${token.name} (${token.balance})\n[${token.contract_address}]\n`;
        nftList += tokenResponse;
      } else {
        const tokenValue = token.balanceUSD
          ? parseFloat(token.balanceUSD.substring(1))
          : 0;
        portfolioValue += tokenValue;
        const tokenResponse = `\n${token.name} - ${Number(
          token.balance
        ).toFixed(
          4
        )} ${token.symbol} ${token.balanceUSD ? `(${token.balanceUSD})` : ""}`;
        tokenList += tokenResponse;
      }
    }

    const result = {
      portfolio: `${dateTimeUpdated ? `As of ${dateTimeUpdated}, ` : ""}Your Token Portfolio value is $${Number(
        portfolioValue
      ).toFixed(2)} and it comprises of ${
        portfolio.length
      } tokens.\n${tokenList}\n${
        nftConfirmation === false
          ? ""
          : `${nftList === "" ? "" : `NFTS: ${nftList}`}`
      }`,
      prompt: "do not modify this",
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  } catch (error) {
    console.error(error);
    const result = {
      response: `Getting Users Token Portfolio failed with ${error.message}. Please try again later`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { getUserTokenPortfolio };
