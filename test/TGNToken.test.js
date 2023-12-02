const TGNToken = artifacts.require("TGNToken");

const assert = require("chai").assert;

contract("TGNToken ERC20 Token Test", ([owner, receiver, exchange]) => {
  let token;

  beforeEach(async () => {
    token = await TGNToken.deployed(10000);
  });

  describe("Token properties test", () => {
    it("Test name", async () => {
      const name = await token.name();
      assert.equal(name, "Tign");
    });
  });
});
