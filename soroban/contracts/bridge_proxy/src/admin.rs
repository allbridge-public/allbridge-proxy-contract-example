use soroban_sdk::{Address, Env};

use crate::storage_types::DataKey;

pub fn read_administrator(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_administrator(e: &Env, id: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, id);
}

pub fn require_admin(env: &Env) {
    let admin = read_administrator(env);
    admin.require_auth();
}
