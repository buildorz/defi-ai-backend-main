const axios = require('axios');
const { ENVIRONMENT } = require("../../common/utils/environment");
const dextoolsAPI = ENVIRONMENT.DEXTOOLS.API_KEY;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const getTokenAudit = async (tokenContractAddress, chain = "ether") => {
    try {
        console.log(`Getting Token Audit of ${tokenContractAddress}...`);
        const getTokenAuditDetails = await axios.get(
            `https://public-api.dextools.io/standard/v2/token/${chain}/${tokenContractAddress}/audit`,
            {
                headers: {
                    'X-API-KEY': dextoolsAPI
                }
            }
        );
        await sleep(1000);

        const resultGetAuditDetails = {
            slippageModifiable: getTokenAuditDetails.data.data?.slippageModifiable
                ? getTokenAuditDetails.data.data.slippageModifiable
                : 'no',
            isBlacklisted: getTokenAuditDetails.data.data?.isBlacklisted
                ? getTokenAuditDetails.data.data.isBlacklisted
                : 'no',
            sellTax: {
                min: getTokenAuditDetails.data.data?.sellTax?.min
                    ? getTokenAuditDetails.data.data.sellTax.min
                    : 0,
                max: getTokenAuditDetails.data.data?.sellTax?.max
                    ? getTokenAuditDetails.data.data.sellTax.max
                    : 0,
                status: getTokenAuditDetails.data.data?.sellTax?.status
                    ? getTokenAuditDetails.data.data.sellTax.status
                    : 'ok'
            },
            buyTax: {
                min: getTokenAuditDetails.data.data?.buyTax?.min
                    ? getTokenAuditDetails.data.data.buyTax.min
                    : 0,
                max: getTokenAuditDetails.data.data?.buyTax?.max
                    ? getTokenAuditDetails.data.data.buyTax.max
                    : 0,
                status: getTokenAuditDetails.data.data?.buyTax?.status
                    ? getTokenAuditDetails.data.data.buyTax.status
                    : 'ok'
            },
            isPotentiallyScam: getTokenAuditDetails.data.data?.isPotentiallyScam
                ? getTokenAuditDetails.data.data.isPotentiallyScam
                : 'unknown'
        };

        const statusGetAuditDetails = 200;
        return { statusGetAuditDetails, resultGetAuditDetails };
    } catch (error) {
        console.log(error);
        const statusGetAuditDetails = 404;
        const resultGetAuditDetails = {
            response: `Getting Token Audit Details failed: ${error?.response?.data?.errorMessage ? error?.response?.data?.errorMessage : error.message}`
        };
        console.log('Getting Token Details Failed! ', resultGetAuditDetails);
        return { statusGetAuditDetails, resultGetAuditDetails };
    }
};

module.exports = { getTokenAudit };
