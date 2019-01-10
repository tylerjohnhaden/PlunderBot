---
authors:
- Tyler John Haden
tags:
- ethereum
- blockchain
- ether
date: 
title: Building your First Truffle Project
image: 
---

An introduction on how to get started with a Truffle-based Solidity project. This blog series will not only explain how to get started with [Truffle](https://truffleframework.com/docs/truffle/overview) as an Ethereum smart contract framework, but will also describe boilerplate code that will make your life a ton easier (think linting, test coverage, development blockchain, scripted testing, and deployment management).

# Assumptions
This tutorial will assume that you have experience with basic bash, node, and npm. It will not assume that you know anything about blockchains or Ethereum.

# Dependencies
- node, npm

I'll be installing all our the necessary node modules into the local project. You can also install these globally, and it shouldn't make a difference. The reason why you may want to keep it local, is because these tools and languages change very fast compared to most other development environments. For example, the Solidity compiler makes backwards compatibility breaking changes very often.

# Initialization
1. Create a new directory to contain your truffle project.

        mkdir MyFirstTruffleProject && cd MyFirstTruffleProject

2. Initialize your project with package.json file. You can use other versions of node, but we recommend you use the latest. This blog is written with the versions specified below.
        
        {
          "name": "my-first-truffle-project",
          "version": "0.0.1",
          "engines": {
            "node": "11.6.x",
            "npm": "6.5.x"
          }
        }

3. Install the [Truffle module](https://www.npmjs.com/package/truffle)
        
        npm install truffle --save-dev

   - If you want to double check all of our dependencies, run `node_modules/.bin/truffle version` ![todo add pic]()
   
4. Time to run Truffle's project init script

        node_modules/.bin/truffle init

Technically you now have a truffle project! It is pretty bare, but lets try to understand what that script did for us.

## Truffle's generated files

When you run `ls -la` you should see:

![truffle init directory](resources/truffle_init_directory.png)

Truffle init was responsible for creating three directories (`contracts`, `migrations`, and `test`) along with three files (`Migrations.sol`, `1_initial_migrations.js`, and `truffle-config.js`). Here are their descriptions, but examples on how to add to them, and organize your project will continue below.

- `contracts` will store all your Solidity (.sol files). This is where you will add any smart contracts, libraries, or interfaces that you need at compile time. 
  - `Migrations.sol` is a complete, fully working smart contract written in Solidity. It is used by truffle to ensure that your project's deployment to the blockchain is carried out in the proper sequence. 
  
        pragma solidity >=0.4.21 <0.6.0;
        
        contract Migrations {
        
            address public owner;
            uint public lastCompletedMigration;
            
            constructor() public {
                owner = msg.sender;
            }
                                                                                   modifier restricted() {
                if (msg.sender == owner) _;
            }
                                                                                    function setCompleted(uint completed) public restricted {
                lastCompletedMigration = completed;
            }
                                                                                   function upgrade(address newAddress) public restricted {
                Migrations upgraded = Migrations(newAddress);
                upgraded.setCompleted(lastCompletedMigration);
            }
         }
- `migrations` will store truffle "deployer" Javascript files. Every time you want to deploy a contract, you'll need to tell truffle which one, and what constructor arguments you may need.
  - `1_initial_migration.js` is the script that deploys our Migration contract. It is the most basic type of deployment because it requires no library linking, or constructor arguments.
  
        var Migrations = artifacts.require("./Migrations.sol");
        
        module.exports = function(deployer) {
          deployer.deploy(Migrations);
        };
- `test` is pretty self explanatory. It can contain js or sol files, depending on your choice of testing language. It starts off empty, but we will add a test later on.
- `truffle-config.js` is the main configuration for your Truffle project. This is where we define what networks to use, gas usages, addresses to deploy with, and a few other variables.
        
        module.exports = {
            networks: {}
        }

## Compiling your contracts

Let us see if we can compile the single contract that was generated for us. It's very easy to run truffle commands for now, but we will eventually build up the script library in our package.json.

        node_modules/.bin/truffle compile

![todo add pic]()

Truffle will create `build/contracts/Migrations.json`. This json file contains a lot of information about the compiled contract. It includes the whole compiled bytecode, along with function signatures, events, docs, and compiler information. 
        
        {
            "contractName": "Migrations",
            "abi": [
                ...
            ],
            "bytecode": "0x...",
            "deployedBytecode": "0x...",
            "source": "pragma ...",
            "ast": {
                ...
            },
            ...
            "schemaVersion": "3.0.1",
            "updatedAt": "2019-01-10T15:34:39.612Z",
            "compiler": {
                ...
            }
            ...
        }
The two most important parts are the "abi" and bytecode/deployedBytecode. 
- Ethereum has specified a common way of interacting with contracts using the [Application Binary Interface](https://solidity.readthedocs.io/en/develop/abi-spec.html) (ABI). It is what tells clients how to create transactions that will run on the contract, and what events you should expect. There's more in-depth information in the documentation, and I highly recommend reading it if you plan on developing smart contracts with Solidity.
- The bytecode is what gets run on the [Ethereum Virtual Machine](https://solidity.readthedocs.io/en/v0.5.2/introduction-to-smart-contracts.html#index-6) (EVM). In order for you to "deploy" a contract onto the Ethereum blockchain, you must submit the deployedBytecode as a transaction. Technically, the bytecode is what is stored as the contract, and when you call a function, it can only interact with that bytecode in the EVM.

Remember when I said Solidity makes many breaking changes? It is standard to use the specific commit hash as the compiler version, i.e.

      "compiler": {
          "name": "solc",
          "version": "0.5.0+commit.1d4f565a.Emscripten.clang"
      }

Truffle compile will search through your `contracts` directory, and compile any contracts, or libraries. If you have any import statements in those .sol files, truffle will attempt to find them. 

There is also one config variable in `truffle-config.js` that will affect compilation. These are the solc defaults, but you can go ahead and add these to your config file.

        module.exports = {
            networks: {},
            solc: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
The number of runs will affect the tradeoff between contract creation gas and subsequent function call gas. If you don't mind a large upfront cost, you should have more runs of the compiler. Here is the quote from the [Soldity docs](https://solidity.readthedocs.io/en/develop/using-the-compiler.html#using-the-compiler):
        
>"By default, the optimizer will optimize the contract assuming it is called 200 times across its lifetime. If you want the initial contract deployment to be cheaper and the later function executions to be more expensive, set it to --runs=1. If you expect many transactions and do not care for higher deployment cost and output size, set --runs to a high number."

# Starting your very own blockchain

To understand how to run your smart contracts, you must first understand what a blockchain is. Unfortunately, this is not the blog to have "the talk" with you. We will only discuss the bare minimum needed to develop and deploy your first contract.

Definitions:
- blockchain: a data structure that looks like a linked list
- Ethereum: a set of protocols that are responsible for turning "transactions" into "blocks", an implementation of a blockchain
- transaction: a list of bytes (an integer for the purists) that may contain bytecode, data, or anything technically (improperly formatted transactions just get reverted)
- block: one of the linked nodes in the above stated "blockchain"
- gas: some cash that is used to inventivize strangers to add your "transaction" to a "block"
- ether: a mapping from "address" to a uint256 ("I have 0 ether" == "My address maps to 0 in this public hashmap we call ether")
- address: a number that is 20 bytes long
- private key: a number that is 32 bytes long, every "private key" has exactly one "address" associated with it
- mnemonic: a list of 12 words that serve to generate your (private key, address) pair

As a smart contract *developer*, you don't really need to care about the exchange rate between [fiat](https://en.wikipedia.org/wiki/Fiat_money) and ether, or stock fluctuations. In fact, you can create your very own blockchain, where everything is free. The introduction of buying power is just necessary to ensure that the blockchain will live on, distributed across the world, with no grand organizer or power differential.

## Using Ganache to create a local blockchain

Anyone who knows the protocols that Ethereum layed out, can run the EVM, or connect to the main network. For now, we would like to run a local client that will act as our little EVM. The Truffle Suite has an easy to use client called [Ganache](https://truffleframework.com/ganache). It comes in two flavors, console and cli. We will be using the cli for this project, because we will be running it programmatically and during automated testing.

1. First, lets install it into our project

        npm install ganache-cli --save-dev

2. To make our lives easier, lets add a script to our project to run our ganache. Add the following to package.json:

        "scripts": {
            "ganache": "ganache-cli --networkId $npm_package_config_ganache_networkId --allowUnlimitedContractSize --gasLimit $npm_package_config_ganache_gasLimit --gasPrice $npm_package_config_ganache_gasPrice --mnemonic \"$MNEMONIC\""
        },
        "config": {
            "ganache": {
                "networkId": 3431,
                "gasPrice": 25000000000,
                "gasLimit": 6500000
            }
        }
    This creates the [ganache-cli](https://github.com/trufflesuite/ganache-cli) command with a few config variables. `networkId` is arbitrary, as long as you aren't using one of the public ids such as 1, 3, 4, 42, etc. You can update `gasPrice` or `gasLimit`, but for now lets leave these defaults.

3. Ganache will also take an optional mnemonic. This mnemonic serves to generate the private keys to be given starting balances of ether. Every Ethereum blockchain must start with some starting amount, otherwise there is nothing to trade. Without a mnemonic, Ganache will randomly generate these private keys, but let's create one just so it is consistent between runs.

        export MNEMONIC="genuine habit total coast ordinary violin empty mention muffin dream degree bunker"
    **Warning: This mnemonic should be secret!** You should treat this like a password. This is why I will always be using environment variables to inject into our scripts.
    
    You can randomly generate by running ganach-cli without one. For example `node_modules/.bin/ganache-cli | grep Mnemonic` will output the single line with it. Then you can just kill the process with ctrl-C.

4. Run Ganache and see what is generated

        npm run ganache

    ![todo add pic]()
    Ganache will generate accounts based on what parameters you run it with. The default is 10 with starting balances of 100 Ether. The cli will display the addresses, private keys, mnemonic, gas price, and gas limit. These address can technically be used on any Ethereum blockchain, not just you local one (but they probably have 0 real Ether).
    
    This Ganache client will sit around, waiting for someone to send it a transaction on port 8545 by default. When it receives that transaction, it will attempt to run it on the EVM (see if the bytecode is correct) and it will then immediately create a single block with that transaction. On the main Ethereum blockchain, several transactions will be added to any given block, but we can be less efficient on our local version. All clients like this one should have a specific set of api calls that can read or write to the blockchain. This is why all transactions are public to everyone in the network.

## Deploy to your local blockchain

Now that we have a blockchain client to store our transactions, lets deploy our contract from before to it. In Truffle lingo, we say that were going to migrate our project to our development network. Well need to add some more configurations and then it will be as simple as running a command.

1. Add configuration for our development network to `truffle-config.js`:
        
        // environment variables set in the package config
        var networkId = process.env.npm_package_config_ganache_networkId;
        var gasPrice = process.env.npm_package_config_ganache_gasPrice;
        var gasLimit = process.env.npm_package_config_ganache_gasLimit;
        
        module.exports = {
            networks: {
                development: {
                    host: '127.0.0.1',  // ganache defaults
                    port: 8545,         // ganache defaults
                    network_id: networkId,
                    gas: gasLimit,
                    gasPrice: gasPrice
                }
            }
        }
    As you can see, we use the same configs that we used to run ganache. If we use arbitrary numbers, it won't necessarily fail, but these ensure all the numbers we see for gas usage are comparable.
    
2. Let's add some more scripts to `package.json`:

        "start": "concurrently \"npm run ganache\" \"npm run migrate\"",
        "migrate": "rm -rf build && truffle migrate --reset --compile-all --network development"

3. We need to install [concurrently](https://www.npmjs.com/package/concurrently) so we can coordinate ganache and truffle together.

        npm install concurrently --save-dev

4. Run the migrate script

        npm run start
    
    When we run this, truffle will first compile, and then run its migration steps using the development network.
    
    ![todo add pic]()
    Ganache's output will contain a lot of good information about what was going on. You get back a list of all the API calls made to it, such as "eth_getBlockByNumber" or "eth_sendTransaction". When you send a transaction, it'll display things like the transaction hash, gas usage, block number, and contract address (if the transaction created a contract).
    
As you can see, the client is still running. You can now send transactions to localhost:8545 from Javascript libraries ([Web3js](https://web3js.readthedocs.io/en/1.0/)) or even curl although the syntax starts to become cumbersome.

If you deployed a contract, you could now send transactions that run specific functions on those contracts. You have to specify which address to send these to. In order to find out which address your contract was deployed on, you can either follow the Ganache logs, or look it up in `build/contracts/Migrations.sol`:

          "networks": {
              "3431": {
                  "events": {},
                  "links": {},
                  "address": "0x2fAeC1D9fC41FC63976187cf912264a632BDc05D",
                  "transactionHash": "0x4915f3413fc1b6b9e973d983de35f68d6874572b5d3093ea8ccae3eb618464f2"
              }
          },
   Here, you can see the network is specified by a number, our local one we chose as 3431 (arbitrarily chosen). `transactionHash` is a unique identifier of that transaction. Anyone can look up that specific transaction based on it, and will be able to see all the events emitted, or other internal transactions that occurred during it. Even if it reverts because of some runtime error, it'll still be present and forever recorded that you made a mistake!
   
   So now we need to specify the address `0x2fAeC1D9fC41FC63976187cf912264a632BDc05D` if we want to talk to Migrations.

# Using Infura to connect to public networks

