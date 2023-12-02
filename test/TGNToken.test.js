const TGNToken = artifacts.require("TGNToken");

require("chai").use(require("chai-as-promised")).should();

contract("TGNToken ERC20 Token Test", ([owner, receiver, exchange]) => {
  let token;

  beforeEach(async () => {
    token = await TGNToken.new(10000);
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
    it("Test balance", async () => {
      const balance = await token.balanceOf(owner);
      balance.toString().should.equal("10000");
    });
  });
});
