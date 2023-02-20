// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract FID3 {

    struct Proposal {
        bool succeeded;
        string name;
        string description;
        uint againstVotes;
        uint forVotes;
    }

    mapping(address => bool) hasVoted;
    mapping(address =>  mapping(uint => bool)) hasVotedForProposal;
    mapping(address =>  mapping(uint => bool)) hasVotedAgainstProposal;
    enum ProposalState { Pending, Succeeded }
    mapping(uint => Proposal) public proposals;
    event AlreadyVoted(address);
    event ProposalAdded(uint proposalId);
    event ProposalSucceeded(uint proposalId);
    event ProposalPending(uint proposalId);
    uint totalProposalEntries = 0;
    mapping(address => bytes32) public AddressToFaceid; //check FaceId is unical
    uint totalEntries = 0;
    mapping (bytes32 => bool) faceIdAlreadyExist;

    function getAddressToFaceid(address _addr) public view returns (bytes32) {
        return AddressToFaceid[_addr];
    }
    
    function setAddressToFaceid(address _addr, bytes32 _faceid) public {
        // Update the value at this address
        require(faceIdAlreadyExist[_faceid]==false);
        faceIdAlreadyExist[_faceid] = true;
        AddressToFaceid[_addr] = _faceid;
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
        string memory _name,
        string memory _description
    ) external returns(uint) {
        // TODO: need require
        // require(AddressToFaceid[msg.sender] > 0);
         ++totalProposalEntries;
        uint proposalId = totalProposalEntries;

        proposals[proposalId] = Proposal({
            succeeded: false,
            name: _name,
            description: _description,
            againstVotes: 0,
            forVotes: 0
        });

        emit ProposalAdded(proposalId);

        return proposalId;
    }

    
        function vote(uint proposalId, uint8 voteType) external {
        //require(state(proposalId) == ProposalState.Active, "invalid state");

        // bytes32 faceIdAddress = AddressToFaceid[msg.sender];
        // bytes32 empty = "";
        // require(faceIdAddress != empty);

        Proposal storage _proposal = proposals[proposalId];

        //require(!hasVoted[msg.sender], "already voted");
        if(!hasVoted[msg.sender]) {
            revert("already voted");
            //emit AlreadyVoted(msg.sender);

        }
        else{

        if(voteType == 0) {
            _proposal.againstVotes++;
        } else if(voteType == 1) {
            _proposal.forVotes++;
        }

        hasVoted[msg.sender] = true;
        }
    }

    // function vote(uint proposalId, uint8 voteType) external {

    //     // Check that the proposalId is valid
    //     require(proposalId > 0 && proposalId <= totalProposalEntries, "invalid proposal ID");
    //     // bytes32 faceIdAddress = AddressToFaceid[msg.sender];
    //     // bytes32 empty = 0;
    //     // require(faceIdAddress != empty);
    //     Proposal storage _proposal = proposals[proposalId];

    //     if(voteType == 0) {
    //         //require(!hasVotedAgainstProposal[msg.sender][proposalId], "already voted against propose");
    //         if(hasVotedForProposal[msg.sender][proposalId] = true){
    //             _proposal.forVotes--;
    //         }
    //         _proposal.againstVotes++;
    //         hasVotedAgainstProposal[msg.sender][proposalId] = true;
    //         hasVotedForProposal[msg.sender][proposalId] = false;

    //     } else if(voteType == 1) {
    //         //require(!hasVotedForProposal[msg.sender][proposalId], "already voted for propose");
    //         if(hasVotedAgainstProposal[msg.sender][proposalId] = true){
    //             _proposal.againstVotes--;
    //         }
    //         _proposal.forVotes++;
    //         hasVotedForProposal[msg.sender][proposalId] = true;
    //         hasVotedAgainstProposal[msg.sender][proposalId] = false;
    //     }

        // uint quorumVotes = totalEntries * 66 / 100; // 51 diapason 51 - 100
        // require(_proposal.forVotes > _proposal.againstVotes, "forVotes must be greater than againstVotes");
        // uint totalVotes = _proposal.forVotes - _proposal.againstVotes;
        // if(totalVotes > quorumVotes) {
        //     _proposal.succeeded = true;
        //     emit ProposalSucceeded(proposalId);
        // } else {
        //     _proposal.succeeded = false;
        //     emit ProposalPending(proposalId);
        // }

   // }

    // function state(uint proposalId) public view returns (ProposalState) {

    //     Proposal storage proposal = proposals[proposalId];

    //     if (proposal.succeeded) {
    //         return ProposalState.Succeeded;
    //     } else {
    //         return ProposalState.Pending;
    //     }
    // }

    //receive() external payable {}
}