const { ethers } = require("hardhat")

const networkConfig = {
    // hardhat localhost network
    31337: {
        name: "localhost",
    },
    // goerli testnet
    5: {
        name: "goerli",
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        usdtUsdPriceFeedAddress: "", // not available, test on localhost
        maticUsdPriceFeedAddress: "", // not available, test on localhost
        wethTokenAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        usdtTokenAddress: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
        maticTokenAddress: "0xA108830A23A9a054FfF4470a8e6292da0886A4D4",
    },
    // mumbai testnet
    80001: {
        name: "mumbai",
        ethUsdPriceFeedAddress: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        usdtUsdPriceFeedAddress: "0x92C09849638959196E976289418e5973CC96d645",
        maticUsdPriceFeedAddress: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        wethTokenAddress: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
        usdtTokenAddress: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832",
        maticTokenAddress: "0x0000000000000000000000000000000000001010",
    },
    // polygon mainnet
    137: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        usdtUsdPriceFeedAddress: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        maticUsdPriceFeedAddress: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
        wethTokenAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        usdtTokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        maticTokenAddress: "0x0000000000000000000000000000000000001010",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
