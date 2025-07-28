# EVM Allbridge Bridge Proxy contract

## Deployment on localhost (development)
Run local node:
```shell
npx hardhat node
```

Deploy on local node:
```shell
npx hardhat run scripts/deploy-test-bridge-proxy.ts --network local
```

## Deployment on testnet

Deploy on sepolia testnet:
```shell
npx hardhat ignition deploy ./ignition/modules/BridgeProxy.ts --network sepolia --parameters ignition/parameters/sepolia.json
```

## Deployment on mainnet

Deploy on ethereum mainnet:
```shell
npx hardhat ignition deploy ./ignition/modules/BridgeProxy.ts --network ethereum --parameters ignition/parameters/ethereum.json
```

## Setup deployed proxy contract
Set fee basis points:
```shell
npx hardhat setupProxy --network sepolia --fee-bp 10 
```
Setup tokens:
```shell
npx hardhat setupProxy --network sepolia --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238,0x4f9855416f0062688357Bf3b3Bf3E4dC88078fCa
```

## Send transactions
Swap tokens on sepolia:
```shell
npx hardhat run scripts/swap.ts --network sepolia
```

Swap tokens and bridge to another chain:
```shell
npx hardhat run scripts/swap-and-bridge.ts --network sepolia
```

## Withdraw
Withdraw collected fee:
```shell
npx hardhat withdraw --network sepolia --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```
