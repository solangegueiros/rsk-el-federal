pragma solidity 0.5.4;

import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/access/roles/WhitelistedRole.sol';

contract TokenEFD is Ownable, ERC20Pausable, ERC20Detailed, WhitelistedRole {

    constructor (
        string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply)
        ERC20Detailed(_name, _symbol, _decimals) public {
            _mint (msg.sender, _totalSupply);
    }

    function transfer(address recipient, uint256 amount) public onlyWhitelisted returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public onlyWhitelisted returns (bool) {
    }

    function addWhitelistAdmin(address account) public onlyOwner {
        _addWhitelistAdmin(account);
    }

    function removeWhitelistAdmin (address account) external onlyOwner {
        _removeWhitelistAdmin(account);
    }

    function renounceWhitelistAdmin () public {
        revert("can not renounce, controlled by owner");
    }
}


