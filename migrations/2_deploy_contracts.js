const ElFederal = artifacts.require("ElFederal");

module.exports = async (deployer, network, accounts)=> {

  //const Admins = ["0x097FCc9f904a49B6DbdA52928A0c5e81CF6906E2", "0xef5806cc58CAfe1d96aC31E7943ecdb01D59dA49", "0x05cdcD389B102ee1B7EdfB6eBcF89D9Bb7FE34dc", "0xA93fd284F864A78bF1c89575B5d02B2299A9F1F9"]
  //await deployer.deploy(ElFederal, Admins, 2, {from: accounts[0]});
  
  await deployer.deploy(ElFederal, [], 2, {from: accounts[0]});
  elFederal = await ElFederal.deployed();
  console.log("ElFederal: " + elFederal.address);
  console.log("TokenEFD: " + await elFederal.tokenEFD());

};
