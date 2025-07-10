const BridgeProxy = artifacts.require('./BridgeProxy.sol');

const {DEVELOPMENT_NETWORK} = require("../consts");
const {getEnv} = require("../utils/env");
module.exports = async function (deployer, network) {
  let bridgeAddress = getEnv(network, "BRIDGE");
  const partnerId = process.env.PARTNER_ID || "0";
  if (!bridgeAddress && network === DEVELOPMENT_NETWORK) {
    const TestBridge = artifacts.require('./TestBridge.sol');
    const testBridge = await TestBridge.deployed();
    bridgeAddress = testBridge.address;
  }
  if (!bridgeAddress) {
    throw new Error('No bridge address');
  }

  await deployer.deploy(BridgeProxy, bridgeAddress, partnerId);
};
