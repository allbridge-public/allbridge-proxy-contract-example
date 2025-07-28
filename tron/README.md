# Tron proxy for Allbridge Core bridge

## Deployment on localhost (development)
Run local node:
```shell
docker run -p 9090:9090 --rm --name tron -e "seed=4f60c4cd318a" tronbox/tre
```

Deploy contracts on local node:
```shell
tronbox migrate --f 1 --to 3
```

## Deployment on testnet

Deploy contracts on nile testnet:
```shell
tronbox migrate --f 3 --to 3 --network nile
```

## Deployment on mainnet

Deploy contracts on tron mainnet:
```shell
tronbox migrate --f 3 --to 3 --network tron
```

## Setup deployed proxy contract
Set fee basis points:
```shell
tronbox migrate --f 4 --to 4 --network nile 
```
Setup tokens:
```shell
tronbox migrate --f 5 --to 5 --network nile 
```
