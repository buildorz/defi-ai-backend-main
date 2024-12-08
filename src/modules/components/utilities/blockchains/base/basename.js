const ethers = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError");
const { ENVIRONMENT } = require("../../../../../common/utils/environment");
const { EthUtils } = require("../ethereum/util.eth");
const {
  registrarABI,
  L2ResolverABI,
} = require("./constants/registrar_abi.json");

const BASENAME_L2_RESOLVER_ADDRESS =
  "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

class BaseName {
  async checkAvailableName(name) {
    try {
      const provider = await EthUtils.getProvider("BASE");
      const { REGISTRAR_ADDRESS } = ENVIRONMENT.BASE_REGISTRAR;
      const BaseNameContract = new ethers.Contract(
        REGISTRAR_ADDRESS,
        registrarABI,
        provider
      );

      const isNameAvailable = await BaseNameContract.available(name);
      return isNameAvailable;
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  convertYearToSeconds(years) {
    const secondsInYear = 31536000;
    return parseInt(years * secondsInYear);
  }

  async getBaseNamePrice(name, duration) {
    try {
      name = name.toLowerCase();
      if (!name || !duration) {
        throw new Error("Name and duration are required");
      }

      if (name.length < 3) {
        throw new Error("Name must be at least 3 characters long");
      }

      if (duration < 1) {
        throw new Error("Duration must be at least 1 year");
      }
      duration = parseFloat(duration);
      duration = this.convertYearToSeconds(duration);

      const provider = await EthUtils.getProvider("BASE");
      const { REGISTRAR_ADDRESS } = ENVIRONMENT.BASE_REGISTRAR;
      const BaseNameContract = new ethers.Contract(
        REGISTRAR_ADDRESS,
        registrarABI,
        provider
      );

      const namePrice = await BaseNameContract.registerPrice(name, duration);
      return namePrice;
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  convertChainIdToCoinType = (chainId) => {
    // L1 resolvers to addr
    if (chainId === 1) {
      // 1 is mainnet chain id
      return "addr";
    }
    const cointype = (0x80000000 | chainId) >>> 0;
    return cointype.toString(16).toUpperCase();
  };

  convertReverseNodeToBytes = (address, chainId) => {
    const addressFormatted = address.toLowerCase();
    const addressNode = ethers.solidityPackedKeccak256(
      ["string"],
      [addressFormatted.substring(2)]
    ); // NOTE: hash it as a string not address
    const chainCoinType = this.convertChainIdToCoinType(chainId);
    console.log("chainCoinType", chainCoinType);

    const baseReverseNode = ethers.namehash(
      `${chainCoinType.toLocaleUpperCase()}.reverse`
    );
    const addressReverseNode = ethers.solidityPackedKeccak256(
      ["bytes32", "bytes32"],
      [baseReverseNode, addressNode]
    );
    return addressReverseNode;
  };

  getBaseName = async (address) => {
    try {
      const addressReverseNode = this.convertReverseNodeToBytes(address, 8453); // 8453 is base chain id
      const baseProvider = await EthUtils.getProvider("BASE");

      const contract = new ethers.Contract(
        BASENAME_L2_RESOLVER_ADDRESS,
        L2ResolverABI,
        baseProvider
      );

      console.log("addressReverseNode", addressReverseNode);

      const basename = await contract.name(addressReverseNode);

      console.log("basename", basename);

      return basename;
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  };
}

module.exports = {
  BaseName: new BaseName(),
};
