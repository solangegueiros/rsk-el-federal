pragma solidity 0.5.2;

import '@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/access/roles/WhitelistedRole.sol';
import '@openzeppelin/contracts/access/roles/WhitelistAdminRole.sol';

contract TokenEFD is ERC20Mintable, ERC20Pausable, ERC20Detailed, WhitelistedRole {

    constructor (
        string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply)
        ERC20Detailed(_name, _symbol, _decimals) public {
               mint (msg.sender, _totalSupply);
    }

    function transfer(address recipient, uint256 amount) public onlyWhitelisted returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public onlyWhitelisted returns (bool) {
    }    

}


contract ElFederal is Ownable, WhitelistAdminRole {
    TokenEFD public tokenEFD;

    uint8 public minApproval;
    mapping (address => uint256) public approvedValue;
    mapping (address => uint256) public approvedCount;
    mapping (address => mapping (uint256 => bool)) public approvedStatus;
    mapping (address => uint256) public indexAdmins;
    address[] public admins;

    constructor (address admin01, address admin02, address admin03, address admin04) public  {
       string memory name = "El Federal";
       string memory symbol = "EFD";
       uint8 decimals = 2;
       uint256 totalSupply = 400;
       tokenEFD = new TokenEFD(name, symbol, decimals, totalSupply);
       addWhitelistAdmin(admin01);
       addWhitelistAdmin(admin02);
       addWhitelistAdmin(admin03);
       addWhitelistAdmin(admin04);
       indexAdmins[msg.sender] = admins.push(msg.sender) - 1;
       indexAdmins[admin01] = admins.push(admin01) - 1;
       indexAdmins[admin02] = admins.push(admin02) - 1;
       indexAdmins[admin03] = admins.push(admin03) - 1;
       indexAdmins[admin04] = admins.push(admin04) - 1;
       minApproval = 2;
    }

    //Approvals
    function getApprove(address _address) public view returns (uint256, uint256) {
        return (approvedValue[_address], approvedCount[_address]);
    }

    function approve(address _to, uint256 _value) public {        
        if (approvedValue[_to] == 0) {
               approvedValue[_to] = _value;
        }
        require (approvedValue[_to] == _value, "different value");
        uint256 index = indexAdmins[msg.sender];
        require (approvedStatus[_to][index] == false, "already approved");
        approvedStatus[_to][index] = true;
        approvedCount[_to] = approvedCount[_to] + 1;
        
        if (approvedCount[_to] >= minApproval) {
            send(_to, _value);
            clearApprove(_to);
        }
    }

    function revoke(address _to) public {
        uint256 index = indexAdmins[msg.sender];
        require (approvedStatus[_to][index], "not approved");
        approvedStatus[_to][index] = false;
        approvedCount[_to] = approvedCount[_to] - 1;
        if (approvedCount[_to] == 0) {
               approvedValue[_to] = 0;
        }
    }

    function clearApprove(address _to) internal {
       approvedCount[_to] = 0;
       approvedValue[_to] = 0;
       for (uint256 i = 0; i < admins.length; i++) {
           approvedStatus[_to][i] = false;
       }        
    }
    
    //Send token from tresury
    function send(address _to, uint256 _value) internal returns (bool)  {
       require (tokenEFD.transfer (_to, _value), "error sending");
       return true;
    }
    
    //Whitelist
    function addWhitelist(address[] memory _addresses) public {
       for (uint256 i = 0; i < _addresses.length; i++) {
           if (!tokenEFD.isWhitelisted(_addresses[i]))
                tokenEFD.addWhitelisted(_addresses[i]);
       }            
    }    

    function removeWhitelist(address[] memory _addresses) public {
       for (uint256 i = 0; i < _addresses.length; i++) {
           if (tokenEFD.isWhitelisted(_addresses[i]))
                tokenEFD.removeWhitelisted(_addresses[i]);
       }            
    }

    //TODO - Admins: add, remove, mininum

}


