default: build

ADDRESS_PATH=stellar-deploy
NETWORK=testnet
IDENTITY=alice
ADMIN_IDENTITY=alice
BRIDGE_ADDRESS=CAMP6GLJPTVISUDFVNK3MOLBMGWUCD25ISBJBDR7H6MD4FWYA27XVX7D
TOKEN_ADDRESS=CACOK7HB7D7SRPMH3LYYOW77T6D4D2F7TR7UEVKY2TVSUDSRDM6DZVLK
TOKEN_HEX_ADDRESS=04e57ce1f8ff28bd87daf1875bff9f87c1e8bf9c7f425558d4eb2a0e511b3c3c
POOL_ADDRESS=CA6NB5XR5NTJB6X7VCK65NMSTIAEQACQHYSQP5JZUVWXUP4D4UUZKNHJ
FEE_BP=10

ADMIN_ADDRESS=$$(stellar keys address $(ADMIN_IDENTITY))
SENDER_ADDRESS=$$(stellar keys address $(IDENTITY))
I128_MAX=170141183460469231731687303715884105727
EXPIRATION_LEDGER=3110400

BRIDGE_PROXY_WASM_PATH = target/wasm32-unknown-unknown/release/bridge_proxy.wasm
BRIDGE_PROXY_WASM_PATH_OP = target/wasm32-unknown-unknown/release/bridge_proxy.optimized.wasm
BRIDGE_PROXY_ADDRESS_PATH = $(ADDRESS_PATH)/bridge_proxy
BRIDGE_PROXY_ADDRESS = $$(cat $(BRIDGE_PROXY_ADDRESS_PATH))

install-cli:
	cargo install --locked --version 23.0.0 stellar-cli

build:
	cargo build --target wasm32-unknown-unknown --release --package bridge-proxy
	@ls -l $(BRIDGE_PROXY_WASM_PATH)

test: build
	cargo test

optimize:
	stellar contract optimize --wasm $(BRIDGE_PROXY_WASM_PATH)

generate-account:
	stellar keys generate --network $(NETWORK) --fund $(IDENTITY)

output-address:
	echo $(SENDER_ADDRESS)

proxy-deploy:
	stellar contract deploy \
      --wasm $(BRIDGE_PROXY_WASM_PATH_OP) \
      --source $(ADMIN_IDENTITY) \
      --network $(NETWORK) 	\
      > $(BRIDGE_PROXY_ADDRESS_PATH) && echo $(BRIDGE_PROXY_ADDRESS)

proxy-initialize:
	stellar contract invoke \
        --id $(BRIDGE_PROXY_ADDRESS) \
        --source $(ADMIN_IDENTITY) \
        --network $(NETWORK) 	\
        -- \
        initialize \
        --admin $(ADMIN_ADDRESS) \
        --target_contract $(BRIDGE_ADDRESS) \


proxy-set-fee-bp:
	stellar contract invoke \
        --id $(BRIDGE_PROXY_ADDRESS) \
        --source $(ADMIN_IDENTITY) \
        --network $(NETWORK) 	\
        -- \
        set_fee_bp \
        --fee_bp $(FEE_BP) \

proxy-swap:
	stellar contract invoke \
        --id $(BRIDGE_PROXY_ADDRESS) \
        --source $(IDENTITY) \
        --network $(NETWORK) \
        -- \
        swap \
        --sender $(SENDER_ADDRESS) \
        --token $(TOKEN_HEX_ADDRESS) \
        --amount 10000000 \
        --recipient GA7BQD4JKXZML7FVKJ25MDVEQPV56VDBMCBXDMEZQ6FMPBEMV6Q6MKTC \
        --receive_token 1cfbfc7546de559c9ff6ff89169e9acdecebf9ebb6cef3e0683178381816315f \
        --receive_amount_min 0 \

proxy-swap-and-bridge:
	stellar contract invoke \
        --id $(BRIDGE_PROXY_ADDRESS) \
        --source $(IDENTITY) \
        --network $(NETWORK) \
        -- \
        swap_and_bridge \
        --sender $(SENDER_ADDRESS) \
        --token $(TOKEN_ADDRESS) \
        --amount 10000000 \
        --recipient 0000000000000000000000000F916877fa119b8e3F22BABd62fCb47135b62C23 \
        --destination_chain_id 2 \
        --receive_token 0000000000000000000000001c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
        --nonce 0000000000000000000000000000000000000000000000000000000000000019 \
        --gas_amount 20000000 \
        --fee_token_amount 0 \

token-get-proxy-balance:
	stellar contract invoke \
        --id $(TOKEN_ADDRESS) \
        --source $(ADMIN_IDENTITY) \
        --network $(NETWORK) 	\
        --is-view \
        -- \
        balance \
        --id $(BRIDGE_PROXY_ADDRESS)

proxy-withdraw-fee:
	stellar contract invoke \
        --id $(BRIDGE_PROXY_ADDRESS) \
        --source $(ADMIN_IDENTITY) \
        --network $(NETWORK) 	\
        -- \
        withdraw_collected_tokens \
        --sender $(ADMIN_ADDRESS) \
        --token_address $(TOKEN_ADDRESS) \
