# Stellar proxy for Allbridge Core bridge

## Prerequisites
 * Rust and Cargo installed
 * Stellar CLI installed and configured

## Deployment

### Build the contract
```shell
make build
make optimize
```

### Deployment on testnet:
  * Create and fund new account on testnet
    ```shell
    make generate-account-testnet
    ```
  * Deploy proxy contract
    ```shell
    make proxy-deploy
    make proxy-initialize
    ```
  * Setup fee basis points:
    ```shell
    make proxy-set-fee-bp FEE_BP=10
    ```
    

### Deployment on mainnet:
  * Generate account 
    ```shell
    stellar keys generate admin
    ```
  * Fund the generated account
    ```shell
    stellar keys address admin
    ```
  * Build and deploy the contract 
    ```shell
    make proxy-deploy NETWORK=mainnet ADMIN_IDENTITY=admin
    make proxy-initialize NETWORK=mainnet ADMIN_IDENTITY=admin BRIDGE_ADDRESS=CBQ6GW7QCFFE252QEVENUNG45KYHHBRO4IZIWFJOXEFANHPQUXX5NFWV
    ```
  * Setup fee basis points:
    ```shell
    make proxy-set-fee-bp FEE_BP=10
    ```

## Send transactions
### Testnet
Swap tokens:
```shell
make proxy-swap
```

Swap tokens and bridge to another chain:
```shell
make proxy-swap-and-bridge
```

### Mainnet
Swap 1 USDC to USDT and bridge to Ethereum to address 0xF916877fa119b8e3F22BABd62fCb47135b62C23:
```shell
make proxy-swap-and-bridge \
NETWORK=mainnet \
IDENTITY=admin \
TOKEN_ADDRESS=CACOK7HB7D7SRPMH3LYYOW77T6D4D2F7TR7UEVKY2TVSUDSRDM6DZVLK \
AMOUNT=10000000 \
BRIDGE_RECEIVE_CHAIN_ID=1 \
BRIDGE_RECEIVE_TOKEN=000000000000000000000000dAC17F958D2ee523a2206206994597C13D831ec7 \
BRIDGE_RECEIVE_ADDRESS=0000000000000000000000000F916877fa119b8e3F22BABd62fCb47135b62C23 
```

## Withdraw
### Testnet
  * Check proxy-contract balance
    ```shell
    make token-get-proxy-balance TOKEN_ADDRESS=CACOK7HB7D7SRPMH3LYYOW77T6D4D2F7TR7UEVKY2TVSUDSRDM6DZVLK
    ```
  * Withdraw collected fee:
    ```shell
    make proxy-withdraw-fee TOKEN_ADDRESS=CACOK7HB7D7SRPMH3LYYOW77T6D4D2F7TR7UEVKY2TVSUDSRDM6DZVLK
    ```

### Mainnet
  * Check proxy-contract USDC balance
    ```shell
    make token-get-proxy-balance NETWORK=mainnet ADMIN_IDENTITY=admin  TOKEN_ADDRESS=CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
    ```
  * Withdraw collected fee in USDC:
    ```shell
    make proxy-withdraw-fee NETWORK=mainnet ADMIN_IDENTITY=admin TOKEN_ADDRESS=CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
    ```
