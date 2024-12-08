const ethers = require("ethers");
const { ErrorHandler } = require("../../../../../common/utils/appError.js");
const { EthUtils } = require("./util.eth.js");

class EthWalletDetails {
  constructor() {
    this.abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function transfer(address recipient, uint256 amount) public returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
    ];
  }

  async generateNewEthWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();

      const address = wallet.address;
      // console.log("address:", wallet.address);
      const mnemonic = wallet.mnemonic.phrase;
      // console.log("mnemonic:", wallet.mnemonic.phrase);
      const pk = wallet.privateKey;
      // console.log("privateKey:", wallet.privateKey);

      return {
        address: address,
        mnemonic: mnemonic,
        pk: pk,
      };
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  async getUserEthWalletBalance(userAddress, format = true, blockchain) {
    try {
      const provider = await EthUtils.getProvider(blockchain);
      const balance = await provider.getBalance(userAddress);

      return format ? ethers.formatEther(balance) : balance;
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  async getUserEthTokenBalance(userAddress, contractAddress, blockchain) {
    try {
      const provider = await EthUtils.getProvider(blockchain);
      const erc20 = new ethers.Contract(contractAddress, this.abi, provider);
      const tokenBalance = await erc20.balanceOf(userAddress);
      const tokenSymbol = await erc20.symbol();
      const tokenName = await erc20.name();
      const tokenDecimal = await erc20.decimals();
      return { tokenBalance, tokenName, tokenSymbol, tokenDecimal, erc20 };
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  async getWalletFromPrivateKey(pk, blockchain ) {
    try {
      const provider = await EthUtils.getProvider(blockchain);

      const wallet = new ethers.Wallet(pk, provider);

      return wallet.address;
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }
}

module.exports = {
  EthWalletDetails: new EthWalletDetails(),
};
