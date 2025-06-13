// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./izICompensation.sol";

/**
    @title SSITIZENS compensation contract
    @author Izertis
    @notice This contract handles compensation transactions, managing fund transfers and contract allowances.
 */
contract izCompensation is Ownable, Pausable, izICompensation, IERC165 {
    event balanceIncreasedEvent(uint256 _amountReceived, uint256 _balance);
    event balanceDecreasedEvent(uint256 _amountReceived, uint256 _balance);
    event paymentEvent(address _to, uint256 _amount);
    event notPaymentEvent(address _to);
    event changeIssuerEvent(address oldIssuer, address newIssuer);
    event contractAllowedEvent(address _contract, bool _isAllowed);

    error UnauthorizedAddress(address _address);
    error UnauthorizedContract(address _address);
    error NotEnoughFunds(uint256 _balance, uint256 _amount);
    error addressZeroNotAllowed();
    error transferFailded(address _to, uint256 _amount);

    address public issuer;
    mapping(address => bool) public contractAllowed;

    modifier onlyIssuer() {
        if (_msgSender() != issuer) {
            revert UnauthorizedAddress(_msgSender());
        }
        _;
    }

    modifier onlyOwnerOrIssuer() {
        if (_msgSender() != issuer && _msgSender() != owner()) {
            revert UnauthorizedAddress(_msgSender());
        }
        _;
    }

    modifier onlyAllowedContract() {
        if (!contractAllowed[_msgSender()]) {
            revert UnauthorizedContract(_msgSender());
        }
        _;
    }

    /**
     * @notice Constructor to initialize the contract with an owner and an issuer.
     * @param _owner The address of the contract owner.
     * @param _issuer The address of the initial issuer.
     */
    constructor(address _owner, address _issuer) Ownable(_owner) {
        issuer = _issuer;
    }

    /*******************************************************************************************************
     * GOBERNANCE MANAGEMENT
     *****************************************************************************************************/

    /**
     * @notice Changes the issuer of the contract. Can only be called by the owner.
     * @param _issuer The new issuer address.
     */
    function changeIssuer(address _issuer) public onlyOwner {
        if (_issuer == address(0)) {
            revert addressZeroNotAllowed();
        }

        address oldIssuer = issuer;
        issuer = _issuer;
        emit changeIssuerEvent(oldIssuer, issuer);
    }

    /**
     * @dev Pauses token transfers and operations.
     * Only the contract owner or the issuer can call this function.
     */
    function pause() external onlyOwnerOrIssuer {
        _pause();
    }

    /**
     * @dev Unpauses token transfers and operations.
     * Only the contract owner or the issuer can call this function.
     */
    function unpause() external onlyOwnerOrIssuer {
        _unpause();
    }

    /*******************************************************************************************************
     * CONTRACT ALLOWANCE MANAGEMENT
     *****************************************************************************************************/

    /**
     * @notice Allows a contract to use compensation functions. Can only be called by the issuer.
     * @param _contract The contract address to allow.
     */
    function allowContract(address _contract) public onlyIssuer {
        contractAllowed[_contract] = true;
        emit contractAllowedEvent(_contract, true);
    }

    /**
     * @notice Disallows a contract from using compensation functions. Can only be called by the issuer.
     * @param _contract The contract address to disallow.
     */
    function disallowContract(address _contract) public onlyIssuer {
        contractAllowed[_contract] = false;
        emit contractAllowedEvent(_contract, false);
    }

    /**
     * @notice Checks if a contract is allowed to use compensation functions.
     * @param _contract The contract address to check.
     * @return bool Returns true if the contract is allowed, otherwise false.
     */
    function isAllowedContract(address _contract) public view returns (bool) {
        return contractAllowed[_contract];
    }

    /*******************************************************************************************************
     * RECEIVE AND TRANSFER FUNCTION
     *****************************************************************************************************/

    /**
     * @notice Receives Ether and increases the contract balance.
     */
    receive() external payable {
        emit balanceIncreasedEvent(msg.value, address(this).balance);
    }

    /**
     * @notice Gets the current balance of the contract.
     * @return uint256 The balance of the contract.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Transfers all funds to a specified address. Can only be called by the issuer.
     * @notice Does not need reentrancy protection as it will send all funds by a single transfer.
     * @param _to The recipient address.
     */
    function transferAllFunds(address _to) public onlyIssuer {
        if (_to == address(0)) {
            revert addressZeroNotAllowed();
        }

        uint256 funds = address(this).balance;

        // No need for extra reentrancy protection as it will send all funds
        payable(_to).transfer(address(this).balance);
        emit balanceDecreasedEvent(funds, 0);
    }

    /**
     * @notice Compensates a specified address with a given amount. Only allowed contracts can call this function.
     * @notice Does not need reentrancy protection as it only pays to EOAs.
     * @param _to The recipient address.
     * @param _minAmount The minuimum amount recipient must have.
     */
    function compense(
        address _to,
        uint256 _minAmount
    ) public onlyAllowedContract whenNotPaused {
        if (_to == address(0)) {
            revert addressZeroNotAllowed();
        }

        uint256 userBalance = address(_to).balance;
        if (userBalance < _minAmount) {
            uint256 _amount = _minAmount - userBalance;

            if (_amount > address(this).balance) {
                revert NotEnoughFunds(address(this).balance, _amount);
            }

            //Check if the address is a contract
            // Only pay to EOAs
            uint256 codeSize;
            assembly {
                codeSize := extcodesize(_to)
            }

            if (codeSize == 0) {
                // No need for extra reentrancy protection as at this point _to will be always an EOA
                // Not need to use call(..) as _to is always an EOA
                //                (bool success, ) = _to.call{value: _amount, gas:23000}(""); 
                payable(_to).transfer(_amount); // This function is secure and fully compatible with EIP-1884
                
                emit paymentEvent(_to, _amount);
                emit balanceDecreasedEvent(_amount, address(this).balance);
            } else {
                emit notPaymentEvent(_to);
            }
        } else {
            emit notPaymentEvent(_to);
        }
    }

    /***
     * EIP-165 Interface
     *  */ 

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return interfaceId == type(izICompensation).interfaceId;
    }
}
