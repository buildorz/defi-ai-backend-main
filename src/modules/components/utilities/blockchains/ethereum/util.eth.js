const ethers = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");

class EthUtils {
    async getProvider(chain = 'ethereum') {
        if (['eth', 'ethereum'].includes(chain.toLowerCase())) {
            chain = 'eth'
        }

        let rpcUrl = ENVIRONMENT.RPC_URLS[chain.toUpperCase()];
        if (!rpcUrl) {
            throw new Error(`RPC URL for chain ${chain} not found`);
        }

        return new ethers.JsonRpcProvider(rpcUrl);
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