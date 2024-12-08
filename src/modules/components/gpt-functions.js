const { getCurrentGasPrice } = require("./gasPrice");
const { allTokenDetails } = require("./tokenDetails");
const { getUserTokenPortfolio } = require("./userPortfolio");
const { getWalletBalance, getTokenBalance } = require("./userBalance");
const { sendToken } = require("./send");
const { swapTokens } = require("./swap");
const { registerBaseName } = require("./registerBaseName");
const { functions } = require("./utilities/functions");

module.exports = {
  getCurrentGasPrice,
  allTokenDetails,
  getUserTokenPortfolio,
  getWalletBalance,
  getTokenBalance,
  sendToken,
  swapTokens,
  registerBaseName,
  functions,
};
