// SPDX-License-Identifier: MIT
// DERIVATION FROM OpenZeppelin Contracts (last updated v5.2.0) (proxy/ERC1967/ERC1967Proxy.sol)
// Intended to allow upgradeability of the contract


pragma solidity ^0.8.22;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title ERC1967Upgrade
 * @author Izetis
 * @notice This contract is intended to be used for upgradeability of the contract
 * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
 * implementation address that can be changed. This address is stored in storage in the location specified by
 * https://eips.ethereum.org/EIPS/eip-1967[ERC-1967], so that it doesn't conflict with the storage layout of the
 * implementation behind the proxy.
 */
contract ERC1967Upgrade is ERC1967Proxy {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `implementation`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `implementation`. This will typically be an
     * encoded function call, and allows initializing the storage of the proxy like a Solidity constructor.
     *
     * Requirements:
     *
     * - If `data` is empty, `msg.value` must be zero.
     */
    constructor(address implementation, bytes memory _data) payable ERC1967Proxy(implementation, _data) {
    }

    /**
     * @dev Upgrades the proxy to a new implementation.
     * @param newImplementation Address of the new implementation.
     * Requirements:
     *
     * - If `data` is empty, `msg.value` must be zero.
     */
    function upgradeTo(address newImplementation) public payable {
        ERC1967Utils.upgradeToAndCall(newImplementation,"");
    }

    /**
     * 
     * @param newImplementation Address of the new implementation.
     * @param _data initialize data call
     * Requirements:
     *
     * - If `data` is empty, `msg.value` must be zero.
     */
    function upgradeToAndCall(address newImplementation, bytes memory _data) public payable {
        ERC1967Utils.upgradeToAndCall(newImplementation,_data);
    }

    /**
     * @notice to avoid warnings. Cannot be called.
     */
    receive() external payable {
        revert("ERC1967Upgrade: contract cannot receive ether");
    }
}