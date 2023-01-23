const { network } = require("hardhat")

const PRICE_FEEDS_DECIMALS = "8"
const INITIAL_PRICE_WETH_TO_USD = "120000000000" // 1200 USD
const INITIAL_PRICE_USDT_TO_USD = "100000000" // 1 USD
const INITIAL_PRICE_MATIC_TO_USD = "80000000" // 0.80
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        // deploy WrappedEther
        await deploy("WrappedEther", {
            from: deployer,
            log: true,
            args: [],
        })
        // deploy Tether
        await deploy("Tether", {
            from: deployer,
            log: true,
            args: [],
        })
        // deploy MockMatic
        await deploy("Matic", {
            from: deployer,
            log: true,
            args: [],
        })
        // deploy MockV3Aggregator for WETH/USD price feed
        await deploy("WethToUsdPriceFeed", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [PRICE_FEEDS_DECIMALS, INITIAL_PRICE_WETH_TO_USD],
        })
        // deploy MockV3Aggregator for USDT/USD price feed
        await deploy("UsdtToUsdPriceFeed", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [PRICE_FEEDS_DECIMALS, INITIAL_PRICE_USDT_TO_USD],
        })
        // deploy MockV3Aggregator for MATIC/USD price feed
        await deploy("MaticToUsdPriceFeed", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [PRICE_FEEDS_DECIMALS, INITIAL_PRICE_MATIC_TO_USD],
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
