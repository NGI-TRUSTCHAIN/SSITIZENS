// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//EIP-1066 Result codes
bytes1 constant EIP1066_SUCCESS = 0x01;
bytes1 constant EIP1066_DISALLOWED_OR_STOP = 0x10;
bytes1 constant EIP1066_TRANSFER_FAILED = 0x50;
bytes1 constant EIP1066_TRANSFER_SUCCESSFUL = 0x51;
bytes1 constant EIP1066_HOLD_SCROW = 0x53;
bytes1 constant EIP1066_INSUFFICIENT_FUNDS = 0x54;

//ROLES
uint8 constant ROLE_NONE = 0x00;
uint8 constant ROLE_CITIZEN = 0x01;
uint8 constant ROLE_MERCHANT = 0x02;


// MIN AMOUNT OF GASLEFT
uint256 constant MIN_GASLEFT = 20_000;



