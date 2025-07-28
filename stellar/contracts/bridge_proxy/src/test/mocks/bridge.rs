use soroban_sdk::{contract, contractimpl, Env, Address, testutils::Address as _, BytesN, Symbol, U256, token as sdk_token, Map};
use crate::utils::safe_cast;
use crate::interfaces::{BridgeInterface, Bridge, AnotherBridge, Pool};
use crate::error::Error;
use crate::test::mocks::{MockPoolContractClient};

#[contract]
pub struct MockTargetContract;

#[contractimpl]
impl BridgeInterface for MockTargetContract {
    fn swap(env: Env, sender: Address, amount: u128, token: BytesN<32>, receive_token: BytesN<32>, recipient: Address, receive_amount_min: u128) -> Result<(), Error> {
        env.events().publish(
                    (Symbol::new(&env, "swap_called"),),
                    (sender.clone(), amount, token.clone(), receive_token, recipient, receive_amount_min),
                );
        // get token address
        let pool_address = Self::get_pool_address(env.clone(), token)?;
        let pool = MockPoolContractClient::new(&env, &pool_address);
        let token_address: Address = pool.get_pool().token;
        // transfer tokens
        sender.require_auth();
        let token_client = sdk_token::Client::new(&env, &token_address);
        token_client.transfer(&sender, &env.current_contract_address(), &safe_cast(amount)?);

        Ok(())
    }

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
    ) -> Result<(), Error> {
        env.events().publish(
                    (Symbol::new(&env, "swap_and_bridge_called"),),
                    (
                        sender.clone(),
                        token.clone(),
                        amount,
                        recipient,
                        destination_chain_id,
                        receive_token,
                        nonce,
                        gas_amount,
                        fee_token_amount,
                    ),
                );
        // transfer tokens
        sender.require_auth();
        let token_client = sdk_token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &safe_cast(amount)?);

        Ok(())
    }

    fn add_pool(env: Env, pool: Address, _token: Address) -> Result<(), Error> {
        env.storage().persistent().set(&Symbol::new(&env, "Pool"), &pool);
        Ok(())
    }

    fn has_processed_message(_env: Env, _message: BytesN<32>) -> Result<bool, Error> {
        Ok(false)
    }

    fn has_received_message(_env: Env, _message: BytesN<32>) -> Result<bool, Error> {
        Ok(false)
    }

    fn get_pool_address(env: Env, _token_address: BytesN<32>) -> Result<Address, Error> {
        let pool_address: Address = env.storage().persistent().get(&Symbol::new(&env, "Pool"))
            .ok_or(Error::NotFound)?;
        Ok(pool_address)
    }

    fn get_config(env: Env) -> Result<Bridge, Error> {
        Ok(Bridge {
            messenger: Address::from_str(&env, "CBJ7KKQPQA74TYW762TB5HBEZ554W5D2RLC2EIFUT7ATYNG5GDG7BTVV"),
            rebalancer: Address::generate(&env),
            from_gas_oracle_factor: Map::new(&env),
            bridging_fee_conversion_factor: Map::new(&env),
            pools: Map::new(&env),
            can_swap: true,
        })
    }

    fn get_stop_authority(env: Env) -> Result<Address, Error> {
        Ok(Address::generate(&env))
    }

    fn get_transaction_cost(_env: Env, _chain_id: u32) -> Result<u128, Error> {
        Ok(5000)
    }

    fn get_gas_usage(_env: Env, _chain_id: u32) -> Result<u128, Error> {
        Ok(2500)
    }

    fn get_admin(env: Env) -> Result<Address, Error> {
        Ok(Address::generate(&env))
    }

    fn get_gas_oracle(env: Env) -> Result<Address, Error>{
        Ok(Address::from_str(&env, "CAQJUU3RG6PDTCJMZCOTAUL6LBHMG5LEOME5JSXZZMTMYIV4ZVGYDY2W"))
    }

    fn get_another_bridge(env: Env, _chain_id: u32) -> Result<AnotherBridge, Error> {
        Ok(AnotherBridge {
            address: BytesN::from_array(&env, &[0; 32]),
            tokens: Map::new(&env),
        })
    }
}
