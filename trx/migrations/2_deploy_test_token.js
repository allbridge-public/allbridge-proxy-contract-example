const Token = artifacts.require("Token");

const {DEVELOPMENT_NETWORK} = require("../consts");

module.exports = async function (deployer, network) {
    if (network === DEVELOPMENT_NETWORK) {
        const decimals = 6;
        const name = 'TestToken';
        const symbol = 'TT';
        const amount = '1000000000' + '0'.repeat(decimals);
        await deployer.deploy(Token, name, symbol, amount, decimals);
    }
};
