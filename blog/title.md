---
authors:
- Tyler John Haden
tags:
- ethereum
- Serverless
- blockchain
- cryptocurrencies
- ether
date: 
title: Intro to some 
image: 
---

[Source Code](https://github.com/tylerjohnhaden/PlunderBot)

Development of Ethereum smart contract applications can be tricky for many reasons. Certainly, the concept of a cryptographic ledger is relatively recent, and any tools or frameworks are still new and usually going through beta. However, one that is inherent in any Ethereum application and different than any previous development environments, is how every transaction requires up front cash.

# Introduction to some crypto concepts

The question of what money is, or why does a blockchain generate value is too big of a discussion for this blog. The important point that smart contract developers have to work around is that they need money to run each and every opcode. Every time you want your contract to add two numbers, or return a value, or even output logs, you have to supply it money in the form of ether. 

Ether is the "raw" natural resource that is used to incentivize transactions. You can exchange it for fiat currency (Dollars or Swedish Krona) in a market place. It is not the only currency on Ethereum, but tokens is another topic too long for this blog. You need to "pay the blockchain" to "store" your transactions, and this is where the issue with development comes. When I want to deploy my smart contract on a public test network (i.e. Ropsten, Kovan, or Rinkeby) I need test ether.

For example, this project's smart contract cost about .1056 KEth to deploy, which was about $10 if it was on the main net.

## How do I get this test ether?

You cannot buy test ether (well you probably shouldn't) because it is not supposed to be used as currency. For this blog, I will be using the Kovan test network, because my last project used the [Dai]() token which was only testable on Kovan. You can think of these test networks like separate blockchains like bitcoin that just happen to have the same protocols as Ethereum's main net. That way, you can do a public test run without using real money.

In order to get test ether, you have to go to various *faucets* for the network you are testing on. These faucets restrict how much they give out to ensure that inflation is as small as possible. Imagine going up to a magical fountain that poured out gold coins. If anyone could get access, gold would very quickly lose all monetary value. 

The maintainers of the Kovan test net list two faucets for KEth (Kovan Eth). 
- https://faucet.kovan.network which requires Github authentication and will send you 1 KEth every 24 hours
- https://gitter.im/kovan-testnet/faucet which requires a Gitter login and will send you 3 KEth every 6 days

You just have to supply them with your Ethereum address, and they will send you the KEth. But the mere effort is such a hassle. Suppose you want to exchange large amounts of ether in your application, or you want to test with many accounts. You could beg the maintainers, but who has the time?

# Meet Plunder Bot

My solution to this problem, was to create a bot that "tapped" these faucets every so often, and [escrows]() it away. 