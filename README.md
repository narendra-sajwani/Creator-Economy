## Problem Statement
The problem statement is inspired by following medium article:
* [Creator Coin 101](https://medium.com/rallycreators/creator-coin-101-a-brief-explainer-on-rallys-first-building-block-39d33ead5cf7)

## Solution containing following sol files:
 1. Retriever - RTV ERC20 token contract
 2. RetrieverTokenomics - Dealing with the private sale
 3. PriceConverter - Library for conversion of various tokens to equivalent USD using chainlink price feeds.
 4. CreatorToken - To create ERC20 token for each of the individual creator
 5. CreatorEconomy - To facilitate all economic interactions among creators and their communities/ users

To run the tests, clone the repo and install dependencies by running yarn and then run yarn hardhat test.
