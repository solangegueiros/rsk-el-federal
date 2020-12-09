pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/AccessControl.sol";
import './HeadNode.sol';

contract ElFederal is AccessControl {

  IERC20 public tokenEFD;
  bytes32 public constant FEDERAL_ADMIN_ROLE = keccak256("FEDERAL_ADMIN_ROLE");
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  address[] public headNodes;
  mapping (address => bool) public isHeadNode;
  
  uint8 public required;
  mapping (address => uint256) public approvedValue;
  mapping (address => address[]) public approvedBy;

  constructor (address tokenEFDAddress_, address[] memory admins_, uint8 required_) public  {
    tokenEFD = IERC20(tokenEFDAddress_);

    required = required_;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    for (uint i=0; i < admins_.length; i++) {
      _setupRole(FEDERAL_ADMIN_ROLE, admins_[i]);
    }
  }

  //Headnode
  event CreateHeadNode (address indexed _address, address indexed _elFederal, address indexed _admin, string _name);

  function createHeadNode (address admin_, string memory name_) public returns (address) {
    require(hasRole(FEDERAL_ADMIN_ROLE, msg.sender), "Caller is not Federal admin");
    HeadNode node = new HeadNode(address(tokenEFD), admin_, name_);
    headNodes.push(address(node));
    isHeadNode[address(node)] = true;
    emit CreateHeadNode(address(node), address(this), admin_, name_);
    //tokenEFD.transfer (address(node), 200);
    return address(node);
  }

  function listHeadNodes () public view returns (address[] memory) {
      return headNodes;
  }

  function addAdminNode (address _node, address _admin) public returns (bool) {
    //Can be called only by the account defined in constructor: DEFAULT_ADMIN_ROLE
    HeadNode node = HeadNode(_node);
    node.grantRole(ADMIN_ROLE, _admin);
    return true;
  }

  function removeAdminNode (address _node, address _admin) public returns (bool) {
    //Can be called only by the account defined in constructor: DEFAULT_ADMIN_ROLE
    HeadNode node = HeadNode(_node);
    node.revokeRole(ADMIN_ROLE, _admin);
    return true;
  }

  //Approvals
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

  event ApprovedSend(address indexed to, uint256 value, uint256 count);
  event RevokedSend(address indexed to, uint256 count);

  function getApprove(address _address) public view returns (uint256, uint256) {
    //amount and number of approvals
    return (approvedValue[_address], approvedBy[_address].length);
  }

  function approve(address _to, uint256 _value) public notApproved(_to) {
    require(hasRole(FEDERAL_ADMIN_ROLE, msg.sender), "Caller is not Federal admin");
    if (approvedValue[_to] != 0) {
      require (approvedValue[_to] == _value, "different value");
    }
    else {
      approvedValue[_to] == _value;
    }
    approvedBy[_to].push(msg.sender);
    emit ApprovedSend (_to, _value, approvedBy[_to].length);
    
    if (approvedBy[_to].length >= required) {
      send(_to, _value);
      clearApprove(_to);
    }
  }

  function revoke(address _to) public  {
    require(hasRole(FEDERAL_ADMIN_ROLE, msg.sender), "Caller is not Federal admin");
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
    approvedBy[_to].pop();

    if (approvedBy[_to].length == 0) {
      approvedValue[_to] = 0;
    }
    emit RevokedSend (_to, approvedBy[_to].length);
  }

  function clearApprove(address _to) internal {
    approvedValue[_to] = 0;
    delete approvedBy[_to];
  }

  //Send token from tresury
  function send(address _to, uint256 _value) public returns (bool)  {
    require(hasRole(FEDERAL_ADMIN_ROLE, msg.sender), "Caller is not Federal admin");
    require(isHeadNode[_to], "To is not a HeadNode");
    require (tokenEFD.transfer (_to, _value), "error sending");
    return true;
  } 

}