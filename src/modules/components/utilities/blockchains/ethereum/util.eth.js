const ethers = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");

class EthUtils {
    async getProvider() {
        const network = ENVIRONMENT.ALCHEMY.NETWORK;
        const apiKey = ENVIRONMENT.ALCHEMY.API_KEY;
        // const provider = new ethers.getDefaultProvider(network);
        return new ethers.AlchemyProvider(network, apiKey);
    }

    async getCurrentGasPrice() {
        try {
            const provider = await this.getProvider();
            const feeData = await provider.getFeeData();
            const gasPrice = ethers.formatUnits(feeData.gasPrice, "gwei");
            const maxFeePerGas = ethers.formatUnits(feeData.maxFeePerGas, "gwei");
            const maxPriorityFeePerGas = ethers.formatUnits(
                feeData.maxPriorityFeePerGas,
                "gwei",
            );

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