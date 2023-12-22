const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

const ether = (n) => {
  return n;
};
const tokens = (n) => ether(n);

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();

    const token = await Token.deployed();
    console.log("Fetch Token from ganache. Address is ", token.address);

    const exchange = await Exchange.deployed();
    console.log("Fetch Exchange from ganache. Address is ", exchange.address);

    //fee account
    const feeAccount = accounts[0];

    //Set up exchange users
    const Tom = accounts[1];
    const Bob = accounts[2];

    //Tom has 100 ethers
    amount = ether(100);
    //Tom deposit ether
    await exchange.depositEther({ from: Tom, value: amount });
    console.log(`Deposited ${amount.toString()} Ethers from ${Tom}`);

    amount = tokens(100);
    //feeAccount transfe to Bob 100 token
    await token.transfer(Bob, amount, { from: feeAccount });
    // Bob approves Tokens
    await token.approve(exchange.address, amount, { from: Bob });
    console.log(`Approved ${amount.toString()} tokens from ${Bob}`);
    // Bob deposits Tokens
    await exchange.depositToken(token.address, amount, { from: Bob });
    console.log(`Deposited ${amount.toString()} tokens from ${Bob}`);

    // Tom makes order to get tokens
    let result;
    let orderId;
    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ether(1),
      { from: Tom }
    );
    console.log(`Make order from ${Tom}`);
    orderId = result.logs[0].args._id;
    await exchange.cancelOrder(orderId, { from: Tom });
    console.log(`Cancelled order from ${Tom}`);

    // Tom makes order
    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ether(1),
      { from: Tom }
    );
    console.log(`Make order from ${Tom}`);

    // Bob fills order with token
    orderId = result.logs[0].args._id;
    await exchange.fillOrder(orderId, { from: Bob });
    console.log(`Filled order from ${Bob}`);

    await wait(1);

    // Tom makes another order
    result = await exchange.makeOrder(
      token.address,
      tokens(50),
      ETHER_ADDRESS,
      ether(1),
      { from: Tom }
    );
    console.log(`Make order from ${Tom}`);

    // Bob fills another order
    orderId = result.logs[0].args._id;
    await exchange.fillOrder(orderId, { from: Bob });
    console.log(`Filled order from ${Bob}`);

    await wait(1);

    // Tom makes final order
    result = await exchange.makeOrder(
      token.address,
      tokens(200),
      ETHER_ADDRESS,
      ether(1),
      { from: Tom }
    );
    console.log(`Make order from ${Tom}`);

    // Bob fills final order
    orderId = result.logs[0].args._id;
    await exchange.fillOrder(orderId, { from: Bob });
    console.log(`Filled order from ${Bob}`);

    await wait(1);

    // Tom makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        token.address,
        tokens(10 * i),
        ETHER_ADDRESS,
        ether(1),
        { from: Tom }
      );
      console.log(`Make order from ${Tom}`);
      await wait(1);
    }

    // Bob makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        ETHER_ADDRESS,
        ether(1),
        token.address,
        tokens(10 * i),
        { from: Bob }
      );
      console.log(`Make order from ${Bob}`);
      await wait(1);
    }

    console.log("=====================All Set=====================");
  } catch (error) {
    console.error(error);
  }

  callback();
};
