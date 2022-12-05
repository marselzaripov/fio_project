// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract FID2 {
    // Mapping from address to FaceID
    //Check address and Face ID unical
    mapping(address => string) public AddressToFaceid;
    uint public totalEntries = 0;

    function get(address _addr) public view returns (string memory) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return AddressToFaceid[_addr];
    }

    function set(address _addr, string memory _i) public {
        // Update the value at this address
        AddressToFaceid[_addr] = _i;
        ++totalEntries;
    }

    function remove(address _addr) public {
        // Reset the value to the default value.
        delete AddressToFaceid[_addr];
        --totalEntries;
    }

// count mapping elements

//execute = 50percent + 1 of mappingSum 

    
}
