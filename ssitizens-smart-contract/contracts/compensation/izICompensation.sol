// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
    @title SSITIZENS compensation interface
    @author Izertis
    @notice This contract handles compensation transactions, managing fund transfers and contract allowances.
 */
interface izICompensation{

    /**
     * @notice Compensates a specified address with a given amount. Only allowed contracts can call this function.
     * @notice Does not need reentrancy protection as it only pays to EOAs.
     * @param _to The recipient address.
     * @param _minAmount The minuimum amount recipient must have.
     */
    function compense(address _to, uint256 _minAmount) external;
}
