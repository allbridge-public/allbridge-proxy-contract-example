import fs from "fs";
import path from "path";
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export async function getDeployedAddresses(hre: HardhatRuntimeEnvironment) {
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const deploymentPath = path.join(
    __dirname,
    `../ignition/deployments/chain-${chainId}/deployed_addresses.json`
  );

  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

export async function getRequiredDeploymentAddress(hre: HardhatRuntimeEnvironment, id: string): Promise<string> {
  const deployedAddresses = await getDeployedAddresses(hre);
  const value = deployedAddresses[id];
  if (!value) {
    throw new Error(`Contract ${id} is not deployed`);
  }
  return value;
}
