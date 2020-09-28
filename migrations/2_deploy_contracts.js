const ElFederal = artifacts.require("ElFederal");

module.exports = async (deployer, network, accounts)=> {
  const Admin1 = accounts[1];
  const Admin2 = accounts[2];
  const Admin3 = accounts[3];
  const Admin4 = accounts[4];
  
  //elFederal = await deployer.deploy(ElFederal, {from: accounts[0]});
  await deployer.deploy(ElFederal, Admin1, Admin2, Admin3, Admin4, {from: accounts[0]});
  elFederal = await ElFederal.deployed();
  console.log("ElFederal: " + elFederal.address);
  console.log("TokenEFD: " + await elFederal.tokenEFD());
};
