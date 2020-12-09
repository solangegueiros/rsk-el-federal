const TokenEFD = artifacts.require("TokenEFD");
const ElFederal = artifacts.require("ElFederal");
const HeadNode = artifacts.require("HeadNode");
const Node = artifacts.require("Node");

module.exports = async (deployer, network, accounts)=> {

  const totalSupply = 4000000000000000;

  const creator = accounts[0];
  const fedAdmin1 = accounts[1];
  const fedAdmin2 = accounts[2];
  const federalAdmins = [creator, fedAdmin1, fedAdmin2];
  //const federalAdmins = ["0x097FCc9f904a49B6DbdA52928A0c5e81CF6906E2", "0xef5806cc58CAfe1d96aC31E7943ecdb01D59dA49", "0x05cdcD389B102ee1B7EdfB6eBcF89D9Bb7FE34dc", "0xA93fd284F864A78bF1c89575B5d02B2299A9F1F9"]
  
  await deployer.deploy(TokenEFD, "El Federal", "FED1",  2,  totalSupply, {from: accounts[0]});
  tokenEFD = await TokenEFD.deployed();
  console.log("TokenEFD: " + tokenEFD.address);
  console.log("\n");

  await deployer.deploy(ElFederal, tokenEFD.address, federalAdmins, 2, {from: accounts[0]});
  elFederal = await ElFederal.deployed();
  console.log("elFederal: " + elFederal.address);
  console.log("\n");
  tokenEFD.transfer(elFederal.address, totalSupply, {from: accounts[0]});  
};
