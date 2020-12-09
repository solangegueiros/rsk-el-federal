pragma solidity 0.7.5;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";
//import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract TokenEFD is ERC20, ERC20Pausable, AccessControl {

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_) 
    public ERC20(name_, symbol_) {
      _setupDecimals(decimals_);
      _mint (msg.sender, totalSupply_);

      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
      _setupRole(PAUSER_ROLE, msg.sender);
  }

  modifier onlyPauserRole() {
    require(hasRole(PAUSER_ROLE, msg.sender), "must have pauser role to pause");
    _;
  }

  function pause() public onlyPauserRole {
    _pause();
  }

  function unpause() public onlyPauserRole {
    _unpause();
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Pausable) {
    super._beforeTokenTransfer(from, to, amount);
  }
  
}