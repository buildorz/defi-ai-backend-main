const { EthUtils } = require("./util.eth");

const gasEstimate = async (toAddress, data, value) => {
    try {
        console.log("Estimating Gas...");
        const provider = await EthUtils.getProvider();
        const tx = {
            to: toAddress,
            data: data,
            value: value,
        };
        const gasEstimate = await provider.estimateGas(tx);
        const gasPrice = (await provider.getFeeData()).gasPrice;
        const gasEstimateResponse = BigInt(gasEstimate) * BigInt(gasPrice);

        console.log("Gas: ", gasEstimateResponse, new Date(Date.now()));
        const status = 200;
        return {
            status, gasEstimateResponse
        };
    } catch (error) {
        console.error(error);
        const status = 404;
        const result = {
            response: `Error estimating Gas. Please try again later`,
        };
        const gasEstimateResponse = JSON.stringify(result)
        return { status, gasEstimateResponse };
    }
};

module.exports = { gasEstimate };