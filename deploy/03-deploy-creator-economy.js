const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const rtvTokenAddress = (await deployments.get("Retriever")).address

    log("----------------------------------------------------")
    log("Deploying CreatorEconomy...")
    const arguments = [rtvTokenAddress]
    const creatorEconomy = await deploy("CreatorEconomy", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(creatorEconomy.address, arguments)
    }
}

module.exports.tags = ["all", "creatorEconomy"]
