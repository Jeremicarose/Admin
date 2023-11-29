// SPDX-License-Identifier: MIT Licensed
pragma solidity ^0.8.1;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Admin is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    struct Goal {
        address payable owner;
        uint256 numberOfTrees;
        uint256 budget;
        uint256 spent;
    }

    event goalCreated(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 goalId,
        uint256 budget,
        uint256 numberOfTrees
    );
    event PayoutSent(
        uint256 indexed goalId,
        address indexed owner,
        uint256 indexed timestamp,
        bool isFronted,
        uint256 payoutAmount,
        string payoutMetadata
    );

    IERC20Upgradeable private _stableToken;
    address private _stableTokenAddress;
    uint256 private constant MAX_PERCENTAGE = 10000;
    CountersUpgradeable.Counter private _goalIdTracker;
    mapping(uint256 => Goal) private _goals;
    mapping(address => uint256) private _userDebt;

    function initialize(address stableTokenAddress) external initializer onlyOwner {
        __Ownable_init();
        __ReentrancyGuard_init();

        require(
            stableTokenAddress != address(0),
            "Zero address for stabletoken"
        );
        _stableToken = IERC20Upgradeable(stableTokenAddress);
        _stableTokenAddress = stableTokenAddress;
    }

    function goalTree(
        address owner,
        uint256 budget,
        uint256 numberOfTrees,
        uint256 timestamp
    ) external nonReentrant onlyOwner {
        require(owner != address(0), "Zero address for owner");
        require(budget > 0, "Budget must be greater than 0");
        require(numberOfTrees > 0, "Number of trees must be greater than 0");

        uint256 goalId = _goalIdTracker.current();
        _goals[goalId] = Goal({
            owner: payable(owner),
            numberOfTrees: numberOfTrees,
            budget: budget,
            spent: 0
        });
        _goalIdTracker.increment();

        emit goalCreated(owner, timestamp, goalId, budget, numberOfTrees);
    }

    function frontPayoutWithoutTransfer(
        uint256 goalId,
        uint256 payoutAmount,
        uint256 timestamp
    ) external nonReentrant onlyOwner {
        require(
            _goals[goalId].owner != address(0),
            "No goals exist for that id"
        );

        goal storage goal = _goals[goalId];
        require(goal.spent < goal.budget, "Budget has been fully spent");

        uint256 remainingBudget = goal.budget - goal.spent;
        uint256 actualPayoutAmount = payoutAmount;
        if (actualPayoutAmount > remainingBudget) {
            actualPayoutAmount = remainingBudget;
        }

        _userDebt[goal.owner] += actualPayoutAmount;
        goal.spent += actualPayoutAmount;

        emit PayoutSent(
            goalId,
            goal.owner,
            timestamp,
            true,
            actualPayoutAmount,
            ""
        );
    }

     function frontPayout(
        uint256 goalId,
        uint256 payoutAmount,
        uint256 timestamp
    ) external nonReentrant onlyOwner() {
        require(
            _goals[goalId].owner != address(0),
            "No goals exist for that id"
        );

        goal storage goal = _goals[goalId];
        require(goal.spent < goal.budget, "Budget has been fully spent");

        uint256 remainingBudget = goal.budget - goal.spent;
        uint256 actualPayoutAmount = payoutAmount;
        if (actualPayoutAmount > remainingBudget) {
            actualPayoutAmount = remainingBudget;
        }

        _userDebt[goal.owner] += actualPayoutAmount;

        goal.spent += actualPayoutAmount;

        if (actualPayoutAmount > 0) {
            bool success = _stableToken.transferFrom(
                msg.sender,
                goal.owner,
                actualPayoutAmount
            );
            require(success, "Transfer failed");
        }

        emit PayoutSent(
            goalId,
            goal.owner,
            timestamp,
            true,
            actualPayoutAmount,
            ""
        );
    }

    function approvePayout(
        uint256 goalId,
        uint256 payoutAmount,
        string calldata payoutMetadata,
        uint256 timestamp
    ) external nonReentrant onlyOwner {
        require(
            _goals[goalId].owner != address(0),
            "No goals exist for that id"
        );

        goal storage goal = _goals[goalId];
        require(goal.spent < goal.budget, "Budget has been fully spent");

        uint256 remainingBudget = goal.budget - goal.spent;
        uint256 actualPayoutAmount = payoutAmount;
        if (actualPayoutAmount > remainingBudget) {
            actualPayoutAmount = remainingBudget;
        }

        uint256 userDebt = _userDebt[goal.owner];
        if (actualPayoutAmount > userDebt) {
            uint256 excessAmount = actualPayoutAmount - userDebt;
            _userDebt[goal.owner] = 0;
            goal.spent += excessAmount;

            if (excessAmount > 0) {
                require(
                    _stableToken.transferFrom(
                        msg.sender,
                        goal.owner,
                        excessAmount
                    ),
                    "Transfer failed"
                );
            }
        } else         {
            _userDebt[goal.owner] -= actualPayoutAmount;
        }

        emit PayoutSent(
            goalId,
            goal.owner,
            timestamp,
            false,
            actualPayoutAmount,
            payoutMetadata
        );
    }

    function getUserDebt(address userAddress) external view returns (uint256) {
        return _userDebt[userAddress];
    }

    function getgoalBalance(uint256 goalId) public view returns (uint256) {
        goal memory goal = _goals[goalId];
        return goal.budget - goal.spent;
    }

    function getStableTokenAddress() external view returns (address) {
        return _stableTokenAddress;
    }

   
}

