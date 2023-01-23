// contracts/CreatorToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorToken is ERC20, Ownable {
    address public immutable i_creator;

    constructor(
        string memory name,
        string memory symbol,
        address creator,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        i_creator = creator;
        _mint(creator, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}
