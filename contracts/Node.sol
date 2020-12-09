pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Node is AccessControl {

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  bytes32 public constant WHITELIST_ROLE = keccak256("WHITELIST_ROLE");

  IERC20 public tokenEFD;
  string private _name;
  address private _headNode;

  constructor(address tokenEFDAddress_, address admin_, string memory name_) public {
    _name = name_;
    tokenEFD = IERC20(tokenEFDAddress_);
    _headNode = msg.sender;
    
    _setupRole(ADMIN_ROLE, admin_);
    _setRoleAdmin(WHITELIST_ROLE, ADMIN_ROLE);  //Quem controla WHITELIST_ROLE é quem esta em ADMIN_ROLE
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);  //msg.sender (Headnode) pode adicionar / remover admins
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function headNode() public view returns (address) {
    return _headNode;
  }

  function tokenBalance() public view returns (uint256) {
    return tokenEFD.balanceOf(address(this));
  }

  //grantRole(WHITELIST_ROLE, _account);  //Only who are in ADMIN_ROLE

  //Send token from Node 
  function send(address _to, uint256 _value) public returns (bool)  {
    require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not admin");
    require(hasRole(WHITELIST_ROLE, _to), "To is not whitelisted");
    require (tokenEFD.transfer (_to, _value), "error sending");
    return true;
  }

}
