// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IBridge, MessengerProtocol} from "../interfaces/IBridge.sol";

contract TestBridge is IBridge {
    uint public chainId;
    mapping(bytes32 messageHash => uint isProcessed) public override processedMessages;
    mapping(bytes32 messageHash => uint isSent) public override sentMessages;
    mapping(uint chainId => bytes32 bridgeAddress) public override otherBridges;
    mapping(uint chainId => mapping(bytes32 tokenAddress => bool isSupported)) public override otherBridgeTokens;
    address private constant poolAddress = address(0xb001a7fA1CF346e7917C0568b3f193f6e32408A7);

    event SwapAndBridgeEvent(
        bytes32 token,
        uint amount,
        bytes32 recipient,
        uint destinationChainId,
        bytes32 receiveToken,
        uint nonce,
        MessengerProtocol messenger,
        uint feeTokenAmount,
        uint value
    );
    event SwapEvent(uint amount, bytes32 token, bytes32 receiveToken, address recipient, uint receiveAmountMin);
    event Received(address sender, uint amount);

    constructor() {}

    function swap(
        uint _amount,
        bytes32 _token,
        bytes32 _receiveToken,
        address _recipient,
        uint _receiveAmountMin
    ) external {
        ERC20(address(uint160(uint(_token)))).transferFrom(msg.sender, poolAddress, _amount);
        emit SwapEvent(_amount, _token, _receiveToken, _recipient, _receiveAmountMin);
    }

    function swapAndBridge(
        bytes32 _token,
        uint _amount,
        bytes32 _recipient,
        uint _destinationChainId,
        bytes32 _receiveToken,
        uint _nonce,
        MessengerProtocol _messenger,
        uint _feeTokenAmount
    ) external payable override {
        ERC20(address(uint160(uint(_token)))).transferFrom(msg.sender, poolAddress, _amount);
        emit SwapAndBridgeEvent(
            _token,
            _amount,
            _recipient,
            _destinationChainId,
            _receiveToken,
            _nonce,
            _messenger,
            _feeTokenAmount,
            msg.value
        );
    }

    function receiveTokens(
        uint _amount,
        bytes32 _recipient,
        uint _sourceChainId,
        bytes32 _receiveToken,
        uint _nonce,
        MessengerProtocol _messenger,
        uint _receiveAmountMin
    ) external payable override {}

    function withdrawGasTokens(uint _amount) external override {}

    function registerBridge(uint _chainId, bytes32 _bridgeAddress) external override {}

    function addBridgeToken(uint _chainId, bytes32 _tokenAddress) external override {}

    function removeBridgeToken(uint _chainId, bytes32 _tokenAddress) external override {}

    function getBridgingCostInTokens(
        uint _destinationChainId,
        MessengerProtocol _messenger,
        address _tokenAddress
    ) external pure override returns (uint) {
        return 1000;
    }

    function hashMessage(
        uint _amount,
        bytes32 _recipient,
        uint _sourceChainId,
        uint _destinationChainId,
        bytes32 _receiveToken,
        uint _nonce,
        MessengerProtocol _messenger
    ) external pure override returns (bytes32) {
        return 0;
    }

    function canSwap() external view returns (uint8) {
        return 1;
    }

    fallback() external payable {
        revert("Unsupported");
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
