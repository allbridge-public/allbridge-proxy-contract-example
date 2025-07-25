use soroban_sdk::{contracttype, Env, Address, BytesN, U256, Map};
use crate::error::Error;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bridge {
    pub messenger: Address,
    pub rebalancer: Address,

    /// precomputed values to divide by to change the precision from the Gas Oracle precision to the token precision
    pub from_gas_oracle_factor: Map<Address, u128>,
    /// precomputed values of the scaling factor required for paying the bridging fee with stable tokens
    pub bridging_fee_conversion_factor: Map<Address, u128>,

    pub pools: Map<BytesN<32>, Address>,
    pub can_swap: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AnotherBridge {
    pub address: BytesN<32>,
    pub tokens: Map<BytesN<32>, bool>,
}

pub trait BridgeInterface {
    fn swap(
        env: Env,
        sender: Address,
        amount: u128,
        token: BytesN<32>,
        receive_token: BytesN<32>,
        recipient: Address,
        receive_amount_min: u128
    ) -> Result<(), Error>;

    fn swap_and_bridge(
        env: Env,
        sender: Address,
        token: Address,
        amount: u128,
        recipient: BytesN<32>,
        destination_chain_id: u32,
        receive_token: BytesN<32>,
        nonce: U256,
        gas_amount: u128,
        fee_token_amount: u128,
    ) -> Result<(), Error>;

    fn add_pool(env: Env, pool: Address, token: Address) -> Result<(), Error>;

    // view
    fn has_processed_message(env: Env, message: BytesN<32>) -> Result<bool, Error>;

    fn has_received_message(env: Env, message: BytesN<32>) -> Result<bool, Error>;

    fn get_pool_address(env: Env, token_address: BytesN<32>) -> Result<Address, Error>;

    fn get_config(env: Env) -> Result<Bridge, Error>;

    fn get_stop_authority(env: Env) -> Result<Address, Error>;

    fn get_transaction_cost(env: Env, chain_id: u32) -> Result<u128, Error>;

    fn get_gas_usage(env: Env, chain_id: u32) -> Result<u128, Error>;

    fn get_admin(env: Env) -> Result<Address, Error>;

    fn get_gas_oracle(env: Env) -> Result<Address, Error>;

    fn get_another_bridge(env: Env, chain_id: u32) -> Result<AnotherBridge, Error>;
}
