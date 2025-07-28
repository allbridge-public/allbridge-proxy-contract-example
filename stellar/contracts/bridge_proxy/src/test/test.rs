#![cfg(test)]

use soroban_sdk::{Address,vec,Vec,Val,BytesN,Symbol,TryFromVal,U256};
use soroban_sdk::testutils::{Address as _, MockAuth, MockAuthInvoke};

use crate::test::common::{address_to_bytes,events_by_contract};
use crate::test::bridge_proxy_env::BridgeProxyTest;

#[test]
fn test_initialize_success() {
    let test = BridgeProxyTest::setup();

    let result = test
        .contract
        .try_initialize(&test.admin, &test.bridge_address);
    assert!(result.is_ok());

    assert_eq!(
        test.contract.get_target_contract(),
        test.bridge_address
    );
    assert_eq!(
        test.contract.get_administrator(),
        test.admin
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #1001)")]
fn test_initialize_fail_already_initialized() {
    let test = BridgeProxyTest::setup();
    test.contract.initialize(&test.admin, &test.bridge_address);
    test.contract.initialize(&test.admin, &test.bridge_address);
}

#[test]
fn test_set_target_contract() {
    let test = BridgeProxyTest::setup();
    let env = &test.env;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let new_bridge_address = Address::generate(&env);
    test.contract.set_target_contract(&new_bridge_address);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_set_target_contract_fail_unauthorized() {
    let test = BridgeProxyTest::setup();
    let env = &test.env;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let unauthorized_address = Address::generate(&env);
    let new_bridge_address = Address::generate(&env);
    env.mock_auths(&[MockAuth {
        address: &unauthorized_address,
        invoke: &MockAuthInvoke {
            contract: &test.contract_address,
            fn_name: "set_target_contract",
            args: vec![&env, new_bridge_address.to_val()],
            sub_invokes: &[],
        },
    }]);
    test.contract.set_target_contract(&new_bridge_address);
}

#[test]
fn test_set_fee_bp() {
    let test = BridgeProxyTest::setup();

    test.contract.initialize(&test.admin, &test.bridge_address);

    let fee_bp = 10u32; // 0.1%
    test.contract.set_fee_bp(&fee_bp);
    assert_eq!(test.contract.get_fee_bp(), fee_bp);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_set_fee_bp_fail_unauthorized() {
    let test = BridgeProxyTest::setup();
    let env = &test.env;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let unauthorized_address = Address::generate(&env);
    let fee_bp: u32 = 100;
    env.mock_auths(&[MockAuth {
        address: &unauthorized_address,
        invoke: &MockAuthInvoke {
            contract: &test.contract_address,
            fn_name: "set_fee_bp",
            args: vec![&env, fee_bp.into()],
            sub_invokes: &[],
        },
    }]);
    test.contract.set_fee_bp(&fee_bp);
}

#[test]
fn test_swap() {
    let test = BridgeProxyTest::setup();
    let env = &test.env;
    let token = &test.token;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let sender = test.sender;
    let amount: u128 = 1000;
    let token_bytes = address_to_bytes(&env, &token.id).unwrap();
    let receive_token = BytesN::from_array(env, &[1; 32]);
    let recipient = test.recipient;
    let receive_amount_min: u128 = 950;

    let result = test.contract.swap(
        &sender,
        &amount,
        &token_bytes,
        &receive_token,
        &recipient,
        &receive_amount_min,
    );
    assert_eq!(result, ());

    let events = events_by_contract(env, &test.bridge_address);
    assert_eq!(events.len(), 1);

    let event = events.get(0).unwrap();
    let (contract_id, topics, data): (Address, Vec<Val>, Val) = event;
    assert_eq!(contract_id, test.bridge_address);
    assert_eq!(topics.len(), 1);
    let symbol_topic: Symbol = Symbol::try_from_val(env, &topics.get_unchecked(0)).unwrap();
    assert_eq!(symbol_topic, Symbol::new(&env, "swap_called"));

    let expected_data = (sender, amount, token_bytes, receive_token, recipient, receive_amount_min);
    let actual_data: (Address, u128, BytesN<32>, BytesN<32>, Address, u128) =
        <_>::try_from_val(env, &data).unwrap();
    assert_eq!(actual_data, expected_data);
}

#[test]
fn test_swap_and_bridge() {
    let test = BridgeProxyTest::setup();
    let env = &test.env;
    let token = &test.token;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let sender = test.sender;
    let token_address = &token.id;
    let expected_token_address = token.id.clone();
    let amount: u128 = 1000;
    let recipient = address_to_bytes(&env, &test.recipient).unwrap();
    let destination_chain_id: u32 = 2;
    let receive_token = BytesN::from_array(env, &[1; 32]);
    let nonce = U256::from_u32(&env, 12345);
    let gas_amount: u128 = 10000;
    let fee_token_amount: u128 = 10;

    let result = test.contract.swap_and_bridge(
        &sender,
        &token_address,
        &amount,
        &recipient,
        &destination_chain_id,
        &receive_token,
        &nonce,
        &gas_amount,
        &fee_token_amount,
    );

    assert_eq!(result, ());

    let events = events_by_contract(env, &test.bridge_address);
    assert_eq!(events.len(), 1);
    let event = events.get(0).unwrap();
    let (contract_id, topics, data): (Address, Vec<Val>, Val) = event;
    assert_eq!(contract_id, test.bridge_address);
    assert_eq!(topics.len(), 1);
    let symbol_topic: Symbol = Symbol::try_from_val(env, &topics.get_unchecked(0)).unwrap();
    assert_eq!(symbol_topic, Symbol::new(&env, "swap_and_bridge_called"));

    let expected_data = (
                            sender,
                            expected_token_address,
                            amount,
                            recipient,
                            destination_chain_id,
                            receive_token,
                            nonce,
                            gas_amount,
                            fee_token_amount,
                        );
    let actual_data: (
                        Address,
                        Address,
                        u128,
                        BytesN<32>,
                        u32,
                        BytesN<32>,
                        U256,
                        u128,
                        u128,
                     ) = <_>::try_from_val(env, &data).unwrap();
    assert_eq!(actual_data, expected_data);
}

#[test]
fn test_withdraw_collected_tokens() {
    let test = BridgeProxyTest::setup();
    let token = &test.token;

    test.contract.initialize(&test.admin, &test.bridge_address);

    let amount: u128 = 1000;
    token.airdrop_amount(&test.contract_address, amount);

    let balance_before = token.balance_of(&test.admin);
    test.contract.withdraw_collected_tokens(&test.admin, &token.id);
    let balance_after = token.balance_of(&test.admin);
    assert_eq!(balance_after - balance_before, amount);
}
