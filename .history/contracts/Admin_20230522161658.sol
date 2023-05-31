// SPDX-License-Identifier: MIT

//This line specifies the version of Solidity that the contract is written in
pragma solidity ^0.8.2;



//This line defines the start of the RewardsContract contract, which inherits from the AccessControlUpgradeable contract.
contract RewardsContract is AccessControlUpgradeable {
    struct Commit {
        address owner;
        uint256 number;
        uint256 budget;
        uint256 balance;
        uint256 spent;
    }

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    mapping(uint256 => Commit) private commits;
    mapping(address => uint256) private userBalances;
    mapping(address => uint256) private userSpent;
    mapping(address => uint256) private userTrustScore;

    uint256 private commitCounter;
    address public stableToken;

    event PayoutSent(
        address indexed recipient,
        uint256 timestamp,
        string payoutMetadataURL,
        bool front,
        uint256 balance
    );

    function initialize() public initializer {
        __AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
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
