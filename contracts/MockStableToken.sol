// contracts/MockStableToken.sol
// SPDX-License-Identifier: Apache-2.0
<<<<<<< HEAD
pragma solidity ^0.8.1;
=======
pragma solidity ^0.8.16;
>>>>>>> 3f438a317730443d2010b55bbe7580aa8f8630a0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title A mock StableToken for testing.
 */
contract MockStableToken is ERC20 {
    constructor() ERC20("test", "$TEST") {
        // add initial supply
<<<<<<< HEAD
        _mint(msg.sender, 1000000 * 10**18);
    }
}
=======
        _mint(msg.sender, 1000000);
    }
}
>>>>>>> 3f438a317730443d2010b55bbe7580aa8f8630a0
