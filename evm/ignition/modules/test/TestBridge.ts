import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const TestBridgeModule = buildModule("TestBridgeModule", (m) => {
  const tokenDecimals = 18;
  const amount = ethers.parseUnits('1000000000', tokenDecimals);
  const token = m.contract("Token", ['TestToken', 'TT', amount, tokenDecimals]);

  const bridge = m.contract("TestBridge");
  return { bridge, token };
});

export default TestBridgeModule;
