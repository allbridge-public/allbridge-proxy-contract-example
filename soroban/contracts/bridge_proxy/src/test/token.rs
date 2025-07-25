use soroban_sdk::{token, Address, Env};

use crate::test::common::{float_to_uint, uint_to_float};

pub struct Token {
    pub id: soroban_sdk::Address,
    pub tag: &'static str,
    pub client: token::Client<'static>,
    pub asset_client: token::StellarAssetClient<'static>,
}

impl Token {
    pub fn create(env: &Env, tag: &'static str, admin: &Address) -> Token {
        let id = env.register_stellar_asset_contract(admin.clone());
        let client = token::Client::new(env, &id);
        let asset_client = token::StellarAssetClient::new(env, &id);

        Token {
            id,
            tag,
            client,
            asset_client,
        }
    }

    pub fn clone_token(&self, env: &Env) -> Token {
        let client = token::Client::new(env, &self.id);
        let asset_client = token::StellarAssetClient::new(env, &self.id);

        Token {
            id: self.id.clone(),
            tag: self.tag,
            client,
            asset_client,
        }
    }

    pub fn airdrop(&self, id: &Address) {
        self.asset_client
            .mint(id, &(self.float_to_uint(1_000_000_000.0) as i128));
    }

    pub fn airdrop_amount(&self, id: &Address, amount: u128) {
        self.asset_client
            .mint(id, &(amount as i128));
    }

    pub fn balance_of(&self, id: &Address) -> u128 {
        self.client.balance(id) as u128
    }

    pub fn float_to_uint(&self, amount: f64) -> u128 {
        float_to_uint(amount, self.client.decimals())
    }

    pub fn int_to_float(&self, amount: u128) -> f64 {
        uint_to_float(amount, self.client.decimals())
    }
}
