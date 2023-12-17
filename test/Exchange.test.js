const { should } = require("chai");
const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract(
  "ERC20 Token Exchange Test",
  ([deployer, feeAccount, etherUser, tokenUser]) => {
    let exchange;
    let token;
    const feePercentage = 10;

    beforeEach(async () => {
      exchange = await Exchange.new(feeAccount, feePercentage);
      token = await Token.new(100000000000);
    });

    describe("Exchange deployment", () => {
      it("Test the fee account", async () => {
        const account = await exchange.feeAccount();
        account.toString().should.equal(feeAccount);
      });

      it("Test the fee percentage", async () => {
        const percentage = await exchange.feePercentage();
        percentage.toString().should.equal(feePercentage.toString());
      });
    });

    describe("Deposit Ether", async () => {
      let result;
      let depositAmount;

      beforeEach(async () => {
        depositAmount = 100;
        result = await exchange.depositEther({
          from: etherUser,
          value: depositAmount,
        });
      });

      it("Test on Ether deposit", async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, etherUser);
        balance.toString().should.equal(depositAmount.toString());
      });

      it("Test on Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");

        const args = log.args;
        args._token.should.equal(ETHER_ADDRESS);
        args._owner.should.equal(etherUser);
        args._amount.toString().should.equal(depositAmount.toString());
        args._balance.toString().should.equal(depositAmount.toString());
      });
    });

    describe("Withdraw Ether", async () => {
      let result;
      let depositAmount;
      let withdrawAmount;

      beforeEach(async () => {
        depositAmount = 100;
        withdrawAmount = depositAmount;
        result = await exchange.depositEther({
          from: etherUser,
          value: depositAmount,
        });
      });

      describe("success", async () => {
        beforeEach(async () => {
          result = await exchange.withdrawEther(withdrawAmount, {
            from: etherUser,
          });
        });

        it("Test on Ether withdraw", async () => {
          const balance = await exchange.tokens(ETHER_ADDRESS, etherUser);
          balance.toString().should.equal("0");
        });

        it("Test on Ether Withdraw event", async () => {
          const log = result.logs[0];
          log.event.should.equal("Withdraw");

          const args = log.args;
          args._token.should.equal(ETHER_ADDRESS);
          args._owner.should.equal(etherUser);
          args._amount.toString().should.equal(withdrawAmount.toString());
          args._balance.toString().should.equal("0");
        });
      });

      describe("failure", async () => {
        it("Test withdraw with insuffient balance", async () => {
          const overWithdrawAmount = withdrawAmount + 1;
          await exchange.withdrawEther(overWithdrawAmount, { from: etherUser })
            .should.be.rejected;
        });
      });
    });

    describe("Deposit Token", async () => {
      let result;
      let depositToken;

      beforeEach(async () => {
        depositToken = 100;
        await token.transfer(tokenUser, depositToken, { from: deployer });
        await token.approve(exchange.address, depositToken, {
          from: tokenUser,
        });
        result = await exchange.depositToken(token.address, depositToken, {
          from: tokenUser,
        });
      });

      it("Test on Token deposit", async () => {
        const balance = await exchange.tokens(token.address, tokenUser);
        balance.toString().should.equal(depositToken.toString());
      });

      it("Test on Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");

        const args = log.args;
        args._token.should.equal(token.address);
        args._owner.should.equal(tokenUser);
        args._amount.toString().should.equal(depositToken.toString());
        args._balance.toString().should.equal(depositToken.toString());
      });
    });

    describe("Withdraw Token", async () => {
      let result;
      let depositAmount;
      let withdrawAmount;

      beforeEach(async () => {
        depositAmount = 100;
        withdrawAmount = depositAmount;
        await token.transfer(tokenUser, depositAmount, { from: deployer });
        await token.approve(exchange.address, depositAmount, {
          from: tokenUser,
        });
        await exchange.depositToken(token.address, depositAmount, {
          from: tokenUser,
        });
      });

      describe("success", async () => {
        beforeEach(async () => {
          result = await exchange.withdrawToken(token.address, withdrawAmount, {
            from: tokenUser,
          });
        });

        it("Test on Token withdraw", async () => {
          const balance = await exchange.tokens(token.address, tokenUser);
          balance.toString().should.equal("0");
        });

        it("Test on Ether Withdraw event", async () => {
          const log = result.logs[0];
          log.event.should.equal("Withdraw");

          const args = log.args;
          args._token.should.equal(token.address);
          args._owner.should.equal(tokenUser);
          args._amount.toString().should.equal(withdrawAmount.toString());
          args._balance.toString().should.equal("0");
        });
      });

      describe("failure", async () => {
        it("Test withdraw with insuffient balance", async () => {
          const overWithdrawAmount = withdrawAmount + 1;
          await exchange.withdrawEther(overWithdrawAmount, { from: tokenUser })
            .should.be.rejected;
        });
      });
    });

    describe("Check Balance", async () => {
      let depositToken;
      let depositEther;

      beforeEach(async () => {
        depositEther = 100;
        depositToken = 100;
        await exchange.depositEther({
          from: etherUser,
          value: depositEther,
        });
        //all actions required wait keyword
        await token.transfer(tokenUser, depositToken, { from: deployer });
        await token.approve(exchange.address, depositToken, {
          from: tokenUser,
        });
        await exchange.depositToken(token.address, depositToken, {
          from: tokenUser,
        });
      });

      describe("check balance", async () => {
        it("Test on Ether balance", async () => {
          const balance = await exchange.balanceOf(ETHER_ADDRESS, etherUser);
          balance.toString().should.equal(depositEther.toString());
        });

        it("Test on Token balance", async () => {
          const balance = await exchange.balanceOf(token.address, tokenUser);
          balance.toString().should.equal(depositToken.toString());
        });
      });
    });
  }
);
