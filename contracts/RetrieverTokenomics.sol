// contracts/RetrieverTokenomics.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Retriever.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error RetrieverTokenomics__AlreadyWhitelistedPrivateSale();
error RetrieverTokenomics__NotOwner();
error RetrieverTokenomics__NotEnoughBalanceForPrivateSale();
error RetrieverTokenomics__NotWhitelisted();
error RetrieverTokenomics__SaleNotRunning();
error RetrieverTokenomics_InvalidInvestmentAmount();
error RetrieverTokenomics__PrivateSalePeriodExpired();
error RetrieverTokenomics__NotEnoughTokensToSell();

contract RetrieverTokenomics {
    using PriceConverter for uint256;

    struct InvestorPrivateSale {
        bool isWhitelisted;
        uint256 totalAmountInvested;
        uint256 tokensToSend;
    }

    struct PrivateSale {
        bool isRunning;
        uint256 startBlock;
        uint256 tokensLeft;
        uint256 amountRaisedUsd;
    }

    // State variables
    address[] private whitelistedForPrivateSale;
    PrivateSale private privateSale;

    // Immutable variables
    AggregatorV3Interface private immutable i_priceFeedWethToUsd;
    AggregatorV3Interface private immutable i_priceFeedUsdtToUsd;
    AggregatorV3Interface private immutable i_priceFeedMaticToUsd;
    ERC20 private immutable i_wethToken;
    ERC20 private immutable i_usdtToken;
    ERC20 private immutable i_maticToken;
    Retriever public immutable i_rtvToken;
    address public immutable i_owner;
    uint256 public immutable i_maxSupply;
    // Constants
    uint256 private constant PRIVATE_SALE_PERCENTAGE = 9;
    uint256 private constant PUBLIC_SALE_PERCENTAGE = 15;
    uint256 private constant INCENTIVIZING_PERCENTAGE = 10;
    uint256 private constant MARKETING_PARTNERSHIP_PERCENTAGE = 17;
    uint256 private constant FOUNDING_TEAM_PERCENTAGE = 10;
    uint256 private constant ADVISOR_PERCENTAGE = 2;
    uint256 private constant COMPANY_RESERVE_PERCENTAGE = 17;
    uint256 private constant LP_REWARD_PERCENTAGE = 10;
    uint256 private constant FUTURES_DEVELOP_PERCENTAGE = 11;
    uint256 public constant PRIVATE_SALE_TOKEN_PRICE_USD = 16 * (10 ** 16); // considering 18 decimals for USD for calculation purpose
    uint256 public constant MIN_INVESTMENT_USD = 1000 * (10 ** 18);
    uint256 public constant MAX_INVESTMENT_USD = 10000 * (10 ** 18);
    uint256 private constant AMOUNT_TO_RAISE_USD = 15000000 * (10 ** 18);
    uint256 private constant TOKENS_TO_SELL_PRIVATE_SALE = 93750000 * (10 ** 18);
    uint256 public constant PRIVATE_SALE_PERIOD_BlOCKS = (6 * 2592000) / 12; // 12s block time on goerli testnet

    // whitelisted investors for private sale
    mapping(address => InvestorPrivateSale) public investorsPrivateSale;

    event InvestorWhitelisted(address indexed investorPrivateSale);
    event PrivateSaleStarted(uint tokensOnSell);
    event TokensBought(address indexed investor, uint256 tokensPurchased);
    event PrivateSaleEnded();

    modifier onlyOwner(address caller) {
        if (caller != i_owner) {
            revert RetrieverTokenomics__NotOwner();
        }
        _;
    }

    modifier notAlreadyWhiteListedPrivateSale(address _investor) {
        if (investorsPrivateSale[_investor].isWhitelisted) {
            revert RetrieverTokenomics__AlreadyWhitelistedPrivateSale();
        }
        _;
    }

    modifier onlyWhitelisted(address caller) {
        if (!investorsPrivateSale[caller].isWhitelisted) {
            revert RetrieverTokenomics__NotWhitelisted();
        }
        _;
    }

    modifier saleRunning() {
        if (!privateSale.isRunning) {
            revert RetrieverTokenomics__SaleNotRunning();
        }
        _;
    }

    modifier satisfyMinMax(string memory _symbol, uint256 _amount) {
        uint256 amountUsd = (getEquivalentUsd(_symbol, _amount)) * (10 ** 18);
        if (amountUsd < MIN_INVESTMENT_USD || amountUsd > MAX_INVESTMENT_USD) {
            revert RetrieverTokenomics_InvalidInvestmentAmount();
        }
        _;
    }

    modifier periodLeft() {
        if (block.number - privateSale.startBlock >= PRIVATE_SALE_PERIOD_BlOCKS) {
            sendTokens();
            emit PrivateSaleEnded();
            revert RetrieverTokenomics__PrivateSalePeriodExpired();
        }
        _;
    }

    constructor(
        uint256 maxSupply,
        address priceFeedWethToUsd,
        address priceFeedUsdtToUsd,
        address priceFeedMaticToUsd,
        address wethToken,
        address usdtToken,
        address maticToken,
        address rtvToken
    ) {
        i_rtvToken = Retriever(rtvToken);
        i_owner = msg.sender;
        i_maxSupply = maxSupply;
        i_priceFeedWethToUsd = AggregatorV3Interface(priceFeedWethToUsd);
        i_priceFeedUsdtToUsd = AggregatorV3Interface(priceFeedUsdtToUsd);
        i_priceFeedMaticToUsd = AggregatorV3Interface(priceFeedMaticToUsd);
        i_wethToken = ERC20(wethToken);
        i_usdtToken = ERC20(usdtToken);
        i_maticToken = ERC20(maticToken);
    }

    function whitelistForPrivateSale(
        address investorPrivateSale
    )
        external
        onlyOwner(msg.sender)
        notAlreadyWhiteListedPrivateSale(investorPrivateSale)
        returns (bool success)
    {
        InvestorPrivateSale memory newInvestor = InvestorPrivateSale(true, 0, 0);
        investorsPrivateSale[investorPrivateSale] = newInvestor;
        whitelistedForPrivateSale.push(investorPrivateSale);
        emit InvestorWhitelisted(investorPrivateSale);
        success = true;
    }

    function startPrivateSale() external onlyOwner(msg.sender) returns (bool success) {
        // assuming that you have minted the required token first to this contract
        privateSale = PrivateSale(true, block.number, TOKENS_TO_SELL_PRIVATE_SALE, 0);
        emit PrivateSaleStarted(TOKENS_TO_SELL_PRIVATE_SALE);
        success = true;
    }

    function buyTokenPrivateSale(
        string memory symbol,
        uint256 amount
    )
        external
        saleRunning
        onlyWhitelisted(msg.sender)
        satisfyMinMax(symbol, amount)
        periodLeft
        returns (bool success)
    {
        uint256 amountUsd = getEquivalentUsd(symbol, amount);
        uint256 tokensToPurchase = (amountUsd * (10 ** 18) * (10 ** 18)) /
            PRIVATE_SALE_TOKEN_PRICE_USD;
        if (tokensToPurchase > privateSale.tokensLeft) {
            revert RetrieverTokenomics__NotEnoughTokensToSell();
        }
        ERC20 inputToken;
        if (compareStrings(symbol, "WETH")) {
            inputToken = i_wethToken;
        } else if (compareStrings(symbol, "USDT")) {
            inputToken = i_usdtToken;
        } else {
            inputToken = i_maticToken;
        }
        // msg.sender must have approved required allowance to this contract
        inputToken.transferFrom(msg.sender, address(this), amount);
        investorsPrivateSale[msg.sender].totalAmountInvested += amountUsd * (10 ** 18);
        investorsPrivateSale[msg.sender].tokensToSend += tokensToPurchase;
        privateSale.amountRaisedUsd += amountUsd * (10 ** 18);
        privateSale.tokensLeft -= tokensToPurchase;
        if (
            privateSale.tokensLeft <= 0 ||
            privateSale.amountRaisedUsd >= AMOUNT_TO_RAISE_USD ||
            block.number - privateSale.startBlock >= PRIVATE_SALE_PERIOD_BlOCKS
        ) {
            sendTokens();
            emit PrivateSaleEnded();
        }
        emit TokensBought(msg.sender, tokensToPurchase);
        success = true;
    }

    function endPrivateSale() external onlyOwner(msg.sender) saleRunning returns (bool success) {
        sendTokens();
        emit PrivateSaleEnded();
        success = true;
    }

    function getEquivalentUsd(
        string memory _symbol,
        uint256 _amount
    ) private view returns (uint256) {
        uint256 tokenDecimals;
        AggregatorV3Interface priceFeed;
        if (compareStrings(_symbol, "WETH")) {
            // decimals is 18 for WETH
            priceFeed = i_priceFeedWethToUsd;
            tokenDecimals = 18;
        } else if (compareStrings(_symbol, "USDT")) {
            // decimals is 6 for USDT
            priceFeed = i_priceFeedUsdtToUsd;
            tokenDecimals = 6;
        } else {
            // decimals is 18 for MATIC
            priceFeed = i_priceFeedMaticToUsd;
            tokenDecimals = 18;
        }
        return _amount.getConvertedAmount(priceFeed, tokenDecimals);
    }

    function sendTokens() private {
        privateSale.isRunning = false;
        i_rtvToken.transfer(i_owner, privateSale.tokensLeft);
        i_wethToken.transfer(i_owner, i_wethToken.balanceOf(address(this)));
        i_usdtToken.transfer(i_owner, i_usdtToken.balanceOf(address(this)));
        i_maticToken.transfer(i_owner, i_maticToken.balanceOf(address(this)));
        for (uint256 i = 0; i < whitelistedForPrivateSale.length; i++) {
            uint256 tokensToTransfer = investorsPrivateSale[whitelistedForPrivateSale[i]]
                .tokensToSend;
            i_rtvToken.transfer(whitelistedForPrivateSale[i], tokensToTransfer);
        }
    }

    function getFoundingTeamTokens() public view onlyOwner(msg.sender) returns (uint256) {
        return (i_maxSupply * FOUNDING_TEAM_PERCENTAGE) / 100;
    }

    function getTokensToSellInPrivateSale() public pure returns (uint256) {
        return TOKENS_TO_SELL_PRIVATE_SALE;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function isWhitelistedForPrivateSale(address investor) public view returns (bool) {
        return investorsPrivateSale[investor].isWhitelisted;
    }

    function getPrivateSaleStatus() public view returns (bool) {
        return privateSale.isRunning;
    }
}
