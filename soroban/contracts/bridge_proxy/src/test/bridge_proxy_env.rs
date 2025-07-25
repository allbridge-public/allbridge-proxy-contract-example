#![cfg(test)]

use soroban_sdk::{Env, Address, BytesN};
use soroban_sdk::testutils::Address as TestAddress;
use crate::contract::{BridgeProxyContract, BridgeProxyContractClient};
use crate::test::token::Token;
use crate::test::mocks::{MockTargetContract,MockTargetContractClient,MockPoolContract,MockPoolContractClient};

pub struct BridgeProxyTest {
    pub env: Env,
    pub contract_address: Address,
    pub contract: BridgeProxyContractClient<'static>,
    pub admin: Address,
    pub bridge_address: Address,
    pub sender: Address,
    pub recipient: Address,
    pub token: Token,
}

impl BridgeProxyTest {
    pub fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let token = Token::create(&env, "usdx", &admin);
        token.airdrop(&sender);

        let bridge_address = env.register_contract(None, MockTargetContract);
        let bridge = MockTargetContractClient::new(&env, &bridge_address);

        let pool_address = env.register_contract(None, MockPoolContract);
        let pool = MockPoolContractClient::new(&env, &pool_address);
        pool.initialize(&admin, &bridge_address, &0, &token.id, &0, &0, &0);
        assert_eq!(pool.get_pool().token, token.id);

        bridge.add_pool(&pool_address, &token.id);
        assert_eq!(bridge.get_pool_address(&BytesN::from_array(&env, &[0; 32])), pool_address);

        let contract_address = env.register_contract(None, BridgeProxyContract);
        let contract = BridgeProxyContractClient::new(&env, &contract_address);

        BridgeProxyTest {
            env,
            contract_address,
            contract,
            admin,
            bridge_address,
            sender,
            recipient,
            token,
        }
    }
}
