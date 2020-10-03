pragma solidity 0.5.4;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import './TokenEFD.sol';

contract ElFederal is Ownable {
    TokenEFD public tokenEFD;

    uint8 public required;
    mapping (address => uint256) public approvedValue;
    mapping (address => address[]) public approvedBy;
    
    uint constant public MAX_ADMIN_COUNT = 10;
    uint public adminCount;

    event Approved(address indexed to, uint256 value, uint256 count);
    event Revoked(address indexed to, uint256 count);
    event RequirementChanged(uint8 oldRequired, uint8 newRequired);

    constructor (address[] memory _admins, uint8 _required) public  {
       string memory name = "El Federal";
       string memory symbol = "EFD";
       uint8 decimals = 2;
       uint256 totalSupply = 4000000000000000;
       tokenEFD = new TokenEFD(name, symbol, decimals, totalSupply);       
       required = _required;
       tokenEFD.addWhitelisted(address(this));
       addWhitelistAdmin(msg.sender);
        for (uint i=0; i<_admins.length; i++) {
            addWhitelistAdmin(_admins[i]);
        }
    }

    modifier notNull(address _address) {
        require(_address != address(0x0));
        _;
    }

    modifier validRequirement(uint _adminCount, uint _required) {
        require(_adminCount <= MAX_ADMIN_COUNT
            && _required <= _adminCount
            && _required != 0
            && _adminCount != 0, "invalid require");
        _;
    }    

    modifier onlyWhitelistAdmin() {
        require(tokenEFD.isWhitelistAdmin(_msgSender()), "WhitelistAdminRole: caller does not have the WhitelistAdmin role");
        _;
    }    

    modifier notApproved(address account) {
        bool approved = false;
        for (uint i=0; i<approvedBy[account].length; i++) {
            if (approvedBy[account][i] == msg.sender) {
                approved = true;
            }
        }
        require(!approved, "already approved");
        _;
    }

    modifier notOwner(address account) {
        require(account != owner(), "is owner");
        _;
    }

    //Approvals
    function getApprove(address _address) public view returns (uint256, uint256) {
        return (approvedValue[_address], approvedBy[_address].length);
    }

    function approve(address _to, uint256 _value) public onlyWhitelistAdmin notApproved(_to) {
        if (approvedValue[_to] == 0) {
               approvedValue[_to] = _value;
        }
        require (approvedValue[_to] == _value, "different value");
        approvedBy[_to].push(msg.sender);
        emit Approved (_to, _value, approvedBy[_to].length);
        
        if (approvedBy[_to].length >= required) {
            send(_to, _value);
            clearApprove(_to);
        }
    }

    function revoke(address _to) public onlyWhitelistAdmin {
        uint256 indexToDelete = 0;
        bool approved = false;
        for (uint i=0; i<approvedBy[_to].length; i++) {
            if (approvedBy[_to][i] == msg.sender) {
                indexToDelete = i;
                approved = true;
                break;
            }
        }
        require(approved, "not approved");
        address addressToMove = approvedBy[_to][approvedBy[_to].length-1];
        approvedBy[_to][indexToDelete] = addressToMove;
        approvedBy[_to].length--;

        if (approvedBy[_to].length == 0) {
               approvedValue[_to] = 0;
        }
        emit Revoked (_to, approvedBy[_to].length);
    }

    function clearApprove(address _to) internal {
       approvedValue[_to] = 0;
       approvedBy[_to].length = 0;
    }
    
    //Send token from tresury
    function send(address _to, uint256 _value) internal returns (bool)  {
        if (!tokenEFD.isWhitelisted(_to)) {
            tokenEFD.addWhitelisted(_to);
        }
        require (tokenEFD.transfer (_to, _value), "error sending");
        return true;
    }
    
    //Whitelist
    function addWhitelist(address[] memory _addresses) public 
        onlyWhitelistAdmin
    {
       for (uint256 i = 0; i < _addresses.length; i++) {
           if (!tokenEFD.isWhitelisted(_addresses[i]) && _addresses[i] != address(0x0)) {
                tokenEFD.addWhitelisted(_addresses[i]);
           }
       }            
    }    

    function removeWhitelist(address[] memory _addresses) public onlyWhitelistAdmin {
       for (uint256 i = 0; i < _addresses.length; i++) {
           if (tokenEFD.isWhitelisted(_addresses[i]))
                tokenEFD.removeWhitelisted(_addresses[i]);
       }            
    }
    
    //Owner admin
    function changeRequirement(uint8 _required) public onlyOwner
        validRequirement(adminCount, _required)
    {
        uint8 oldRequired = required; 
        required = _required;
        emit RequirementChanged(oldRequired, required);
    }    

    function renounceOwnership() public onlyOwner {
        revert ("Owner cannot renounce, can be only transfered");
    }

    function transferOwnership(address newOwner) public onlyOwner notNull(newOwner) {
        address oldOwner = owner();
        if (!tokenEFD.isWhitelistAdmin(newOwner)) {
            addWhitelistAdmin(newOwner);
        }        
        _transferOwnership(newOwner);
        tokenEFD.removeWhitelistAdmin(oldOwner);
        adminCount--;
    }
    
    function addWhitelistAdmin(address account) public onlyOwner notNull(account) {
        require (adminCount < MAX_ADMIN_COUNT, "max count admin");
        tokenEFD.addWhitelistAdmin(account);
        adminCount++;        
    }
    
    function removeWhitelistAdmin (address account) public onlyOwner 
        notOwner(account) 
        validRequirement(adminCount-1, required)
    {
        tokenEFD.removeWhitelistAdmin(account);
        adminCount--;
    }

    function pauseToken() public onlyOwner {
        tokenEFD.pause();
    }

    function unpauseToken() public onlyOwner {
        tokenEFD.unpause();
    }    
}