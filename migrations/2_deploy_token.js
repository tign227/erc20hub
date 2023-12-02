const TGNToken = artifacts.require("TGNToken");

module.exports = async function (deployer) {
  const initialSupply = 100; // 传入的参数值
  await deployer.deploy(TGNToken, initialSupply, { gas: 5000000 });
};
