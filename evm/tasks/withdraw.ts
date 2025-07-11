import { task } from "hardhat/config";
import { getRequiredDeploymentAddress } from "../utils/deployments";
import { handleTransactionResult } from '../utils/tx';

task("withdraw", "Withdraw collected tokens from proxy contract")
  .addOptionalParam("proxy", "Bridge proxy contract address")
  .addParam("token", "Token address")
  .setAction(async (args, hre) => {
    const address = args.proxy ?? await getRequiredDeploymentAddress(hre, "BridgeProxyModule#BridgeProxy");
    const proxy = await hre.ethers.getContractAt('BridgeProxy', address) as any;

    const token = await hre.ethers.getContractAt(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
      args.token,
    );
    const tokenDecimals = await token.decimals();
    const tokenSymbol = await token.symbol();
    const tokensBalance = await token.balanceOf(proxy);
    console.log(
      `Current token balance is ${hre.ethers.formatUnits(
        tokensBalance,
        tokenDecimals,
      )} ${tokenSymbol}`,
    );
    if (tokensBalance === 0n) {
      console.log(`Nothing to withdraw`);
      return;
    }

    const result = await proxy.withdrawCollectedTokens(args.token);
    await handleTransactionResult(result);
  });
