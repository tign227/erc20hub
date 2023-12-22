const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  await deployer.deploy(Token, initialSupply);

  const accounts = await web3.eth.getAccounts();
  const feeAccount = accounts[0];
  const feePercentage = 1;
  await deployer.deploy(Exchange, feeAccount, feePercentage);
};
