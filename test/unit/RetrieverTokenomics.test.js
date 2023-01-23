const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RetrieverTokenomics", function () {
          const maxSupply = ethers.utils.parseEther("1000000000")
          let deployer, user1, user2, user3
          let retriever,
              retrieverTokenomics,
              retrieverTokenomicsUser1,
              retrieverTokenomicsUser2,
              retrieverTokenomicsUser3
          let weth,
              usdt,
              matic,
              wethUsdPriceFeed,
              usdtUsdPriceFeed,
              maticUsdPriceFeed,
              wethUser2,
              maticUser3
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              user3 = accounts[3]
              await deployments.fixture(["all"])
              retriever = await ethers.getContract("Retriever")
              retrieverTokenomics = await ethers.getContract("RetrieverTokenomics")
              retrieverTokenomicsUser1 = retrieverTokenomics.connect(user1)
              retrieverTokenomicsUser2 = retrieverTokenomics.connect(user2)
              retrieverTokenomicsUser3 = retrieverTokenomics.connect(user3)
              weth = await ethers.getContract("WrappedEther")
              wethUser2 = weth.connect(user2)
              usdt = await ethers.getContract("Tether")
              matic = await ethers.getContract("Matic")
              maticUser3 = matic.connect(user3)
              wethUsdPriceFeed = await ethers.getContract("WethToUsdPriceFeed")
              usdtUsdPriceFeed = await ethers.getContract("UsdtToUsdPriceFeed")
              maticUsdPriceFeed = await ethers.getContract("MaticToUsdPriceFeed")
          })

          describe("whitelistForPrivateSale", function () {
              it("whitelist the investor for private sale", async () => {
                  await retrieverTokenomics.whitelistForPrivateSale(user1.address)
                  const isWhitelisted = await retrieverTokenomics.isWhitelistedForPrivateSale(
                      user1.address
                  )
                  assert.equal(isWhitelisted, true)
              })
          })
          describe("startPrivateSale", function () {
              it("starts the private sale", async () => {
                  // first the RTV tokens to be minted to RetrieverTokenomics contract by deployer
                  const rtvTokensToMint = await retrieverTokenomics.getTokensToSellInPrivateSale()
                  await retriever.mint(retrieverTokenomics.address, rtvTokensToMint)
                  const getRtvBalance = await retriever.balanceOf(retrieverTokenomics.address)
                  assert.equal(getRtvBalance.toString(), rtvTokensToMint.toString())
                  await retrieverTokenomics.startPrivateSale()
                  const isPrivateSaleRunning = await retrieverTokenomics.getPrivateSaleStatus()
                  assert.equal(isPrivateSaleRunning, true)
              })
          })
          describe("buyTokenPrivateSale", function () {
              it("buy RTV token by whitelisted investors", async () => {
                  // whitelist investors
                  await retrieverTokenomics.whitelistForPrivateSale(user2.address)
                  await retrieverTokenomics.whitelistForPrivateSale(user3.address)
                  // mint some weth to user2 to buy RTV tokens
                  const wethToMint = ethers.utils.parseEther("5")
                  await weth.mint(user2.address, wethToMint)
                  // mint some matic to user3 to buy RTV tokens
                  const maticToMint = ethers.utils.parseEther("5000")
                  await matic.mint(user3.address, maticToMint)
                  // mint RTV tokens to RetrieverTokenomics before start of private sale
                  const rtvTokensToMint = await retrieverTokenomics.getTokensToSellInPrivateSale()
                  await retriever.mint(retrieverTokenomics.address, rtvTokensToMint)
                  // start private sale
                  await retrieverTokenomics.startPrivateSale()
                  // get RTV tokens balance for RetrieverTokenomics before buy
                  const balanceRtvBefore = await retriever.balanceOf(retrieverTokenomics.address)
                  // approve RetrieverTokenomics the allowance for WETH and MATIC by user2 and user3
                  await wethUser2.approve(retrieverTokenomics.address, wethToMint)
                  await maticUser3.approve(retrieverTokenomics.address, maticToMint)
                  // buy RTV tokens using WETH by user2
                  await retrieverTokenomicsUser2.buyTokenPrivateSale("WETH", wethToMint)
                  // buy RTV tokens using MATIC by user3
                  await retrieverTokenomicsUser3.buyTokenPrivateSale("MATIC", maticToMint)
                  // get RTV tokens balance for RetrieverTokenomics after buy
                  const balanceRtvAfter = await retriever.balanceOf(retrieverTokenomics.address)
                  // get RTV tokens balance for user1 and user2
                  const balanceRtvUser2 = await retriever.balanceOf(user2.address)
                  const balanceRtvUser3 = await retriever.balanceOf(user3.address)
                  assert.equal(
                      balanceRtvBefore.sub(balanceRtvAfter).toString(),
                      balanceRtvUser2.add(balanceRtvUser3).toString()
                  )
              })
          })
      })
