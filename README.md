# Proxy contract for Allbridge Core bridge

This project contains reference implementation of smart contracts that act as a proxy for Allbridge Core bridge smart contracts across multiple blockchains.

### Key features
* Supports swaps and bridge of stable tokens by forwarding requests to Allbridge Core bridge contract wich handles the operation.
* These contracts share the same interface as Allbridge Core bridge contracts, which means they can be used with existing tools designed for Allbridge Core like Allbridge Core SDK.
* Can retain a portion of transferred amount as protocol fee.

### How to Deploy

Follow the deployment instructions for the relevant blockchain:
* [EVM-based (Ethereum, BSC, Arbitrum, Polygon)](./evm/README.md)
* [Tron](./tron/README.md)
* [Stellar](./stellar/README.md)

### SDK Integration

To use Allbridge Core SDK with custom bridge proxy, replace field `bridgeAddress` in source token info object with the address of the deployed proxy-contract.
```typescript
const chainDetailsMap = await sdk.chainDetailsMap();
const sourceToken = chainDetailsMap[ChainSymbol.SRB]
  .tokens
  .find((t) => t.symbol == "USDC");
sourceToken.bridgeAddress = proxyAddress;
```

Reference [Allbridge SDK](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/README.md) documentation to learn more about using SDK to swap and bridge stable tokens.
