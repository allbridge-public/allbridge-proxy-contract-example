import hre from "hardhat";
import { getRequiredDeploymentAddress } from '../utils/deployments';
import { AllbridgeCoreSdk, ChainSymbol, Messenger, RawEvmTransaction } from "@allbridge/bridge-core-sdk";
import {
  approveToken,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  findTokenInfoBySymbol,
  getChainSymbol,
  getSdkOptions,
  sendEvmRawTransaction
} from '../utils/sdk/sdk-utils';
import { getNetworkName, getNodeUrl } from '../utils/network';
import { SendParams } from '@allbridge/bridge-core-sdk/dist/src/services/bridge/models/bridge.model';

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
  const destinationChain = chains[ChainSymbol.ARB];
  const destinationToken = findTokenInfoBySymbol(destinationChain, 'USDC');

  await approveToken(sdk, signer, sourceToken, fromAddress, amountFloat);

  const proxyFeeBp = await proxy.feeBP();
  const amount = convertFloatAmountToInt(amountFloat, sourceToken.decimals);
  const amountAfterProxyFee = BigInt(amount) * (10000n - proxyFeeBp) / 10000n;
  const amountAfterProxyFeeFloat = convertIntAmountToFloat(amountAfterProxyFee.toString(), sourceToken.decimals);
  // Use amount after deducting proxy fee to calculate the amount to be received
  const toBeReceivedFloat = await sdk.getAmountToBeReceived(amountAfterProxyFeeFloat, sourceToken, destinationToken);

  // prepare swap and bridge tx
  const transferParams: SendParams = {
    amount: amountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
  };
  const rawTransaction = (await sdk.bridge.rawTxBuilder.send(transferParams)) as RawEvmTransaction;

  console.log(`Transfer ${amountFloat} ${sourceToken.symbol} on ${sourceChain.chainSymbol} to ${toBeReceivedFloat} ${destinationToken.symbol} on ${destinationChain.chainSymbol}`);
  await sendEvmRawTransaction(rawTransaction);
}

main()
  .then(() => console.log('Done'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
