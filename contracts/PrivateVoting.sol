// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PrivateVoting - FHE-based private DAO voting
/// @notice V1 uses mock FHE types. V2 will import real Zama fhevm.
/// @dev euint32 is represented as uint256 handle for V1 compatibility

contract PrivateVoting {

    struct Proposal {
        bool active;
        bool revealed;
        uint256 encryptedYesVotes;
        uint256 encryptedNoVotes;
        uint32 finalYesVotes;
        uint32 finalNoVotes;
        bool passed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(uint256 => uint256) private decryptRequestIdToProposal;

    address public gateway;
    address public owner;
    uint256 public requestCount;

    event ProposalCreated(uint256 indexed proposalId);
    event VoteCast(address indexed voter, uint256 indexed proposalId);
    event TallyRevealRequested(uint256 indexed proposalId, uint256 requestId);
    event ProposalResult(uint256 indexed proposalId, uint32 yesVotes, uint32 noVotes, bool passed);
    event DecryptionRequested(uint256 indexed requestId, uint256 yesHandle, uint256 noHandle);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyGateway() { require(msg.sender == gateway || msg.sender == owner, "Not gateway"); _; }

    constructor(address _gateway) {
        owner = msg.sender;
        gateway = _gateway;
    }

    function createProposal(uint256 proposalId) external {
        require(!proposals[proposalId].active, "Already exists");
        proposals[proposalId].active = true;
        proposals[proposalId].encryptedYesVotes = 0;
        proposals[proposalId].encryptedNoVotes = 0;
        emit ProposalCreated(proposalId);
    }

    /// @notice Cast an encrypted vote
    /// @param proposalId The proposal to vote on
    /// @param encryptedVote The FHE-encrypted vote value (1 for YES, submitted encrypted)
    /// @param voteChoice true = YES, false = NO (determines which tally to add to)
    function castVote(
        uint256 proposalId,
        bytes calldata encryptedVote,
        bool voteChoice
    ) external {
        require(proposals[proposalId].active, "Not active");
        require(!hasVoted[msg.sender][proposalId], "Already voted");

        // In V1: store the raw bytes hash as a handle
        // In V2: this will call FHE.asEuint32(encryptedVote, inputProof)
        uint256 voteHandle = uint256(keccak256(encryptedVote));

        if (voteChoice) {
            // FHE.add equivalent: XOR handles for V1 mock
            proposals[proposalId].encryptedYesVotes ^= voteHandle;
        } else {
            proposals[proposalId].encryptedNoVotes ^= voteHandle;
        }

        hasVoted[msg.sender][proposalId] = true;
        emit VoteCast(msg.sender, proposalId);
    }

    function requestTallyReveal(uint256 proposalId) external {
        require(proposals[proposalId].active, "Not active");
        require(!proposals[proposalId].revealed, "Already revealed");

        requestCount++;
        uint256 requestId = requestCount;
        decryptRequestIdToProposal[requestId] = proposalId;

        emit DecryptionRequested(
            requestId,
            proposals[proposalId].encryptedYesVotes,
            proposals[proposalId].encryptedNoVotes
        );
        emit TallyRevealRequested(proposalId, requestId);
    }

    /// @notice Called by gateway/relayer with decrypted results
    function fulfillTally(
        uint256 requestId,
        uint32 yesVotes,
        uint32 noVotes
    ) external onlyGateway {
        uint256 proposalId = decryptRequestIdToProposal[requestId];
        require(proposals[proposalId].active, "Invalid proposal");

        proposals[proposalId].finalYesVotes = yesVotes;
        proposals[proposalId].finalNoVotes = noVotes;
        proposals[proposalId].revealed = true;
        proposals[proposalId].passed = yesVotes > noVotes;

        emit ProposalResult(proposalId, yesVotes, noVotes, yesVotes > noVotes);
    }

    function getProposalStatus(uint256 proposalId) external view returns (
        bool active,
        bool revealed,
        uint32 yesVotes,
        uint32 noVotes,
        bool passed
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.active, p.revealed, p.finalYesVotes, p.finalNoVotes, p.passed);
    }

    function setGateway(address _gateway) external onlyOwner {
        gateway = _gateway;
    }
}
