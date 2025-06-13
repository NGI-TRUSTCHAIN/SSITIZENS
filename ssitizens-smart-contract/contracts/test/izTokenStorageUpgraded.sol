// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
    SSITIZENS token storage contract
    @author Izertis
 */
contract izTokenStorageUpgraded{
    struct party{
        uint8 permission; // Permission: (0: none, 1: CITIZEN 2: MERCHANT)
        uint256 expiration; // Expiration date: timestamp
        bytes attachedData; // Attached data: miscellaneous data attached to the party
    }

    address public issuer;
    address public compensationContract;

    uint256 public minimumTransfer;
    uint256 public minimumUserBalance;


    // user => PARTY. permission: (0: none, 1: CITIZEN 2: MERCHANT)
    mapping(address => party) public parties;
    
    // WARNING!!!! 
    // DO NOT CHANGE LINES BEFORE THIS LINE. ALL CHAGES MUST BE INCLUDED BELLOW
    // if changes are perfomed in previous lines, will cause data corruption in contract when upgrading

    uint256 public newField;
}