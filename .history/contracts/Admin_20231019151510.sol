// SPDX-License-Identifier: MIT Licensed
pragma solidity ^0.8.2;

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
    address private _stableTokenAddress;
    uint256 private constant MAX_PERCENTAGE = 10000;
    CountersUpgradeable.Counter private _commitIdTracker;
    mapping(uint256 => Commit) private _commits;
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

     modifier onlyOwner() {
        require(msg.sender == owner(), "Not owner");
        _;
    }

    function commitTrees(uint256 budget, address owner) external onlyAdmin {
        require(budget > 0, "Budget mut be greater than 0");
        require(owner != address(0), "Owner address must be valid");
        commitCounter++;
        commits[commitCounter] = Commit(owner, commitCounter, budget, 0, 0);
    }

    function setStableToken(address _stableToken) external onlyAdmin {
        stableToken = _stableToken;
    }

    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call.");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an admin"
        );
        _;
    }

    function frontPayout(
        uint256 commitId,
        uint256 payoutAmount,
        uint256 timestamp
    ) external onlyAdmin nonReentrant {
        require(
            commits[commitId].owner != address(0),
            "No commits exist for that id"
        );
        Commit storage commit = commits[commitId];
        require(commit.spent < commit.budget, "Budget has been fully spent");

        commit.spent += payoutAmount;
        require(commit.spent <= commit.budget, "Payout will exceed the budget");
        commit.balance += payoutAmount;

        emit PayoutSent(commit.owner, timestamp, "", true, commit.balance);
    }

    function approvePayout(
        uint256 commitId,
        uint256 payoutAmount,
        string memory payoutMetadataURL,
        uint256 timestamp
    ) external onlyAdmin nonReentrant {
        require(
            commits[commitId].owner != address(0),
            "No commits exist for that id"
        );
        Commit storage commit = commits[commitId];
        require(commit.spent < commit.budget, "Budget has been fully spent");
        uint256 newBalance = payoutAmount - commit.balance;
        if (newBalance > 0) {
            require(
                IERC20(stableToken).transferFrom(
                    msg.sender,
                    commit.owner,
                    newBalance
                ),
                "Transfer failed"
            );
            commit.balance = newBalance;
            commit.spent += newBalance;
        } else if (newBalance == 0) {
            commit.balance = 0;
        } else {
            commit.balance += payoutAmount;
        }
        emit PayoutSent(
            commit.owner,
            timestamp,
            payoutMetadataURL,
            false,
            commit.balance
        );
    }
}