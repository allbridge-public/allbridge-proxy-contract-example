import {
  AllbridgeCoreSdkOptions,
  NodeUrlsConfig,
  NodeRpcUrls,
  ChainType,
  ChainSymbol,
} from "@allbridge/bridge-core-sdk";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  jupiterUrl: "",
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "C3jAxHRTZjM2Bs7EqPir4nvrT8zKtpcW7RvGR9R2qKtN",
  sorobanNetworkPassphrase: "Test SDF Network ; September 2015",
  tronJsonRpc: "https://nile.trongrid.io/jsonrpc",
  cctpParams: {
    cctpTransmitterProgramId: "CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd",
    cctpTokenMessengerMinter: "CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3",
    cctpDomains: { SPL: 0, ARB: 3, AMO: 7 },
  },
  cachePoolInfoChainSec: 20,
  additionalChainsProperties: {
    ["SPL"]: {
      chainSymbol: "SPL" as ChainSymbol,
      chainId: "0xaa36a7",
      name: "Sepolia",
      chainType: ChainType.EVM,
    },
    ["MUM"]: {
      chainSymbol: "MUM" as ChainSymbol,
      chainId: "0x13881",
      name: "Mumbai",
      chainType: ChainType.EVM,
    },
    ["AMO"]: {
      chainSymbol: "AMO" as ChainSymbol,
      chainId: "0x13882",
      name: "Amoy",
      chainType: ChainType.EVM,
    },
  },
};

export const testnetNodeRpcUrlsDefault: NodeRpcUrls = {
  SOL: "https://api.devnet.solana.com",
  TRX: "https://nile.trongrid.io",
  SRB: "https://soroban-testnet.stellar.org",
  STLR: "https://horizon-testnet.stellar.org",
  SPL: "https://ethereum-sepolia-rpc.publicnode.com",
};
