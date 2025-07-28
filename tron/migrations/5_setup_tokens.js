const Token = artifacts.require("Token");
const BridgeProxy = artifacts.require('./BridgeProxy.sol');

const {DEVELOPMENT_NETWORK} = require("../consts");
const {getRequiredEnv} = require("../utils/env");

module.exports = async function (deployer, network) {
    if (network === DEVELOPMENT_NETWORK) {
        const token = await Token.deployed();
        if (token) {
            const proxy = await BridgeProxy.deployed();
            console.log('Setup token: ', token.address);
            await proxy.setupToken(token.address);
        }
    } else {
        const proxy = await BridgeProxy.deployed();

        const tokens = getRequiredEnv(network, "TOKENS").split(',');
        for (const tokenAddress of tokens) {
            console.log('Setup token: ', tokenAddress);
            await proxy.setupToken(tokenAddress);
        }
    }
};
