import { task } from "hardhat/config";
import { getRequiredDeploymentAddress } from "../utils/deployments";

task("getBridgingCost", "Get bridging cost")
  .addOptionalParam("bridge", "Bridge contract address")
  .addOptionalParam("messenger", "Messenger protocol", "1")
  .addParam("destinationChainId", "Destination blockchain ID")
  .addParam("token", "Source token address")
  .setAction(async (args, hre) => {
    const address = args.bridge ?? await getRequiredDeploymentAddress(hre, "BridgeProxyModule#BridgeProxy");
    const bridge = await hre.ethers.getContractAt('IBridge', address) as any;

    const result = await bridge.getBridgingCostInTokens(args.destinationChainId, args.messenger, args.token);
    console.log(result);
  });
