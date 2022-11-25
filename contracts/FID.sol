// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract FID {
    // Mapping from address to uint
    mapping(address => string) public AddressToFaceid;

    function get(address _addr) public view returns (string memory) {
        // Mapping always returns a value.
        // If the value was never set, it will return the default value.
        return AddressToFaceid[_addr];
    }

    function set(address _addr, string memory _i) public {
        // Update the value at this address
        AddressToFaceid[_addr] = _i;
    }

    function remove(address _addr) public {
        // Reset the value to the default value.
        delete AddressToFaceid[_addr];
    }
}
