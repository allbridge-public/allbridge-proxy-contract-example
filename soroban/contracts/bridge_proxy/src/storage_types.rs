use soroban_sdk::{contracttype};

#[contracttype]
pub enum DataKey {
    Admin,
    TargetContract,
    Initialized,
    FeeBP,
}
