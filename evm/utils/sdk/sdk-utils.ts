import { Big, BigSource } from "big.js";
import {
  AllbridgeCoreSdk,
  AllbridgeCoreSdkOptions,
  ChainDetailsWithTokens,
  ChainSymbol,
  mainnet, RawEvmTransaction, TokenWithChainDetails
} from '@allbridge/bridge-core-sdk';
import { testnet } from './testnet';
import { Signer, TransactionRequest } from 'ethers';
import { ethers } from 'hardhat';


const testnetNetworks = ['sepolia'];
const mainnetNetworks = ['ethereum'];

export function getSdkOptions(networkName: string): AllbridgeCoreSdkOptions {
  if (testnetNetworks.includes(networkName)) {
    return testnet;
  } else if (mainnetNetworks.includes(networkName)) {
    return mainnet;
  } else {
    throw new Error(`Unknown network name ${networkName}`);
  }
}

export function getChainSymbol(networkName: string): ChainSymbol {
  const networkCodes = {
    sepolia: 'SPL' as ChainSymbol,
    ethereum: ChainSymbol.ETH,
  }

  const result = networkCodes[networkName as keyof typeof networkCodes];
  if (!result) {
    throw new Error(`Unknown network name ${networkName}`);
  }
  return result;
}

export function findTokenInfoBySymbol(chainInfo: ChainDetailsWithTokens, tokenSymbol: string) {
  const tokenInfo = chainInfo.tokens.find((tokenInfo) => tokenInfo.symbol === tokenSymbol);
  if (!tokenInfo) {
    throw new Error(`Token "${tokenSymbol}" not found on ${chainInfo.chainSymbol}`);
  }
  return tokenInfo;
}

export async function approveToken(sdk: AllbridgeCoreSdk, signer: Signer, tokenInfo: TokenWithChainDetails, owner: string, amount: string): Promise<void> {
  //check if sending tokens is already approved
  if (!(await sdk.bridge.checkAllowance({ token: tokenInfo, owner: owner, amount: amount }))) {
    // authorize the bridge to transfer tokens from sender's address
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: tokenInfo,
      owner: owner,
    })) as RawEvmTransaction;
    console.log(`Approve token ${tokenInfo.symbol}`);
    await sendEvmRawTransaction(rawTransactionApprove, signer);
  }
}

export async function sendEvmRawTransaction(rawTx: TransactionRequest, signer?: Signer) {
  const s = signer ?? (await ethers.getSigners())[0];
  const txResponse = await s.sendTransaction(rawTx);
  console.log("Tx hash:", txResponse.hash);

  const receipt = await txResponse.wait();
  console.log(`Tx ${receipt?.hash} confirmed`);

  return receipt;
}

export function convertFloatAmountToInt(amountFloat: BigSource, decimals: number): string {
  return Big(amountFloat).times(Big(10).pow(decimals)).toFixed();
}

export function convertIntAmountToFloat(amountInt: BigSource, decimals: number): string {
  const amountValue = Big(amountInt);
  if (amountValue.eq(0)) {
    return '0';
  }
  return Big(amountValue).div(Big(10).pow(decimals)).toFixed();
}
