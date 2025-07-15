import hre from "hardhat";
import { getRequiredDeploymentAddress } from '../utils/deployments';
import {
  AllbridgeCoreSdk,
  ChainSymbol, RawEvmTransaction, SwapParams
} from "@allbridge/bridge-core-sdk";
import {
  approveToken, convertFloatAmountToInt, convertIntAmountToFloat,
  findTokenInfoBySymbol,
  getChainSymbol,
  getSdkOptions,
  sendEvmRawTransaction
} from '../utils/sdk/sdk-utils';
import { getNetworkName, getNodeUrl } from '../utils/network';

async function main() {
  const proxyAddress = await getRequiredDeploymentAddress(hre, "BridgeProxyModule#BridgeProxy");
  const proxy = await hre.ethers.getContractAt('BridgeProxy', proxyAddress) as any;

  const networkName = await getNetworkName();
  const chainSymbol: ChainSymbol = getChainSymbol(networkName);
  const nodeUrl = getNodeUrl();
  const sdk = new AllbridgeCoreSdk({ [chainSymbol]: nodeUrl }, getSdkOptions(networkName));
  const chains = await sdk.chainDetailsMap();

  // replace bridge address with proxy address
  chains[chainSymbol].bridgeAddress = proxyAddress;
  for (const tokenInfo of chains[chainSymbol].tokens) {
    tokenInfo.bridgeAddress = proxyAddress;
  }

  const [signer] = await hre.ethers.getSigners();
  const fromAddress = await signer.getAddress();
  const toAddress = fromAddress;

  const amountFloat = "0.1";
  const sourceChain = chains[chainSymbol];
  const sourceToken = findTokenInfoBySymbol(sourceChain, 'USDC');
  const destinationChain = chains[chainSymbol];
  const destinationToken = findTokenInfoBySymbol(destinationChain, 'Core Yield');

  await approveToken(sdk, signer, sourceToken, fromAddress, amountFloat);

  const proxyFeeBp = await proxy.feeBP();
  const amount = convertFloatAmountToInt(amountFloat, sourceToken.decimals);
  const amountAfterProxyFee = BigInt(amount) * (10000n - proxyFeeBp) / 10000n;
  const amountAfterProxyFeeFloat = convertIntAmountToFloat(amountAfterProxyFee.toString(), sourceToken.decimals);

  // prepare swap tx
  const toBeReceivedFloat = await sdk.getAmountToBeReceived(amountAfterProxyFeeFloat, sourceToken, destinationToken);
  const swapParams: SwapParams = {
    amount: amountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    minimumReceiveAmount: toBeReceivedFloat,
  };
  const rawTransaction = (await sdk.bridge.rawTxBuilder.send(swapParams)) as RawEvmTransaction;

  console.log(`Swap ${amountFloat} ${sourceToken.symbol} to ${toBeReceivedFloat} ${destinationToken.symbol}`);
  await sendEvmRawTransaction(rawTransaction);
}

main()
  .then(() => console.log('Done'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
