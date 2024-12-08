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

    this.abi2 = [
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedValue", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      { stateMutability: "payable", type: "receive" },
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
      const erc20v2 = new ethers.Contract(contractAddress, this.abi2, provider);
      let tokenBalance, tokenName, tokenSymbol, tokenDecimal;
      try {
        tokenBalance = await erc20.balanceOf(userAddress);
      } catch (error) {
        tokenBalance = await erc20v2.balanceOf(userAddress);
      }
      try {
        tokenSymbol = await erc20.symbol();
      } catch (error) {
        tokenSymbol = await erc20v2.symbol();
      }
      try {
        tokenName = await erc20.name();
      } catch (error) {
        tokenName = await erc20v2.name();
      }
      try {
        tokenDecimal = await erc20.decimals();
      } catch (error) {
        tokenDecimal = await erc20v2.decimals();
      }
      return { tokenBalance, tokenName, tokenSymbol, tokenDecimal, erc20 };
    } catch (error) {
      ErrorHandler.asyncErrors(error);
    }
  }

  async getWalletFromPrivateKey(pk, blockchain) {
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
