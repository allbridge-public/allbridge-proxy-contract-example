use soroban_sdk::{contract, contractimpl, Env, IntoVal, TryFromVal, Vec, vec, Val, Address, BytesN, Symbol, U256, token};
use crate::utils::extend_ttl_instance;
use crate::error::Error;
use crate::storage_types::DataKey;
use crate::admin::{read_administrator, write_administrator, require_admin};
use crate::utils::{safe_cast};
use crate::interfaces::{Bridge, AnotherBridge, Pool};

#[contract]
pub struct BridgeProxyContract;

#[contractimpl]
impl BridgeProxyContract {
    pub fn initialize(env: Env, admin: Address, target_contract: Address) -> Result<(), Error> {
        if env.storage().persistent().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        write_administrator(&env, &admin);
        env.storage()
            .persistent()
            .set(&DataKey::TargetContract, &target_contract);
        env.storage().persistent().set(&DataKey::Initialized, &true);
        env.storage().persistent().set(&DataKey::FeeBP, &0u32);
        Ok(())
    }

    pub fn set_target_contract(env: Env, new_target: Address) -> Result<(), Error> {
        extend_ttl_instance(&env);
        require_admin(&env);

        env.storage()
            .persistent()
            .set(&DataKey::TargetContract, &new_target);

        Ok(())
    }

    pub fn get_token_address(env: &Env, token_bytes: BytesN<32>) -> Result<Address, Error> {
        let target_contract_address = Self::get_target_contract(env)?;
        Self::get_token_address_from_bridge(env, &target_contract_address, token_bytes)
    }

    pub fn get_target_contract(env: &Env) -> Result<Address, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::TargetContract)
            .ok_or(Error::NotInitialized)
    }

    pub fn get_administrator(env: Env) -> Result<Address, Error> {
        Ok(read_administrator(&env))
    }

    pub fn set_fee_bp(env: Env, fee_bp: u32) -> Result<(), Error> {
        extend_ttl_instance(&env);
        require_admin(&env);

        env.storage().persistent().set(&DataKey::FeeBP, &fee_bp);
        Ok(())
    }

    pub fn get_fee_bp(env: &Env) -> u32 {
        env.storage().persistent().get(&DataKey::FeeBP).unwrap_or(0)
    }

    pub fn calculate_fee_amount(env: &Env, amount: u128) -> Result<u128, Error> {
        let fee_bp = Self::get_fee_bp(&env);
        amount
            .checked_mul(fee_bp as u128)
            .map(|val| val / 10_000)
            .ok_or(Error::InvalidArg)
    }

    pub fn swap(
        env: Env,
        sender: Address,
        amount: u128,
        token: BytesN<32>,
        receive_token: BytesN<32>,
        recipient: Address,
        receive_amount_min: u128,
    ) -> Result<(), Error> {
        extend_ttl_instance(&env);

        let target_contract_address = Self::get_target_contract(&env)?;
        let token_address = Self::get_token_address_from_bridge(&env, &target_contract_address, token.clone())?;

        let fee_amount = Self::calculate_fee_amount(&env, amount)?;
        let amount_after_fee: u128 = amount - fee_amount;

        sender.require_auth();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&sender, &env.current_contract_address(), &safe_cast(fee_amount)?);

        let args: Vec<Val> = Vec::from_array(
            &env,
            [
                sender.into_val(&env),
                amount_after_fee.into_val(&env),
                token.into_val(&env),
                receive_token.into_val(&env),
                recipient.into_val(&env),
                receive_amount_min.into_val(&env),
            ],
        );
        let result: Result<(), Error> = env.invoke_contract(
                    &target_contract_address,
                    &Symbol::new(&env, "swap"),
                    args.into_val(&env),
                );

        result
    }

    #[allow(clippy::too_many_arguments)]
    pub fn swap_and_bridge(
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
        extend_ttl_instance(&env);

        let target_contract_address = Self::get_target_contract(&env)?;

        let transfer_amount = amount
            .checked_sub(fee_token_amount)
            .ok_or(Error::InvalidArg)?;
        let fee_amount = Self::calculate_fee_amount(&env, transfer_amount)?;
        let amount_after_fee: u128 = amount - fee_amount;

        sender.require_auth();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &safe_cast(fee_amount)?);

        let args: Vec<Val> = Vec::from_array(
            &env,
            [
                sender.into_val(&env),
                token.into_val(&env),
                amount_after_fee.into_val(&env),
                recipient.into_val(&env),
                destination_chain_id.into_val(&env),
                receive_token.into_val(&env),
                nonce.into_val(&env),
                gas_amount.into_val(&env),
                fee_token_amount.into_val(&env),
            ],
        );
        let result: Result<(), Error> = env.invoke_contract(
                    &target_contract_address,
                    &Symbol::new(&env, "swap_and_bridge"),
                    args.into_val(&env),
                );

        result
    }

    pub fn withdraw_collected_tokens(
        env: Env,
        sender: Address,
        token_address: Address,
    ) -> Result<(), Error> {
        extend_ttl_instance(&env);
        require_admin(&env);
        let contract_address = env.current_contract_address();

        let token_client = token::Client::new(&env, &token_address);
        let to_withdraw = token_client.balance(&contract_address);

        if to_withdraw > 0 {
            token_client.transfer(&contract_address, &sender, &to_withdraw);
        }

        Ok(())
    }

    pub fn upgrade(
        env: Env,
        new_wasm_hash: BytesN<32>,
    ) -> Result<(), Error> {
        require_admin(&env);
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    pub fn has_processed_message(env: Env, message: BytesN<32>) -> Result<bool, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "has_processed_message",
            Vec::from_array(&env, [message.to_val()])
        )
    }

    pub fn has_received_message(env: Env, message: BytesN<32>) -> Result<bool, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "has_received_message",
            Vec::from_array(&env, [message.to_val()])
        )
    }

    pub fn get_pool_address(env: Env, token_address: BytesN<32>) -> Result<Address, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_pool_address",
            Vec::from_array(&env, [token_address.to_val()])
        )
    }

    pub fn get_config(env: Env) -> Result<Bridge, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_config",
            Vec::from_array(&env, [])
        )
    }

    pub fn get_stop_authority(env: Env) -> Result<Address, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_stop_authority",
            Vec::from_array(&env, [])
        )
    }

    pub fn get_transaction_cost(env: Env, chain_id: u32) -> Result<u128, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_transaction_cost",
            Vec::from_array(&env, [chain_id.into_val(&env)])
        )
    }

    pub fn get_gas_usage(env: Env, chain_id: u32) -> Result<u128, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_gas_usage",
            Vec::from_array(&env, [chain_id.into_val(&env)])
        )
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_admin",
            Vec::from_array(&env, [])
        )
    }

    pub fn get_gas_oracle(env: Env) -> Result<Address, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_gas_oracle",
            Vec::from_array(&env, [])
        )
    }

    pub fn get_another_bridge(env: Env, chain_id: u32) -> Result<AnotherBridge, Error> {
        let target_contract_address = Self::get_target_contract(&env)?;
        Self::get_from_target(
            &env,
            &target_contract_address,
            "get_another_bridge",
            Vec::from_array(&env, [chain_id.into_val(&env)])
        )
    }

    fn get_from_target<T: TryFromVal<Env, Val>>(
        env: &Env,
        target_contract_address: &Address,
        fn_name: &str,
        args: Vec<Val>,
    ) -> Result<T, Error> {
        let val: Val = env.invoke_contract(
            &target_contract_address,
            &Symbol::new(env, fn_name),
            args,
        );
        T::try_from_val(env, &val).map_err(|_| Error::DeserializationError)
    }

    fn get_token_address_from_bridge(
        env: &Env,
        target_contract_address: &Address,
        token_bytes: BytesN<32>,
    ) -> Result<Address, Error> {
        let pool_address: Address = Self::get_from_target(
            &env,
            &target_contract_address,
            "get_pool_address",
            Vec::from_array(&env, [token_bytes.to_val()])
        )?;

        let pool_struct_val: Val = env.invoke_contract(
            &pool_address,
            &Symbol::new(env, "get_pool"),
            Vec::new(env),
        );

        let pool_info: Pool = Pool::try_from_val(env, &pool_struct_val)
            .map_err(|_| Error::NoPoolData)?;

        Ok(pool_info.token)
    }
}
