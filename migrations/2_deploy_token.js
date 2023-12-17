const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  const initialSupply = 10000; // 传入的参数值
  await deployer.deploy(Token, initialSupply, { gas: 5000000 });
};
