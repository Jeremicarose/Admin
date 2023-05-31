// contracts/TestAdmin.sol
// SPDX-License-Identifier: MIT Licensed
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestAdmin is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Commit {
        address payable owner;
        uint256 numberOfTrees;
        uint256 budget;
        uint256 balance;
        uint256 spent;
    }

    event CommitCreated(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 commitId,
        uint256 budget,
        uint256 numberOfTrees
    );

    event PayoutSent(
        uint256 indexed commitId,
        address indexed owner,
        uint256 indexed timestamp,
        bool isFronted,
        uint256 balance,
        uint256 payoutAmount,
        string payoutMetadata
    );

    IERC20 private immutable _stableToken;

    uint256 private constant MAX_PERCENTAGE = 10000;

    Counters.Counter private _commitIdTracker;

    mapping(uint256 => Commit) private _commits;

    constructor(address stableTokenAddress) {
        require(
            stableTokenAddress != address(0),
            "Zero address for stabletoken"
        );
        _stableToken = IERC20(stableTokenAddress);
    }

    function commitTree(
        address owner,
        uint256 budget,
        uint256 numberOfTrees,
        uint256 timestamp
    ) external nonReentrant {
        require(owner != address(0), "Zero address for owner");
        require(budget > 0, "Budget must be greater than 0");
        require(numberOfTrees > 0, "Number of trees must be greater than 0");

        uint256 commitId = _commitIdTracker.current();
        _commits[commitId] = Commit({
            owner: payable(owner),
            numberOfTrees: numberOfTrees,
            budget: budget,
            balance: 0,
            spent: 0
        });
        _commitIdTracker.increment();

        emit CommitCreated(owner, timestamp, commitId, budget, numberOfTrees);
    }

    function frontPayout(
        uint256 commitId,
        uint256 payoutAmount,
        uint256 timestamp
    ) external nonReentrant {
        require(
            _commits[commitId].owner != address(0),
            "No commits exist for that id"
        );
        Commit storage commit = _commits[commitId];
        require(commit.spent <= commit.budget, "Budget has been fully spent");

        commit.spent += payoutAmount;
        require(commit.spent <= commit.budget, "Payout will exceed the budget");
        commit.balance += payoutAmount;

        require(
            _stableToken.transferFrom(msg.sender, commit.owner, payoutAmount),
            "Transfer failed"
        );

        emit PayoutSent(
            commitId,
            commit.owner,
            timestamp,
            true,
            commit.balance,
            payoutAmount,
            ""
        );
    }

    function approvePayout(
        uint256 commitId,
        uint256 payoutAmount,
        string calldata payoutMetadata,
        uint256 timestamp
    ) external nonReentrant {
        require(
            _commits[commitId].owner != address(0),
            "No commits exist for that id"
        );
        Commit storage commit = _commits[commitId];
        require(commit.spent <= commit.budget, "Budget has been fully spent");

        commit.spent += payoutAmount;
        require(commit.spent <= commit.budget, "Payout will exceed the budget");
        commit.balance += payoutAmount;

        emit PayoutSent(
            commitId,
            commit.owner,
            timestamp,
            false,
            commit.balance,
            payoutAmount,
            payoutMetadata
        );
    }
}