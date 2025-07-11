import hre from "hardhat";
import TestBridgeModule from '../ignition/modules/test/TestBridge';
import BridgeProxyModule from '../ignition/modules/BridgeProxy';

async function main() {
  console.log("Setup test environment...");
  const { bridge, token } = await hre.ignition.deploy(TestBridgeModule);
  const bridgeAddress = await bridge.getAddress();

  console.log("Deploy test bridge proxy...");
  const parameters = { BridgeProxyModule: { bridge: bridgeAddress, partnerId: 1000 } };
  const { bridgeProxy } = await hre.ignition.deploy(BridgeProxyModule, { parameters });
  const tokenAddress = await token.getAddress();
  const bridgeProxyAddress = await bridgeProxy.getAddress();
  console.log('Deployed addresses', {
    token: tokenAddress,
    bridge: bridgeAddress,
    bridgeProxy: bridgeProxyAddress,
  });

  console.log("Setup bridge proxy...");
  await bridgeProxy.setupToken(tokenAddress);
}

main()
  .then(() => console.log('Done'))
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
