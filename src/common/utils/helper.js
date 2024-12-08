require("dotenv").config();
const { ethers } = require("ethers");

class BaseHelper {
  isValidEthereumPublicKey(publicKey) {
    try {
      const address = ethers.getAddress(publicKey);

      return address === publicKey;
    } catch (error) {
      console.error(
        "Invalid Ethereum public key: Decoding error.",
        error.message,
      );
      return false;
    }
  }

  trimNumberToString(number, maxDecimals = 9) {
    // Convert to string using fixed-point notation to ensure all necessary decimals are present
    const fixedString =
      typeof number === "string"
        ? parseFloat(number).toFixed(maxDecimals + 1)
        : number.toFixed(maxDecimals + 1);

    // Use a regular expression to trim to the desired number of decimal places without rounding
    const trimmedString = fixedString.replace(
      new RegExp(`(\\d*\\.\\d{${maxDecimals}})\\d*`),
      "$1",
    );

    // Remove any trailing zeros after the decimal point to clean up the format
    return trimmedString.replace(/\.0+$|(\.\d+?)0+$/, "$1");
  }

  convertToBaseDecimal(amount, decimal) {
    return ethers.parseUnits(amount.toString(), Number(decimal));
  }

  convertFromBaseDecimal(amount, decimal) {
    console.log("amount", amount, "decimal", decimal);
    return ethers.formatUnits(amount.toString(), Number(decimal));
  }

  convertFromBigInt(amount, decimal) {
    console.log("amount", amount, "decimal", decimal);
    return Number(amount) / Math.pow(10, decimal);
  }

  convertToBigInt(amount, decimal) {
    console.log("amount", amount, "decimal", decimal);
    return BigInt(Math.floor(amount * Math.pow(10, decimal)));
  }

  generateRandomNumbers = (length) => {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    );
  };

  sleep = (ms) => {
    return new Promise((res) => {
      console.log(`Sleeping for ${ms} milliseconds`);
      setTimeout(res, ms);
    });
  };
}

module.exports = { BaseHelper: new BaseHelper() };
