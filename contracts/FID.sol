// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract FID {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

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
    event AlreadyVoted(address msgSender);
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

    function fetchProposals() public view returns (Proposal[] memory) {
      uint totalItemCount = _tokenIds.current();
//      uint itemCount = 0;
      uint currentIndex = 0;

    //   for (uint i = 0; i < totalItemCount; i++) {
    //     if (proposals[i + 1].owner == msg.sender) {
    //       itemCount += 1;
    //     }
    //  }

      Proposal[] memory items = new Proposal[](totalItemCount);
      for (uint i = 0; i < totalItemCount; i++) {
       
          uint currentId = i + 1;
          Proposal storage currentItem = proposals[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        
      }
      return items;
    }




    function getProposalById(uint id) public view returns (Proposal memory) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return proposals[id];
    }

    //mapping(address =>  mapping(uint => bool)) hasVotedForProposal;
    function getHasVotedForProposal(address _voterAddress, uint _voteId) public view returns (bool) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return hasVotedForProposal[_voterAddress][_voteId];
    }

    function getHasVotedAgainstProposal(address _voterAddress, uint _voteId) public view returns (bool) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return hasVotedAgainstProposal[_voterAddress][_voteId];
    }

    function propose(
        string memory _name,
        string memory _description
    ) external returns(uint) {
        // TODO: need require
        // require(AddressToFaceid[msg.sender] > 0);
        _tokenIds.increment();
        uint proposalId = _tokenIds.current();

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

        Proposal storage _proposal = proposals[proposalId];

            if(voteType == 0) {
            require(!hasVotedAgainstProposal[msg.sender][proposalId], "already voted against propose");
            if(hasVotedForProposal[msg.sender][proposalId] == true){
                _proposal.forVotes--;
            }
            _proposal.againstVotes++;
            hasVotedAgainstProposal[msg.sender][proposalId] = true;
            hasVotedForProposal[msg.sender][proposalId] = false;

        } else if(voteType == 1) {
            require(!hasVotedForProposal[msg.sender][proposalId], "already voted for propose");
            if(hasVotedAgainstProposal[msg.sender][proposalId] == true){
                _proposal.againstVotes--;
            }
            _proposal.forVotes++;
            hasVotedForProposal[msg.sender][proposalId] = true;
            hasVotedAgainstProposal[msg.sender][proposalId] = false;
        }

        uint quorumVotes = totalEntries * 66 / 100; // 51 diapason 51 - 100
        require(_proposal.forVotes > _proposal.againstVotes, "forVotes must be greater than againstVotes");
        uint totalVotes = _proposal.forVotes - _proposal.againstVotes;
        if(totalVotes > quorumVotes) {
            _proposal.succeeded = true;
            emit ProposalSucceeded(proposalId);
        } else {
            _proposal.succeeded = false;
            emit ProposalPending(proposalId);
        }

 
    }


}