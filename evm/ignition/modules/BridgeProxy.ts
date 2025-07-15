// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BridgeProxyModule = buildModule("BridgeProxyModule", (m) => {
  const bridgeAddress = m.getParameter("bridge");
  const partnerId = m.getParameter("partnerId");

  const bridgeProxy = m.contract("BridgeProxy", [bridgeAddress, partnerId]);

  return { bridgeProxy };
});

export default BridgeProxyModule;
