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

    struct Commit {
        address payable owner;
        uint256 numberOfTrees;
        uint256 budget;
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
        uint256 payoutAmount,
        string payoutMetadata
    );

    IERC20Upgradeable private _stableToken;
    uint256 private constant MAX_PERCENTAGE = 10000;
    CountersUpgradeable.Counter private _commitIdTracker;
    mapping(uint256 => Commit) private _commits;
    // mapping(address => uint256) private _userBalances;
    mapping(address => uint256) private _userDebt;


    function initialize(address stableTokenAddress) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        require(
            stableTokenAddress != address(0),
            "Zero address for stabletoken"
        );
        _stableToken = IERC20Upgradeable(stableTokenAddress);
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
    require(commit.spent < commit.budget, "Budget has been fully spent");

    uint256 remainingBudget = commit.budget - commit.spent;
    uint256 actualPayoutAmount = payoutAmount;
    if (actualPayoutAmount > remainingBudget) {
        actualPayoutAmount = remainingBudget;
    }

    _userDebt[commit.owner] += actualPayoutAmount;

    commit.spent += actualPayoutAmount;

    if (actualPayoutAmount > 0) {
        bool success = _stableToken.transferFrom(
            msg.sender,
            commit.owner,
            actualPayoutAmount
        );
        require(success, "Transfer failed");
    }

    emit PayoutSent(
        commitId,
        commit.owner,
        timestamp,
        true,
        actualPayoutAmount,
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
    require(commit.spent < commit.budget, "Budget has been fully spent");

    uint256 remainingBudget = commit.budget - commit.spent;
    uint256 actualPayoutAmount = payoutAmount;
    if (actualPayoutAmount > remainingBudget) {
        actualPayoutAmount = remainingBudget;
    }

    uint256 userDebt = _userDebt[commit.owner];
    if (actualPayoutAmount > userDebt) {
        uint256 excessAmount = actualPayoutAmount - userDebt;
        actualPayoutAmount = userDebt;
        if (_stableToken.transferFrom(msg.sender, commit.owner, excessAmount)) {
            emit PayoutSent(commitId, commit.owner, timestamp, false, excessAmount, payoutMetadata);
        }
    }

    _userDebt[commit.owner] -= actualPayoutAmount;
    commit.spent += actualPayoutAmount;

   

    emit PayoutSent(
        commitId,
        commit.owner,
        timestamp,
        false,
        actualPayoutAmount,
        payoutMetadata
    );
}


    function getUserBalance(address userAddress) external view returns (uint256) {
        return _userDebt[userAddress];
    }

    function getCommitBalance(uint256 commitId) public view returns (uint256) {
        Commit memory commit = _commits[commitId];
        return commit.budget - commit.spent;
    }
}
