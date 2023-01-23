const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Retriever", function () {
          const maxSupply = ethers.utils.parseEther("1000000000")
          let retriever
          let deployer
          beforeEach(async () => {
              // const accounts = await ethers.getSigners()
              // deployer = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              retriever = await ethers.getContract("Retriever", deployer)
          })

          describe("constructor", function () {
              it("sets the token name, symbol and maxSupply correctly", async () => {
                  const name = await retriever.name()
                  const symbol = await retriever.symbol()
                  const maxSupplyRtv = await retriever.getMaxSupply()
                  assert.equal(name, "RETRIEVER")
                  assert.equal(symbol, "RTV")
                  assert.equal(maxSupplyRtv.toString(), maxSupply)
              })
          })
      })
