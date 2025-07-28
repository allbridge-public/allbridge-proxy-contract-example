use soroban_sdk::{Env, Address, contracttype};
use crate::error::Error;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Pool {
    pub a: u128,
    pub token: Address,
    pub fee_share_bp: u128,
    pub balance_ratio_min_bp: u128,

    pub d: u128,
    pub token_balance: u128,
    pub v_usd_balance: u128,
    pub reserves: u128,
    pub decimals: u32,
    pub total_lp_amount: u128,
    pub admin_fee_share_bp: u128,
    pub acc_reward_per_share_p: u128,
    pub admin_fee_amount: u128,

    pub can_deposit: bool,
    pub can_withdraw: bool,
}

pub trait PoolInterface {
    #[allow(clippy::too_many_arguments)]
    fn initialize(
        env: Env,
        admin: Address,
        bridge: Address,
        a: u128,
        token: Address,
        fee_share_bp: u128,
        balance_ratio_min_bp: u128,
        admin_fee_share_bp: u128,
    ) -> Result<(), Error>;

    fn get_pool(env: Env) -> Result<Pool, Error>;
}
