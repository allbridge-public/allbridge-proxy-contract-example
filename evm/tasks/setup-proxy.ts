import { task } from "hardhat/config";
import { getRequiredDeploymentAddress } from "../utils/deployments";
import { handleTransactionResult } from '../utils/tx';

task("setupProxy", "Setup proxy")
  .addOptionalParam("proxy", "Bridge proxy contract address")
  .addOptionalParam("feeBp", "Set fee basis points")
  .addOptionalParam("token", "Token address to enable")
  .addOptionalParam("bridge", "Set new bridge address")
  .setAction(async (args, hre) => {
    const address = args.proxy ?? await getRequiredDeploymentAddress(hre, "BridgeProxyModule#BridgeProxy");
    const proxy = await hre.ethers.getContractAt('BridgeProxy', address) as any;

    if (args.feeBp !== undefined) {
      const current: bigint = await proxy.feeBP();
      console.log('Current fee BP: ', current.toString());
      if (current !== BigInt(args.feeBp)) {
        console.log('Set fee BP: ', args.feeBp);
        const result = await proxy.setFeeBP(args.feeBp);
        await handleTransactionResult(result);
      }
    }
    if (args.token !== undefined) {
      const tokens: string[] = args.token.split(',');
      for (const tokenAddress of tokens) {
        console.log('Setup token: ', tokenAddress);
        const result = await proxy.setupToken(tokenAddress);
        await handleTransactionResult(result);
      }
    }
    if (args.bridge !== undefined) {
      const current: string = await proxy.bridge();
      console.log('Current bridge: ', current);
      if (current !== args.bridge) {
        const result = await proxy.setBridge(args.bridge);
        await handleTransactionResult(result);
      }
    }
  });
