// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./standards/IERC1644.sol";
import "./standards/IERC1594.sol";
import "./constants.sol";
import "./compensation/izICompensation.sol";
import "./izTokenStorage.sol";

/**
    @title SSITIZENS token contract
    @author Izertis
 */
contract izToken is
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable,
    IERC1644,
    IERC1594,
    izTokenStorage
    {

    event transferWithDataEvent(address from, address to, uint value, bytes data);
    event changeIssuerEvent(address oldIssuer, address newIssuer);
    event PartyUpdated(address indexed user, uint8 permission, uint256 expiration,bytes attachedData);
    event PartyRemoved(address indexed user);
    event MinimumTransferChanged(uint256 oldMinimumTransfer, uint256 newMinimumTransfer);
    event MinimumUserBalanceChanged(uint256 oldMinimumUserBalance, uint256 newMinimumUserBalance);
    event CompensationContractChanged(address oldCompensationContract, address newCompensationContract);

    event partialExecution(uint256 currentIndex);
    event executionComplete();

    error UnauthorizedAddress(address _address);
    error ArraysLengthMismatch(uint256 addressesLength, uint256 valuesLength);

    modifier onlyIssuer(){
        if(_msgSender() != issuer){
            revert UnauthorizedAddress(_msgSender());
        }
        _;
    }

    modifier onlyOwnerOrIssuer(){
         if(_msgSender() != issuer && _msgSender() != owner()){
            revert UnauthorizedAddress(_msgSender());
        }
        _;
    }


   /**************************************************************************
     *  PROXY FUNCTIONS
    **************************************************************************/

    /**
     * @dev Initializes the contract with the given owner, issuer, name, and symbol.
     * This function sets up the contract by initializing inherited modules and setting the issuer.
     * Can only be called once due to the `initializer` modifier.
     * @param _owner Address of the contract owner.
     * @param _issuer Address of the issuer.
     * @param _name Name of the token.
     * @param _symbol Symbol of the token.
     */
    function initialize(
        address _owner, 
        address _issuer, 
        string memory _name, 
        string memory _symbol, 
        uint256 _minimumTransfer, 
        uint256 _minimumUserBalance,
        address _compensationContract)  public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Burnable_init();
        __Ownable_init(_owner);
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        require(IERC165(_compensationContract).supportsInterface(type(izICompensation).interfaceId), 
         "Invalid compensation contract");
        issuer = _issuer;
        minimumTransfer = _minimumTransfer;
        minimumUserBalance=_minimumUserBalance;
        compensationContract = _compensationContract;

    }

    function _authorizeUpgrade(address _address) internal override onlyOwner {}


    
   /**************************************************************************
     *  GOVERNANCE FUNCTIONS
    **************************************************************************/

    /**
     * @dev Changes the issuer of the token.
     * Only the contract owner can call this function.
     * @param _newIssuer Address of the new issuer.
     */
    function changeIssuer(address _newIssuer) external onlyOwner {
        require(_newIssuer != address(0), "Invalid address");
        address oldIssuer = issuer;
        issuer = _newIssuer;
        emit changeIssuerEvent(oldIssuer,issuer);
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

    /**
     * @dev Sets the minimum amount of tokens that can be transferred.
     * @param _minimumTransfer Minimum amount of tokens that can be transferred.º
     */
    function setMinimumTransfer(uint256 _minimumTransfer) external onlyIssuer {
        uint256 oldMinimumTransfer = minimumTransfer;
        minimumTransfer = _minimumTransfer;
        emit MinimumTransferChanged(oldMinimumTransfer, minimumTransfer);
    }

    /**
     * @dev Sets the minimum amount of tokens that a user must have in order to be able to transfer tokens.
     * @param _minimumUserBalance Minimum amount of tokens that a user must have in order to be able to transfer tokens.
     */
    function setMinimumUserBalance(uint256 _minimumUserBalance) external onlyIssuer {
        uint256 oldMinimumUserBalance = minimumUserBalance;
        minimumUserBalance = _minimumUserBalance;
        emit MinimumUserBalanceChanged(oldMinimumUserBalance, minimumUserBalance);
    }

    /**
     * @dev Sets the address of the compensation contract.
     * @param _compensationContract Address of the compensation contract.
     */
    function setCompensationContract(address _compensationContract) external onlyOwnerOrIssuer {
        require(_compensationContract != address(0), "Invalid address");
        require(IERC165(_compensationContract).supportsInterface(type(izICompensation).interfaceId), 
         "Invalid compensation contract");
        address oldCompensationContract = compensationContract;
        compensationContract = _compensationContract;
        emit CompensationContractChanged(oldCompensationContract, compensationContract);
    }

    /**************************************************************************
    *  KyC MANAGEMENT
    **************************************************************************/

    /**
     * @dev Adds a party (user) with specific permissions and an expiration timestamp.
     * Only the issuer can call this function.
     * Emits a `PartyUpdated` event.
     * @param _user Address of the party.
     * @param _permission Permission level assigned to the party.
     * @param _expiration Expiration timestamp of the party's permission.
    */
    function addParty(address _user, uint8 _permission, uint256 _expiration, bytes memory _attachedData) external onlyIssuer {
        require(_user != address(0), "Invalid address");
        require(_expiration > block.timestamp, "Expiration must be in the future");
        require(parties[_user].permission == 0 || parties[_user].permission == _permission, "Party already registered with different permission");
        
        parties[_user] = party(_permission, _expiration,_attachedData);
        emit PartyUpdated(_user, _permission, _expiration,_attachedData);
    }

    /**
     * @dev Removes a party (user) from the system.
     * Only the issuer can call this function.
     * Emits a `PartyRemoved` event.
     * @param _user Address of the party to be removed.
     */
    function removeParty(address _user) external onlyIssuer {
        require(parties[_user].permission != 0, "Party not registered");
        delete parties[_user];
        emit PartyRemoved(_user);
    }

    /**
     * @dev Retrieve party's permission
     * @notice Returns 0 if party has no permission or if the permission has expired. 
     * @param _user Address of the user.
     * @param timestamp Timestamp to check for permission validity.
     * @return The permission level of the user at the given timestamp.
     */
    function partyPermission(address _user, uint256 timestamp) external view returns (uint8) {
        return (parties[_user].expiration >= timestamp ? parties[_user].permission : 0x00);
    }


    /**
     * @dev Retrieve party's expiration
     * @param _user Address of the user.
     * @return The expiration timestamp of the user.
     */
    function getAttachedData(address _user) external view returns (bytes memory) {
        return parties[_user].attachedData;
    }


    /**************************************************************************
    *  ERC-1644 FUNCTIONS
    **************************************************************************/

    /**
     * @dev Checks if the token contract is controllable.
     * Always returns `true` since the token will be allwais controlled.
     * @return `true`, indicating the contract is controllable.
     */
    function isControllable() external pure override returns (bool) {
        return true;
    }

    /**
     * @dev Allows the issuer to force transfer tokens between accounts.
     * @notice this operation ignores the permissions and expiration of the parties.
     * @notice Does not compensate to user.
     * Only the issuer can call this function.
     * Emits a `ControllerTransfer` event.
     * @param _from Address of the sender.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to transfer.
     * @param _data Additional data.
     * @param _operatorData Additional operator data.
     */
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) external override onlyIssuer {
        _transfer(_from, _to, _value);
        emit ControllerTransfer(_msgSender(), _from, _to, _value, _data, _operatorData);
    }

    /**
     * @dev Allows the issuer to forcefully redeem (burn) tokens from an account.
     * @notice This operation ignores the permissions and expiration of the parties.
     * @notice Does not compensate to user.
     * Only the issuer can call this function.
     * Emits a `ControllerRedemption` event.
     * @param _tokenHolder Address of the token holder.
     * @param _value Amount of tokens to redeem.
     * @param _data Additional data.
     * @param _operatorData Additional operator data.
     */
    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) external override onlyIssuer {
        _burn(_tokenHolder, _value);
        emit ControllerRedemption(_msgSender(), _tokenHolder, _value, _data, _operatorData);
    }

    /**************************************************************************
    *  ERC-1594 FUNCTIONS
    **************************************************************************/

    /**
     * @dev Transfers tokens with additional data.
     * @notice This function compensates if user's balance bellow minimum balance
     * Can be paused.
     * Emits a `transferWithDataEvent`.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to transfer.
     * @param _data Additional transfer data.
     */
    function transferWithData(address _to, uint256 _value, bytes memory _data) external override whenNotPaused {
        _transferCheck(_msgSender(), _to, _value);
        emit transferWithDataEvent(_msgSender(),_to, _value, _data);

    }

    /**
     * @dev Transfers tokens on behalf of a sender with additional data.
     * @notice This function compensates if user's balance bellow minimum balance
     * Can be paused.
     * Emits a `transferWithDataEvent`.
     * @param _from Address of the sender.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to transfer.
     * @param _data Additional transfer data.
     */
    function transferFromWithData(address _from, address _to, uint256 _value, bytes memory _data) external override whenNotPaused {
        _transferCheck(_from, _to, _value);
        emit transferWithDataEvent(_from,_to, _value, _data);
    }

    /**
     * @dev Checks if new tokens can be issued.
     * Always issuable.
     * @return `true`, indicating that new tokens can be issued.
     */
    function isIssuable()  external pure override  returns (bool) {
        return true;
    }

      /**
    * @notice This function is not implemented
    */
    function issue(address , uint256 , bytes memory ) external pure override  {
      revert("Not implemented"); // Must be overriden as it is part of the ERC-1594 standard
    }


    /**
     * @dev Redeems tokens from the caller.
     * @notice This is equivalent to BURN tokens.
     * Can be paused.
     * Emits a `Redeemed` event.
     * @param _value Amount of tokens to redeem.
     * @param _data Additional redemption data.
     */
    function redeem(uint256 _value, bytes memory _data) external override whenNotPaused{
        _burnCheck(_msgSender(), _value, _data);
        emit Redeemed(_msgSender(), _msgSender(), _value, _data);
    }

    
    /**
     * @dev Redeems (burns) tokens from a specified address.
     * Can be paused.
     * Emits a `Redeemed` event.
     * @param _from Address of the token holder.
     * @param _value Amount of tokens to redeem.
     * @param _data Additional redemption data.
     */
    function redeemFrom(address _from, uint256 _value, bytes memory _data) external override whenNotPaused{
       _burnCheck(_from,_value,_data);
       emit Redeemed(_msgSender(), _from, _value, _data);
    }

    /**
     * @dev Checks if a transfer can occur between the sender and recipient.
     * @notice third parameter (data) is not used.
     * @param _to Recipient address.
     * @param _value Amount of tokens to transfer.
     * @return result Boolean indicating if the transfer is allowed.
     * @return resultCode Status code of the transfer.
     * @return A `bytes32` field (unused).
     */
    function canTransfer(address _to, uint256 _value, bytes memory)
        public view override returns (bool result, bytes1 resultCode, bytes32) {
         return _canTransferFrom(_msgSender(),_to,_value);
    }

    /**
     * @dev Checks if a transfer can occur between two specific addresses.
     * @notice third parameter (data) is not used.
     * @param _from Sender address.
     * @param _to Recipient address.
     * @param _value Amount of tokens to transfer.
     * @return result Boolean indicating if the transfer is allowed.
     * @return resultCode Status code of the transfer.
     * @return A `bytes32` field (unused).
     */
    function canTransferFrom(address _from, address _to, uint256 _value, bytes memory)
        public view override returns (bool result, bytes1 resultCode, bytes32) {
        return _canTransferFrom(_from,_to,_value);
    }

    /**************************************************************************
    *  AD-HOC FUNCTIONS
    **************************************************************************/

    /**
     * @dev Issues new tokens to the contract.
     * Emits an `Issued` event.
     * @param _value Amount of tokens to issue.
     * @param _data Additional issuance data.
     */
    function generate(uint256 _value, bytes memory _data) external onlyIssuer {
        _mint(address(this), _value);
        emit Issued(_msgSender(), address(this), _value, _data);
    }

    /**
     * @dev Distributes tokens to a specified address.
     * @notice This function compensates if user's balance bellow minimum balance
     * Emits an `Issued` event.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to distribute.
     * @param _data Additional distribution data.
     */
    function distribute(address _to, uint256 _value, bytes memory _data) external onlyIssuer {
        _transfer(address(this),_to,_value);
        _compense(_to);
        emit transferWithDataEvent(address(this), _to, _value, _data);
    }

     /**
     * @dev Perform several Distributes  to a specified addresses.
     * @notice This function compensates if each user's balance is bellow minimum balance
     * @notice This function will emit an event partialExecution if it runs out of gas and 
     * @notice provides the index of the last successful transfer. Then caller must exclure data
     * @notice processed and call again the function with the remaining data until excutionComplete event is emitted 
     * @notice (i.e. all data has been processed).
     * Emits an `Issued` event.
     * @param _to Addresses of the recipients.
     * @param _value Amounts of tokens to distribute.
     */
    function distributeBatch(address[] memory _to, uint256[] memory _value) external onlyIssuer {
        if(_to.length != _value.length){
            revert ArraysLengthMismatch(_to.length,_value.length);
        }
        for (uint256 i = 0; i < _to.length;) {
            _transfer(address(this),_to[i],_value[i]);
            _compense(_to[i]);
            emit transferWithDataEvent(address(this), _to[i], _value[i], "");
            // CONTROLLED TERMINATION IF RUNNIG OUT OF GAS
            if(gasleft() < MIN_GASLEFT){
                emit partialExecution(i);
                return;
            }
            
            unchecked { i++; }
        }
        emit executionComplete();
    }

    /**
     * @dev Emsures user has enough balance of crypto
     * @param _recipient Address of the recipient.
     */
    function compense(address _recipient) public onlyIssuer{
      _compense(_recipient);
    }

    /**************************************************************************
    *  ERC-20 OVERRIDED FUNCTIONS
    **************************************************************************/

    /**
     * @dev Transfers tokens if the transfer is allowed.
     * Can be paused.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to transfer.
     * @return `true` if the transfer is successful.
     */
    function transfer(address _to, uint256 _value) public override whenNotPaused returns (bool)  {
        _transferCheck(_msgSender(),_to,_value);
        return true;
    }

    /**
     * @dev Transfers tokens from one address to another if the transfer is allowed.
     * Can be paused.
     * @param _from Address of the sender.
     * @param _to Address of the recipient.
     * @param _value Amount of tokens to transfer.
     * @return `true` if the transfer is successful.
     */
    function transferFrom(address _from, address _to, uint256 _value) public override whenNotPaused returns (bool)  {
        _transferCheck(_from,_to,_value);
        return true;
    }


    // *******************************************************************************************************
    // Internal operations
    // *******************************************************************************************************
    function _transferCheck(address _from, address _to, uint256 _value) internal {
        (bool allowed,,) = canTransferFrom(_from, _to, _value,"");
        require(allowed,"CHECK:Transfer not allowed");
        if(_from == _msgSender()){
            super.transfer(_to,_value);    
        }else{
            super.transferFrom(_from,_to,_value); 
        }

         if(balanceOf(_from)> 0 ){
            _compense(_from);
        }
        _compense(_to);
    }

    function _burnCheck(address _from, uint256 _value, bytes memory) internal  {
        (bool allowed,,) = canTransferFrom(_from, address(0), _value,"");
        require(allowed,"CHECK:Burn not allowed");
        if(_from == _msgSender()){
            super.burn(_value);    
        }else{
            super.burnFrom(_from, _value); 
        }
        
        if(balanceOf(_from)> 0 ){
            _compense(_from);
        }
    }

    function _canTransferFrom(address _from, address _to, uint256 _value) internal view
        returns (bool, bytes1, bytes32) {

        if(_value < minimumTransfer){
            return (false,EIP1066_TRANSFER_FAILED,"");
        }

         // Transaction comes from allowed CITIZEN
         if(parties[_from].expiration > block.timestamp &&
            parties[_from].permission == ROLE_CITIZEN){
             if(parties[_to].expiration > block.timestamp &&
                parties[_to].permission == ROLE_MERCHANT){
                    return(true,EIP1066_SUCCESS,"");
            }
            return (false,EIP1066_TRANSFER_FAILED,"");
         }

        // Burn operation
         if(parties[_from].expiration > block.timestamp &&
            parties[_from].permission == ROLE_MERCHANT &&
            _to == address(0)){
                return(true,EIP1066_SUCCESS,"");
         }
        return (false,EIP1066_TRANSFER_FAILED,"");
    }

      function _compense(address _recipient) internal{
        require(_recipient != address(0), "Invalid address");
        izICompensation(compensationContract).compense(_recipient, minimumUserBalance);

    }

}
