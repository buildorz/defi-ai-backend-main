const axios = require("axios");
const constructConversation = require("../services/conversationConstructor");
const { ENVIRONMENT } = require("../../common/utils/environment");
const {
  getContractAddressFromTokenName,
} = require("./utilities/getContractAddress");
const { BaseHelper } = require("../../common/utils/helper");
const dextoolsAPI = ENVIRONMENT.DEXTOOLS.API_KEY;

const fetchDextoolsData = async (tokenContractAddress, endpoint = "/") => {
  const response = await axios.get(
    `https://public-api.dextools.io/standard/v2/token/ether/${tokenContractAddress}${endpoint}`,
    {
      headers: {
        "X-API-KEY": dextoolsAPI,
      },
    }
  );
  return response;
};

const getTokenDetails = async (tokenContractAddress) => {
  try {
    console.log(`Getting Token Details of ${tokenContractAddress}...`);
    const [
      getTokenBasicDetails,
      getAdditionalTokenDetails,
      getTokenPriceDetails,
    ] = await Promise.all([
      fetchDextoolsData(tokenContractAddress),
      fetchDextoolsData(tokenContractAddress, "/info"),
      fetchDextoolsData(tokenContractAddress, "/price"),
    ]);
    // const getTokenBasicDetails = await axios.get(
    //   `https://public-api.dextools.io/standard/v2/token/${chain}/${tokenContractAddress}`,
    //   {
    //     headers: {
    //       "X-API-KEY": dextoolsAPI,
    //     },
    //   }
    // );
    // await BaseHelper.sleep(2000);
    // console.log(
    //   `Getting Additional Token Details of ${tokenContractAddress}...`
    // );

    // const getAdditionalTokenDetails = await axios.get(
    //   `https://public-api.dextools.io/standard/v2/token/${chain}/${tokenContractAddress}/info`,
    //   {
    //     headers: {
    //       "X-API-KEY": dextoolsAPI,
    //     },
    //   }
    // );
    // await BaseHelper.sleep(2000);

    // console.log(`Getting Price Details of ${tokenContractAddress}...`);
    // const getTokenPriceDetails = await axios.get(
    //   `https://public-api.dextools.io/standard/v2/token/${chain}/${tokenContractAddress}/price`,
    //   {
    //     headers: {
    //       "X-API-KEY": dextoolsAPI,
    //     },
    //   }
    // );
    await BaseHelper.sleep(2000);

    const modifiedTokenPriceDetails = {
      UsdPrice: getTokenPriceDetails.data.data.price,
      EthPrice: getTokenPriceDetails.data.data.priceChain,
      UsdVariation5minutes: getTokenPriceDetails.data.data.variation5m,
      EthVariation5minutes: getTokenPriceDetails.data.data.variationChain5m,
      UsdVariation6hours: getTokenPriceDetails.data.data.variation6h,
      EthVariation6hours: getTokenPriceDetails.data.data.variationChain6h,
      UsdPrice24hours: getTokenPriceDetails.data.data.price24h,
      EthPrice24hours: getTokenPriceDetails.data.data.priceChain24h,
    };

    const resultGetTokenDetails = {
      ...getTokenBasicDetails.data.data,
      ...getAdditionalTokenDetails.data.data,
      ...modifiedTokenPriceDetails,
    };

    const statusGetTokenDetails = 200;
    return { statusGetTokenDetails, resultGetTokenDetails };
  } catch (error) {
    console.log(error);
    const statusGetTokenDetails = 404;
    const resultGetTokenDetails = {
      response: `Getting Token Details failed: ${error?.response?.data?.errorMessage ? error?.response?.data?.errorMessage : error.message}`,
    };
    console.log("Getting Token Details Failed! ", resultGetTokenDetails);
    return { statusGetTokenDetails, resultGetTokenDetails };
  }
};

const getEthUsdPrice = async () => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD`
    );
    const resultGetEthUsdPrice = response.data.ethereum.usd;
    const statusGetEthUsdPrice = 200;
    return { statusGetEthUsdPrice, resultGetEthUsdPrice };
  } catch (error) {
    console.log(error);
    const statusGetEthUsdPrice = 404;
    const resultGetEthUsdPrice = `Failed to get ETH price is USD: ${error?.response?.data?.errorMessage ? error?.response?.data?.errorMessage : error.message}`;
    return { statusGetEthUsdPrice, resultGetEthUsdPrice };
  }
};

const getETHDetails = async (EthPrice) => {
  return `
    - Ethereum (ETH) is a decentralized, open-source blockchain platform.
    - It was proposed by Vitalik Buterin and developed by a team of talented individuals.
    - ETH is the native cryptocurrency of the Ethereum network.
    - The current price of ETH is $${EthPrice}.
    - It plays a crucial role in facilitating transactions and powering decentralized applications (DApps) on the Ethereum blockchain.
    - ETH is also used as "gas" to pay for computational services and smart contracts on the network.`;
};

const allTokenDetails = async (prop) => {
  const conversationResponses = [];
  try {
    const { token } = prop;
    if (token.toLowerCase() === "eth") {
      try {
        const { statusGetEthUsdPrice, resultGetEthUsdPrice } =
          await getEthUsdPrice();
        if (statusGetEthUsdPrice !== 200) {
          throw new Error(resultGetEthUsdPrice);
        }
        const ethDetails = await getETHDetails(resultGetEthUsdPrice);
        const result = {
          response: ethDetails,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      } catch (error) {
        const result = {
          response: error.message,
        };
        const response = constructConversation(result, null, false, true);
        conversationResponses.push(response);
        return conversationResponses;
      }
    }
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
    const tokenContractAddress = resultGetContractAddressFromTokenName;

    const { statusGetTokenDetails, resultGetTokenDetails } =
      await getTokenDetails(tokenContractAddress[0]);
    if (statusGetTokenDetails !== 200) {
      const response = constructConversation(
        resultGetTokenDetails,
        null,
        false,
        true
      );
      conversationResponses.push(response);
      return conversationResponses;
    }
    const result = {
      success: true,
      response: resultGetTokenDetails,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  } catch (error) {
    console.error(error);
    const result = {
      success: false,
      response: `Getting Token Details failed. ${error.message}`,
    };
    const response = constructConversation(result, null, false, true);
    conversationResponses.push(response);
    return conversationResponses;
  }
};

module.exports = { allTokenDetails, getEthUsdPrice };
