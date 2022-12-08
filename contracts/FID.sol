// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract FID {
    struct ProposalVote {
        uint againstVotes;
        uint forVotes;
        mapping(address => bool) hasVoted;
    }

    struct Proposal {
        bool succeeded;
        string description;
    }

    enum ProposalState { Pending, Succeeded }

    mapping(uint => Proposal) public proposals;
    mapping(bytes32 => ProposalVote) public proposalVotes;
    event ProposalAdded(uint proposalId);
    uint totalProposalEntries = 0;

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

    function getAllProposals() public view returns (Proposal[] memory){
        Proposal[] memory ret = new Proposal[](totalProposalEntries);
            for (uint i = 0; i < totalProposalEntries; i++) {
                ret[i] = proposals[i];
            }
        return ret;
    }

    function propose(
        string memory _description
    ) external returns(uint) {
        // TODO: need require
        // bytes32 faceIdAddress = AddressToFaceid[msg.sender];
        // bytes32 empty = "";
        // require(faceIdAddress != empty);
         ++totalProposalEntries;
        uint proposalId = totalProposalEntries;

        // bytes32 proposalId = generateProposalId(
        //     keccak256(bytes(_description))
        // );

        //require(proposals[proposalId].votingStarts == 0, "proposal already exists");

        proposals[proposalId] = Proposal({
            succeeded: false,
            description: _description
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


    // function generateProposalId(
    //     bytes32 _descriptionHash
    // ) internal pure returns(bytes32) {
    //     return keccak256(abi.encode(
    //         _descriptionHash
    //     ));
    // }

    receive() external payable {}
}