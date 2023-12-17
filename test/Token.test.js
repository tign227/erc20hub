const { should } = require("chai");

const Token = artifacts.require("Token");

require("chai").use(require("chai-as-promised")).should();

contract("TGNToken ERC20 Token Test", ([owner, receiver, exchange]) => {
  let token;
  let totalSupply = 10000;

  beforeEach(async () => {
    token = await Token.new(totalSupply);
  });

  describe("Token deployment", () => {
    it("Test name", async () => {
      const name = await token.name();
      name.should.equal("Tign");
    });
    it("Test symbol", async () => {
      const symbol = await token.symbol();
      symbol.should.equal("TGN");
    });
    it("Test decimal", async () => {
      const decimals = await token.decimals();
      decimals.toString().should.equal("18");
    });
    it("Test name", async () => {
      const totalSupply = await token.totalSupply();
      totalSupply.toString().should.equal("10000");
    });
    it("Test balance of owner", async () => {
      const balance = await token.balanceOf(owner);
      balance.toString().should.equal("10000");
    });
  });

  describe("Transfer token", () => {
    let transferAmount = 1000;
    let result;

    describe("success", () => {
      beforeEach(async () => {
        result = await token.transfer(receiver, transferAmount, {
          from: owner,
        });
      });

      it("Test transfer token balance", async () => {
        let balanceOfOwner = await token.balanceOf(owner);
        balanceOfOwner
          .toString()
          .should.equal((totalSupply - transferAmount).toString());

        let balanceOfReceiver = await token.balanceOf(receiver);
        balanceOfReceiver.toString().should.equal(transferAmount.toString());
      });

      it("Test emit transfer event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");
        const args = log.args;
        args.from.toString().should.equal(owner, "from is correct");
        args.to.toString().should.equal(receiver, "to is correct");
        args.value
          .toString()
          .should.equal(transferAmount.toString(), "amount is correct");
      });
    });

    describe("failure", () => {
      it("Test insufficient balances", async () => {
        let invalidAmount = "1000000000";
        token.transfer(receiver, invalidAmount, { from: owner }).should.be
          .rejected;

        invalidAmount = "1";
        token.transfer(receiver, invalidAmount, { from: receiver }).should.be
          .rejected;
      });

      it("Test invalid receipients", async () => {
        token.transfer(0x0, transferAmount, { from: owner }).should.be.rejected;
      });
    });
  });

  describe("Approve token", () => {
    let result;
    let approveAmount;

    beforeEach(async () => {
      approveAmount = 100;
      result = await token.approve(exchange, approveAmount, { from: owner });
    });

    describe("success", () => {
      it("Test allowance of exchage", async () => {
        const allowance = await token.allowance(owner, exchange);
        allowance.toString().should.equal(approveAmount.toString());
      });

      it("Test Approval event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Approval");
        const args = log.args;
        args.owner.toString().should.equal(owner);
        args.spender.toString().should.equal(exchange);
        args.value.toString().should.equal(approveAmount.toString());
      });
    });

    describe("failure", () => {
      it("Test invalid spender", async () => {
        await token.approve(0x0, approveAmount, { from: owner }).should.be
          .rejected;
      });
    });
  });

  describe("Delegated transfer token", () => {
    let result;
    let approveAmount;
    let transferAmount;
    beforeEach(async () => {
      approveAmount = 100;
      transferAmount = 99;
      await token.approve(exchange, approveAmount, { from: owner });
    });

    describe("sucess", () => {
      beforeEach(async () => {
        result = await token.transferFrom(owner, receiver, transferAmount, {
          from: exchange,
        });
      });

      it("Test token balances", async () => {
        let balance;
        balance = await token.balanceOf(owner);
        balance
          .toString()
          .should.equal((totalSupply - transferAmount).toString());

        balance = await token.balanceOf(receiver);
        balance.toString().should.equal(transferAmount.toString());
      });

      it("Test allowance of exchane", async () => {
        const allowance = await token.allowance(owner, exchange);
        allowance
          .toString()
          .should.equal((approveAmount - transferAmount).toString());
      });

      it("Transfer event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");

        const args = log.args;
        args.from.toString().should.equal(owner);
        args.to.toString().should.equal(receiver);
        args.value.toString().should.equal(transferAmount.toString());
      });
    });

    describe("failure", () => {
      it("Test insufficient allwance", async () => {
        await token.transferFrom(owner, receiver, approveAmount + 1, {
          from: owner,
        }).should.be.rejected;
      });

      it("Test invalid recipient", async () => {
        await token.transferFrom(owner, 0x0, transferAmount, { from: owner })
          .should.be.rejected;
      });
    });
  });
});
