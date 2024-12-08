const axios = require("axios");

const getContractAddressFromTokenName = async (
  tokenName,
  returnTokenName = false,
  blockchain = "ethereum"
) => {
  try {
    blockchain = blockchain.toLowerCase();
    let base;

    switch (blockchain.toLowerCase()) {
      case "ethereum":
        base = "eth";
        break;
      case "bsc":
        base = "bsc";
        break;
      case "polygon":
      case "matic":
        base = "polygon";
        break;
      case "base":
        base = "base";
        break;
      default:
        base = "eth";
        break;
    }

    let tokenContractAddresses = [];
    let tokensPreSort = [];
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${tokenName}%20${base}`
    );

    const tokens = response.data.pairs.filter((token) => {
      if (token.chainId === "ethereum") {
        return token.chainId === blockchain || token.chainId === "pulsechain";
      } else {
        return token.chainId === blockchain;
      }
    });

    tokens.forEach((token) => {
      if (token.liquidity) {
        tokensPreSort.push(token);
      }
    });

    const tokensSorted = tokensPreSort.sort((a, b) => {
      return b.liquidity.usd - a.liquidity.usd;
    });

    tokensSorted.forEach((element) => {
      if (
        element.baseToken.symbol
          .toUpperCase()
          .includes(tokenName.toUpperCase()) ||
        element.baseToken.name
          .toUpperCase()
          .includes(tokenName.toUpperCase()) ||
        element.baseToken.address
          .toUpperCase()
          .includes(tokenName.toUpperCase())
      ) {
        if (returnTokenName) {
          tokenContractAddresses.push(element.baseToken.name);
        } else {
          tokenContractAddresses.push(element.baseToken.address);
        }
      }

      if (
        element.quoteToken.symbol
          .toUpperCase()
          .includes(tokenName.toUpperCase()) ||
        element.quoteToken.name
          .toUpperCase()
          .includes(tokenName.toUpperCase()) ||
        element.quoteToken.address
          .toUpperCase()
          .includes(tokenName.toUpperCase())
      ) {
        if (returnTokenName) {
          tokenContractAddresses.push(element.quoteToken.name);
        } else {
          tokenContractAddresses.push(element.quoteToken.address);
        }
      }
    });

    tokenContractAddresses = tokenContractAddresses.filter((value, index) => {
      return tokenContractAddresses.indexOf(value) === index;
    });

    if (tokenContractAddresses.length === 0) {
      const statusGetContractAddressFromTokenName = 404;
      const resultGetContractAddressFromTokenName =
        "Token Contract Address Not found";
      return {
        statusGetContractAddressFromTokenName,
        resultGetContractAddressFromTokenName,
      };
    }

    const statusGetContractAddressFromTokenName = 200;
    const resultGetContractAddressFromTokenName = tokenContractAddresses;
    return {
      statusGetContractAddressFromTokenName,
      resultGetContractAddressFromTokenName,
    };
  } catch (error) {
    console.error(error);
    const statusGetContractAddressFromTokenName = 404;
    const resultGetContractAddressFromTokenName = `Error retrieving token contract address: ${error.message}`;
    return {
      statusGetContractAddressFromTokenName,
      resultGetContractAddressFromTokenName,
    };
  }
};

module.exports = { getContractAddressFromTokenName };
