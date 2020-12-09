pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/AccessControl.sol";
import './Node.sol';

contract HeadNode is AccessControl {

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
  address[] public nodes;
  mapping (address => bool) public isNode;

  IERC20 public tokenEFD;
  string private _name;
  address private _headNode;  //headNode é ElFederal

  constructor(address tokenEFDAddress_, address admin_, string memory name_) public {
    _name = name_;
    tokenEFD = IERC20(tokenEFDAddress_);
    _headNode = msg.sender;
    
    _setupRole(ADMIN_ROLE, admin_);
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  modifier onlyAdmin() {
    require(hasRole(ADMIN_ROLE, msg.sender), "only Admin");
      _;
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

  event CreateNode (address indexed _address, address indexed _headAddress, address indexed _admin, string _name);

  function createNode (address admin_, string memory name_) public onlyAdmin returns (address) {
    Node node = new Node(address(tokenEFD), admin_, name_);
    nodes.push(address(node));
    isNode[address(node)] = true;
    emit CreateNode(address(node), address(this), admin_, name_);
    //tokenEFD.transfer (address(node), 50);
    return address(node);
  }

  function listNodes () public view returns (address[] memory) {
    return nodes;
  }

  function addAdminNode (address _node, address _admin) public returns (bool) {
    //Can be called only by the account defined in constructor: DEFAULT_ADMIN_ROLE
    Node node = Node(_node);
    node.grantRole(ADMIN_ROLE, _admin);
    return true;
  }

  function removeAdminNode (address _node, address _admin) public returns (bool) {
    //Can be called only by the account defined in constructor: DEFAULT_ADMIN_ROLE
    Node node = Node(_node);
    node.revokeRole(ADMIN_ROLE, _admin);
    return true;
  }

  //Send token from HeadNode to Node
  function send(address _to, uint256 _value) public onlyAdmin returns (bool) {
    require(isNode[_to], "To is not a node");
    require (tokenEFD.transfer (_to, _value), "error sending");
    return true;
  } 
}
