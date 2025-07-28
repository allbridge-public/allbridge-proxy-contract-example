use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1001,
    NotInitialized = 1002,
    InvalidArg = 1003,
    NotFound = 1004,
    CastFailed = 1005,
    NoPoolData = 1006,
    DeserializationError = 1007,

    // CORE interface

    // Common
    CoreUnimplemented = 0,
    CoreInitialized = 1,
    CoreUninitialized = 2,
    CoreUnauthorized = 3,
    CoreInvalidArg = 4,
    CoreInvalidChainId = 5,
    CoreInvalidOtherChainId = 6,
    CoreGasUsageNotSet = 7,
    CoreBrokenAddress = 8,
    CoreNotFound = 9,
    CoreTokenInsufficientBalance = 10,
    CoreCastFailed = 11,
    CoreU256Overflow = 12,

    // Pool
    CoreZeroAmount = 103,
    CorePoolOverflow = 104,
    CoreZeroChanges = 105,
    CoreReservesExhausted = 106,
    CoreInsufficientReceivedAmount = 107,
    CoreBalanceRatioExceeded = 108,
    CoreForbidden = 109,

    // Bridge
    CoreUnauthorizedStopAuthority = 203,
    CoreSwapProhibited = 204,
    CoreAmountTooLowForFee = 205,
    CoreBridgeToTheZeroAddress = 206,
    CoreEmptyRecipient = 207,
    CoreSourceNotRegistered = 208,
    CoreWrongDestinationChain = 209,
    CoreUnknownAnotherChain = 210,
    CoreTokensAlreadySent = 211,
    CoreMessageProcessed = 212,
    CoreNotEnoughFee = 214,
    CoreNoMessage = 215,
    CoreNoReceivePool = 216,
    CoreNoPool = 217,
    CoreUnknownAnotherToken = 218,

    // Messenger
    CoreWrongByteLength = 300,
    CoreHasMessage = 301,
    CoreInvalidPrimarySignature = 302,
    CoreInvalidSecondarySignature = 303,

    // Gas Oracle
    CoreNoGasDataForChain = 400,
}
