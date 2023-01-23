const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const maxSupply = ethers.utils.parseEther("1000000000")

    log("----------------------------------------------------")
    log("Deploying Retriever...")
    const arguments = [maxSupply]
    const retriever = await deploy("Retriever", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(retriever.address, arguments)
    }
}

module.exports.tags = ["all", "retriever"]
