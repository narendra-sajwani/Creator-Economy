const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const maxSupply = ethers.utils.parseEther("1000000000")
    let wethTokenAddress, usdtTokenAddress, maticTokenAddress
    let wethUsdPriceFeedAddress, usdtUsdPriceFeedAddress, maticUsdPriceFeedAddress

    if (chainId == 31337) {
        const wethUsdPriceFeed = await deployments.get("WethToUsdPriceFeed")
        wethUsdPriceFeedAddress = wethUsdPriceFeed.address
        const usdtUsdPriceFeed = await deployments.get("UsdtToUsdPriceFeed")
        usdtUsdPriceFeedAddress = usdtUsdPriceFeed.address
        const maticUsdPriceFeed = await deployments.get("MaticToUsdPriceFeed")
        maticUsdPriceFeedAddress = maticUsdPriceFeed.address
        wethTokenAddress = (await deployments.get("WrappedEther")).address
        usdtTokenAddress = (await deployments.get("Tether")).address
        maticTokenAddress = (await deployments.get("Matic")).address
    } else {
        // make sure all the parameters are available in networkConfig
        wethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
        usdtUsdPriceFeedAddress = networkConfig[chainId]["usdtUsdPriceFeedAddress"]
        maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeedAddress"]
        wethTokenAddress = networkConfig[chainId]["wethTokenAddress"]
        usdtTokenAddress = networkConfig[chainId]["usdtTokenAddress"]
        maticTokenAddress = networkConfig[chainId]["maticTokenAddress"]
    }
    const rtvTokenAddress = (await deployments.get("Retriever")).address

    log("----------------------------------------------------")
    log("Deploying RetrieverTokenomics...")
    const arguments = [
        maxSupply,
        wethUsdPriceFeedAddress,
        usdtUsdPriceFeedAddress,
        maticUsdPriceFeedAddress,
        wethTokenAddress,
        usdtTokenAddress,
        maticTokenAddress,
        rtvTokenAddress,
    ]
    const retrieverTokenomics = await deploy("RetrieverTokenomics", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(retrieverTokenomics.address, arguments)
    }
}

module.exports.tags = ["all", "retrieverTokenomics"]
