// contracts/MockStableToken.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title A mock StableToken for testing.
 */
contract MockStableToken is ERC20 {
    address public testAddress;

    constructor(address _testAddress) ERC20("test", "$TEST") {
        // assign the test address
        testAddress = _testAddress;

        // add initial supply
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public {
        // Only the test address can use this method
        require(msg.sender == testAddress, "Only the test address can mint tokens");

        // call the internal mint function
        _mint(to, amount);
    }
}
