const ethers = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");

class EthUtils {
  async getProvider(chain = "ethereum") {
    if (["eth", "ethereum"].includes(chain.toLowerCase())) {
      chain = "eth";
    }

    let rpcUrl = ENVIRONMENT.RPC_URLS[chain.toUpperCase()];
    if (!rpcUrl) {
      throw new Error(`RPC URL for chain ${chain} not found`);
    }

    return new ethers.JsonRpcProvider(rpcUrl);
  }

  async getCurrentGasPrice(blockchain) {
    try {
      const provider = await this.getProvider(blockchain);
      const feeData = await provider.getFeeData();

      const gasPrice = feeData.gasPrice
        ? ethers.formatUnits(feeData.gasPrice, "gwei")
        : null;
      const maxFeePerGas = feeData.maxFeePerGas
        ? ethers.formatUnits(feeData.maxFeePerGas, "gwei")
        : null;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
        ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")
        : null;

      return {
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  async getAddress(address) {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      console.log("Invalid Address");
      return false;
    }
  }
}

module.exports = { EthUtils: new EthUtils() };
