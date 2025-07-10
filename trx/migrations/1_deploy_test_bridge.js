const {DEVELOPMENT_NETWORK} = require("../consts");
const TestBridge = artifacts.require("TestBridge");

module.exports = function (deployer, network) {
    if (network === DEVELOPMENT_NETWORK) {
        deployer.deploy(TestBridge);
    }
};
