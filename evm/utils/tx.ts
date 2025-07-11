import { ContractTransactionResponse } from 'ethers';

export async function handleTransactionResult(
  result: ContractTransactionResponse,
) {
  console.log('Sending transaction...:', result.hash);
  await result.wait();
  console.log('Done');
}
