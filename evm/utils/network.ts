import hre, { network } from 'hardhat';

export const getNetworkName: () => Promise<string> = async () => (await hre.ethers.provider.getNetwork()).name;
export const getNodeUrl: () => string = () => (network.config as any)['url'];
