// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Governance {
    struct ProposalVote {
        uint againstVotes;
        uint forVotes;
        mapping(address => bool) hasVoted;
    }

    struct Proposal {
        bool executed;
    }

    enum ProposalState { Pending, Succeeded }

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => ProposalVote) public proposalVotes;

    mapping(address => bytes32) public AddressToFaceid; //check FaceId is unical
    uint totalEntries = 0;
    mapping (bytes32 => bool) faceIdAlreadyExist;

    function getAddressToFaceid(address _addr) public view returns (bytes32) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return AddressToFaceid[_addr];
    }

    function setAddressToFaceid(address _addr, bytes32 _i) public {
        // Update the value at this address
        require(faceIdAlreadyExist[_i]==false);
        faceIdAlreadyExist[_i] = true;
        AddressToFaceid[_addr] = _i;
        ++totalEntries;
        
    }

    event ProposalAdded(bytes32 proposalId);

    function propose(
        string calldata _description
    ) external returns(bytes32) {
        
        bytes32 faceIdAddress = AddressToFaceid[msg.sender];
        bytes32 empty = "";
        require(faceIdAddress != empty);

        bytes32 proposalId = generateProposalId(
            keccak256(bytes(_description))
        );

        //require(proposals[proposalId].votingStarts == 0, "proposal already exists");

        proposals[proposalId] = Proposal({
            executed: false
        });

        emit ProposalAdded(proposalId);

        return proposalId;
    }


    function vote(bytes32 proposalId, uint8 voteType) external {
        //require(state(proposalId) == ProposalState.Active, "invalid state");

        bytes32 faceIdAddress = AddressToFaceid[msg.sender];
        bytes32 empty = "";
        require(faceIdAddress != empty);

        ProposalVote storage proposalVote = proposalVotes[proposalId];

        require(!proposalVote.hasVoted[msg.sender], "already voted");

        if(voteType == 0) {
            proposalVote.againstVotes++;
        } else if(voteType == 1) {
            proposalVote.forVotes++;
        }

        proposalVote.hasVoted[msg.sender] = true;
    }

    function state(bytes32 proposalId) public view returns (ProposalState) {
        //Proposal storage proposal = proposals[proposalId];
        ProposalVote storage proposalVote = proposalVotes[proposalId];

        uint resultVotes = proposalVote.forVotes - proposalVote.againstVotes; // int?
        uint quorumVotes = totalEntries * 51 / 100; // 51 diapason 51 - 100

        if(resultVotes > quorumVotes) {//proposalVote.forVotes - proposalVote.againstVotes > totalEntries * 51 / 100
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Pending;
        }
    }


    function generateProposalId(
        bytes32 _descriptionHash
    ) internal pure returns(bytes32) {
        return keccak256(abi.encode(
            _descriptionHash
        ));
    }

    receive() external payable {}
}