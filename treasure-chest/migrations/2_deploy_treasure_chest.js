var treasureChest = artifacts.require("TreasureChest");

module.exports = function(deployer) {
    deployer.deploy(treasureChest);
};
