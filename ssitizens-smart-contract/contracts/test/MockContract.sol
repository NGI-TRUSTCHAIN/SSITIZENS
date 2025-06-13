// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract MockContract is IERC165 {
    event ExecutionResult(bool success, bytes result);

    /**
     * @notice Ejecuta el bytecode en la dirección proporcionada.
     * @param target La dirección del contrato donde se ejecutará el bytecode.
     * @param data El bytecode de la ejecución.
     */
    function exec(
        address target,
        bytes memory data
    ) public payable returns (bool, bytes memory) {
        require(target != address(0), "Target address cannot be zero");

        (bool success, bytes memory result) = target.call{value: msg.value}(
            data
        );

        emit ExecutionResult(success, result);

        require(success, "Execution failed");
        return (success, result);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }

    receive() external payable {
        //Exhaust transaction gas
        while (true) {
            // Do nothing, just consume gas
        }   
    }
}