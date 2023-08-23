// SPDX-License-Identifier: MIT Licensed
pragma solidity ^0.8.16;

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
        address owner;
        uint256 trees;
        uint256 budget;
        uint256 spent;
    }

    IERC20Upgradeable private _stableToken;
    CountersUpgradeable.Counter private _commitIds;
    mapping(uint256 => Commit) private _commits;
    mapping(address => uint256) private _userBalances;

    event CommitCreated(uint256 indexed commitId, address indexed owner, uint256 trees, uint256 budget);
    event PayoutSent(uint256 indexed commitId, address indexed owner, uint256 timestamp, bool front, uint256 amount, string metadata);

    function initialize(address stableToken) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        _stableToken = IERC20Upgradeable(stableToken);
    }

    function commitTree(uint256 trees, uint256 budget) external {
        _commitIds.increment();
        uint256 newCommitId = _commitIds.current();

        _commits[newCommitId] = Commit({
            owner: msg.sender,
            trees: trees,
            budget: budget,
            spent: 0
        });

        emit CommitCreated(newCommitId, msg.sender, trees, budget);
    }

    function frontPayout(uint256 commitId, uint256 payoutAmount, uint256 timestamp) external nonReentrant {
        Commit storage commit = _commits[commitId];
        require(commit.budget >= commit.spent + payoutAmount, "Not enough budget left");

        uint256 actualPayoutAmount = payoutAmount;
        if (commit.budget - commit.spent < payoutAmount) {
            actualPayoutAmount = commit.budget - commit.spent;
        }

        require(_stableToken.transferFrom(msg.sender, commit.owner, actualPayoutAmount), "Transfer failed");
        _userBalances[commit.owner] += actualPayoutAmount;
        commit.spent += actualPayoutAmount;

        emit PayoutSent(commitId, commit.owner, timestamp, true, actualPayoutAmount, "");
    }

    function approvePayout(uint256 commitId, uint256 payoutAmount, string calldata payoutMetadata, uint256 timestamp) external nonReentrant {
        Commit storage commit = _commits[commitId];
        require(commit.budget >= commit.spent + payoutAmount, "Not enough budget left");

        uint256 actualPayoutAmount = payoutAmount;
        if (commit.budget - commit.spent < payoutAmount) {
            actualPayoutAmount = commit.budget - commit.spent;
        }

        if (actualPayoutAmount > _userBalances[commit.owner]) {
            uint256 amountToTransfer = actualPayoutAmount - _userBalances[commit.owner];
            require(_stableToken.transferFrom(msg.sender, commit.owner, amountToTransfer), "Transfer failed");
            _userBalances[commit.owner] += amountToTransfer;
        }

        _userBalances[commit.owner] -= actualPayoutAmount;
        commit.spent += actualPayoutAmount;

        emit PayoutSent(commitId, commit.owner, timestamp, false, actualPayoutAmount, payoutMetadata);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return _userBalances[user];
    }

    function getCommitBalance(uint256 commitId) external view returns (uint256) {
        Commit storage commit = _commits[commitId];
        return commit.budget - commit.spent;
    }
}
