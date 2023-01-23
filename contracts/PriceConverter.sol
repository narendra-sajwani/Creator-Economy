// contracts/PriceConverter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer);
    }

    function getConvertedAmount(
        uint256 tokenAmount,
        AggregatorV3Interface priceFeed,
        uint256 tokenDecimals
    ) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(priceFeed);
        uint256 feedDecimals = 8;
        uint256 tokenAmountInUsd = (tokenPrice * tokenAmount) /
            (10 ** (feedDecimals + tokenDecimals));
        return tokenAmountInUsd;
    }
}
