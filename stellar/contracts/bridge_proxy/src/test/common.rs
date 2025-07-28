#![cfg(test)]
// use soroban_sdk::

use soroban_sdk::{
    xdr::{ToXdr},
    testutils::Events,
    Address, Env, Val, Vec, BytesN, Bytes
};
use crate::error::Error;

pub fn bytes_to_slice<const N: usize>(bytes: Bytes) -> [u8; N] {
    let mut xdr_slice: [u8; N] = [0; N];
    bytes.copy_into_slice(&mut xdr_slice);

    xdr_slice
}

pub fn address_to_bytes(env: &Env, address: &Address) -> Result<BytesN<32>, Error> {
    let address_xdr = address.to_xdr(env);
    if address_xdr.len() == 40 {
        // Ed25519 public key XDR
        let xdr_slice = bytes_to_slice::<40>(address_xdr);
        Ok(BytesN::from_array(
            env,
            arrayref::array_ref![xdr_slice, 8, 32],
        ))
    } else if address_xdr.len() == 44 {
        // Contract ID XDR
        let xdr_slice = bytes_to_slice::<44>(address_xdr);
        Ok(BytesN::from_array(
            env,
            arrayref::array_ref![xdr_slice, 12, 32],
        ))
    } else {
        Err(Error::InvalidArg)
    }
}

pub fn float_to_uint(amount: f64, decimals: u32) -> u128 {
    (amount * 10.0f64.powi(decimals as i32)) as u128
}

pub fn uint_to_float(amount: u128, decimals: u32) -> f64 {
    (amount as f64) / 10.0f64.powi(decimals as i32)
}

pub fn events_by_contract(env: &Env, contract: &Address) -> Vec<(Address, Vec<Val>, Val)> {
    let mut filtered = Vec::new(env);
    let all_events = env.events().all();

    for i in 0..all_events.len() {
        let (contract_id, topics, data) = all_events.get(i).unwrap();
        if contract_id == *contract {
            filtered.push_back((contract_id, topics, data));
        }
    }

    filtered
}
