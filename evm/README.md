# EVM Allbridge Bridge Proxy contract

## Running on localhost (development)
Run local node:
```shell
npx hardhat node
```

Deploy on local node:
```shell
npx hardhat run scripts/deploy-test-bridge-proxy.ts --network local
```

## Running on testnet

Deploy on sepolia testnet:
```shell
npx hardhat ignition deploy ./ignition/modules/BridgeProxy.ts --network sepolia --parameters ignition/parameters/sepolia.json
```

## Running on mainnet

Deploy on ethereum mainnet:
```shell
npx hardhat ignition deploy ./ignition/modules/BridgeProxy.ts --network ethereum --parameters ignition/parameters/ethereum.json
```

## Setup deployed proxy contract
Set fee basis points:
```shell
npx hardhat setup-proxy --network sepolia --fee-bp 10 
```
Setup tokens:
```shell
npx hardhat setup-proxy --network sepolia --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238,0x4f9855416f0062688357Bf3b3Bf3E4dC88078fCa
```

## Withdraw
Withdraw collected fee:
```shell
npx hardhat withdraw --network sepolia --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```
