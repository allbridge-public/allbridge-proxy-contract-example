use soroban_sdk::{contract, contractimpl, contracttype, Env, Address};
use crate::interfaces::{Pool,PoolInterface};
use crate::error::Error;

impl Pool {
    pub fn from_init_params(
        token: Address,
    ) -> Self {
        Pool {
            a: 0,
            token,
            fee_share_bp: 0,
            balance_ratio_min_bp: 0,
            admin_fee_share_bp: 0,
            decimals: 0,
            can_deposit: true,
            can_withdraw: true,
            d: 0,
            token_balance: 0,
            v_usd_balance: 0,
            reserves: 0,
            total_lp_amount: 0,
            acc_reward_per_share_p: 0,
            admin_fee_amount: 0,
        }
    }
}

#[contracttype]
pub enum PoolDataKey {
    Pool,
    Initialized,
}

#[contract]
pub struct MockPoolContract;

#[contractimpl]
impl PoolInterface for MockPoolContract {
    fn initialize(
        env: Env,
        _admin: Address,
        _bridge: Address,
        _a: u128,
        token: Address,
        _fee_share_bp: u128,
        _balance_ratio_min_bp: u128,
        _admin_fee_share_bp: u128,
    ) -> Result<(), Error> {
        if env.storage().persistent().has(&PoolDataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        let pool = Pool::from_init_params(
            token,
        );
        env.storage().persistent().set(&PoolDataKey::Pool, &pool);
        env.storage().persistent().set(&PoolDataKey::Initialized, &true);

        Ok(())
    }

    fn get_pool(env: Env) -> Result<Pool, Error> {
        let pool: Pool = env
            .storage()
            .persistent()
            .get(&PoolDataKey::Pool)
            .ok_or(Error::NotInitialized)?;

        Ok(pool)
    }
}
