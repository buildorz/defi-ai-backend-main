const functions = [
  {
    type: "function",
    function: {
      name: "get_wallet_balance",
      description: `Fetches the balance of Eth (Ethereum) or Sol (Solana) in a users wallet
        - This function is used when a user requests for their wallet balance.`,
      parameters: {
        type: "object",
        properties: {},
      },
      sample: `Sample: "What's my wallet balance?"`,
    },
  },
  {
    type: "function",
    function: {
      name: "get_token_balance",
      description:
        "Fetches the balance of a cryptocurrency token in the user's wallet. This function requires the token name or contract address to be specified. For example: 'What is my current balance of DAI token?' or 'What is my current balance of USDT token?' In these examples, the function checks the user's balance of DAI or balance of USDT.",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description:
              "The name or contract address of the cryptocurrency token.",
          },
        },
        required: ["token"],
      },
      sample: `Sample: "What is my current balance of DAI token?"`,
    },
  },
  {
    type: "function",
    function: {
      name: "all_token_details",
      description: `This retrieves all details of a specific ERC20 token on the blockchain.
        - This function requires a token name or contract address to be specified.
        - Details that can be retrieved include 'USD price', 'ETH price', 'token name', 'token contract address', 'USD price in the last 5 minutes', etc.
        - For example: 'What was the USD price of DAI in the last 24 hours', in the example, this function retrieves all details of DAI and checks for the 'UsdPrice24hours'.`,
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description:
              "An ERC20 cryptocurrency token name or the token contract address",
          },
        },
        required: ["token"],
      },
      sample: `Sample: "What was the USD price of DAI in the last 24 hours?"`,
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_token_portfolio",
      description: `Retrieves all the cryptocurrency tokens in the users wallet.
        - This function requires a token name or contract address to be specified.
        - For example: 'What is my current portfolio', in the example, this function gets all the tokens owned by the user and their respective balances.`,
      parameters: {
        type: "object",
        properties: {
          nftConfirmation: {
            type: "boolean",
            description: `Confirms whether to also include the retrieval of non-fungible tokens (NFT) from the users wallet
                        - This value should always be 'false' by default if not otherwise stated
                      - If user does not provide this information then the result should be false`,
          },
        },
        required: ["nftConfirmation"],
      },
      sample: `Sample: "What is my current portfolio?"`,
    },
  },
  {
    type: "function",
    function: {
      name: "get_transaction_fee",
      description: `This function retrieves the current transaction fee (or gas price) information.
    - By calling this function, users can stay up-to-date with the latest transaction fee trends and network conditions across blockchains.
    - For Ethereum, it provides real-time information on the recommended gas price in Gwei, which is a key factor in determining transaction fees and network congestion.
    - For Solana, it offers details on the current cost of transaction fees measured in lamports per signature, reflecting the network's demand and resource utilization.`,
      parameters: {
        type: "object",
        properties: {},
      },
      sample: `Sample: "What is the current transaction fee?"`,
    },
  },
  {
    type: "function",
    function: {
      name: "transfer_tokens",
      description: `The transfer_tokens function allows users to transfer a token from their wallet address to another user's wallet address,
        - It requires the following parameters: 'token', 'toAddress', and 'amount',
        - If any of the required parameters is missing, ask for clarification from the user.
        - The user needs to confirm the transfer parameters before the transfer is completed.
        - Keywords: 'transfer', 'send'
        - Do not make any assumptions, Always ask for clarification if a user request is ambiguous.`,
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: `This parameter represents the token you want to transfer to another user.
                    - This can either be the token name or token contract address. 
                    - For example, if you want to send 500 DAI to another user's wallet address, 'DAI' would be the 'token'.
                    - Always ask for clarification if a user request is ambiguous`,
          },
          toAddress: {
            type: "string",
            description: `This parameter represents the recipient of the transfer. This is the user address you would like to send the amount of token to.
                    - This parameter can either be the wallet address or the Ethereum Naming Service (ENS) address.
                    - For instance, if you're sending 500 DAI to vitalik.eth, 'vitalik.eth' is the 'toAddress'.
                    - Always ask for clarification if a user request is ambiguous`,
          },
          amount: {
            type: "integer",
            description: `The amount parameter specifies the quantity or amount of the token that you want to transfer to another user's wallet address. 
                    - For example, if you want to send 500 DAI to jnrlouis.eth, 'amount' would be 500, indicating the amount of DAI you want to transfer. 
                    - Do not make any assumptions on the amount, the user has to explicitly state it.
                    - If no amount was stated, ask the user for clarification.`,
          },
        },
        required: ["token", "toAddress", "amount"],
      },
      sample: `Sample: "Transfer 500 DAI to jnrlouis.eth"`,
    },
  },
  {
    type: "function",
    function: {
      name: "swap_tokens",
      description: `The swap_tokens function allows you to perform a token swap by converting an 'amountToSwap' of 'tokenIn' into 'tokenOut' on the blockchain, 
        - It enables the swapping of tokens by executing a trade operation between tokenIn and tokenOut based on the specified amountToSwap.
        - If an amount is specified in dollars, the amountToSwap can be gotten by calling the "all_token_details" function to get the usd price of the token and converting to the equivalent amount.
        - It requires the following parameters: 'tokenIn', 'tokenOut', 'amountToSwap' and 'confirmation',
        - If any of the required parameters is missing, ask for clarification from the user.
        - The user needs to confirm the swap parameters before the swap is completed.
        - Keywords: 'swap', 'exchange', 'buy', 'sell'
        - Do not make any assumptions, Always ask for clarification if a user request is ambiguous.`,
      parameters: {
        type: "object",
        properties: {
          tokenIn: {
            type: "string",
            description: `This parameter represents the token you want to swap. 
                    - For example, if you want to convert 500 DAI into another token, 'DAI' would be the 'tokenIn'.
                    - It is the output token for the swap operation.
                    - Always ask for clarification if a user request is ambiguous`,
          },
          tokenOut: {
            type: "string",
            description: `This parameter represents the token you want to receive after the swap.
                    - For instance, if you're swapping 500 DAI for 'WETH' (Wrapped Ether), 'WETH' would be the 'tokenOut'.
                    - It is the input token for the swap operation.
                    - Always ask for clarification if a user request is ambiguous`,
          },
          amountToSwap: {
            type: "number",
            description: `The amountToSwap parameter specifies the quantity or amount of the tokenIn token that you want to swap or exchange for the tokenOut token. 
                    - For example, if you want to swap 500 DAI to WETH, amountToSwap would be 500, indicating the amount of DAI you want to swap for WETH. 
                    - If an amount is specified in dollars, the amountToSwap can be gotten by calling the "all_token_details" function with the "tokenIn" to get the usd price of the token and converting to the equivalent amount.
                    - For example, if the command is 'swap $10 worth of DAI to WETH', call 'all_token_details(tokenIn)' to get the USD price of DAI
                    - Assuming the USD price of DAI is $2, then the amountToSwap would be gotten by calculating $10 divided by $2 which would give 5, in this case, the amountToSwap would be 5
                    - IT IS IMPORTANT THAT YOU ONLY DO THIS IF THE DOLLAR ($) AMOUNT IS GIVEN.
                    - Do not make any assumptions on the amount, the user has to explicitly state it.
                    - If no amount was stated, ask the user for clarification.`,
          },
          slippage: {
            type: "integer",
            description: `The slippage parameter specifies the maximum allowable difference between the expected and actual outcome of a trade. 
          - For example, the user could say 'swap 500 DAI to WETH with a 10% slippage', the slippage in this case is 10.
                    - This value is optional and should always be 1 by default if not otherwise stated.`,
          },
        },
        required: ["tokenIn", "tokenOut", "amountToSwap", "slippage"],
      },
      sample: `Sample: "Swap 500 DAI to WETH with a 10% slippage"`,
    },
  },
];

module.exports = { functions };
