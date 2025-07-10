const {getRequiredEnv} = require("../utils/env");
const BridgeProxy = artifacts.require('./BridgeProxy.sol');

module.exports = async function (_deployer, network) {
    const proxy = await BridgeProxy.deployed();
    const feeBp = getRequiredEnv(network, "FEE_BP");
    console.log('Set fee BP:', feeBp);
    await proxy.setFeeBP(feeBp);
};
