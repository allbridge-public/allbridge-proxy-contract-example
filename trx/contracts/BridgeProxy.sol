// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {MessengerProtocol, IBridge} from "./interfaces/IBridge.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title Bridge Proxy
 * @notice Enables partner integration by forwarding calls to Allbridge Core bridge, while charging fees, and can mark
 *         the transaction with unique partner ID.
 */
contract BridgeProxy is Ownable {
    /**
     * @notice target bridge to forward calls to.
     */
    IBridge public bridge;

    /**
     * @notice the number of basis points that will be deducted as a fee from transferred amount.
     */
    uint public feeBP;
    uint private constant BP = 10000;
    uint private immutable PARTNER_ID;

    event TransferStarted(uint partnerId);

    constructor(address _bridge, uint _partnerId) payable Ownable(msg.sender) {
        bridge = IBridge(_bridge);
        PARTNER_ID = _partnerId;
    }

    /**
     * @notice Swap a given pair of tokens on the same blockchain.
     * @param _amount The amount of tokens to be swapped.
     * @param _token The token to be swapped.
     * @param _receiveToken The token to receive in exchange for the swapped token.
     * @param _recipient The address to receive the tokens.
     * @param _receiveAmountMin The minimum amount of tokens required to receive during the swap.
     */
    function swap(
        uint _amount,
        bytes32 _token,
        bytes32 _receiveToken,
        address _recipient,
        uint _receiveAmountMin
    ) external {
        ERC20 token = ERC20(address(uint160(uint(_token))));
        token.transferFrom(msg.sender, address(this), _amount);
        uint amountAfterFee = _amount - (_amount * feeBP / BP);
        bridge.swap(amountAfterFee, _token, _receiveToken, _recipient, _receiveAmountMin);
        emit TransferStarted(PARTNER_ID);
    }

    /**
     * @notice Initiate a swap and bridge process of a given token for a token on another blockchain.
     * @dev This function is used to initiate a cross-chain transfer. The specified amount of token is first transferred
     * to the pool on the current chain, and then an event `TokensSent` is emitted to signal that tokens have been sent
     * on the source chain. See the function `receiveTokens`.
     * The bridging fee required for the cross-chain transfer can be paid in two ways:
     * - by sending the required amount of native gas token along with the transaction
     *   (See `getTransactionCost` in the `GasUsage` contract and `getMessageCost` in the `MessengerGateway` contract).
     * - by setting the parameter `feeTokenAmount` with the bridging fee amount in the source tokens
     *   (See `getBridgingCostInTokens`).
     * @param _token The token to be swapped.
     * @param _amount The amount of tokens to be swapped (including `feeTokenAmount`).
     * @param _recipient The address of token recipient on the destination chain.
     * @param _destinationChainId The ID of the destination chain.
     * @param _receiveToken The token to receive in exchange for the swapped token.
     * @param _nonce An identifier that is used to ensure that each transfer is unique and can only be processed once.
     * @param _messenger The chosen way of delivering the message across chains.
     * @param _feeTokenAmount The amount of tokens to be deducted from the transferred amount as a bridging fee.
     *
     */
    function swapAndBridge(
        bytes32 _token,
        uint _amount,
        bytes32 _recipient,
        uint _destinationChainId,
        bytes32 _receiveToken,
        uint _nonce,
        MessengerProtocol _messenger,
        uint _feeTokenAmount
    ) external payable {
        require(_amount > _feeTokenAmount, "amount too low for fee");
        ERC20 token = ERC20(address(uint160(uint(_token))));
        token.transferFrom(msg.sender, address(this), _amount);
        uint transferAmount = _amount - _feeTokenAmount;
        uint amountAfterFee = _amount - (transferAmount * feeBP / 10000);

        bridge.swapAndBridge{value: msg.value}(
            _token,
            amountAfterFee,
            _recipient,
            _destinationChainId,
            _receiveToken,
            _nonce,
            _messenger,
            _feeTokenAmount
        );
        emit TransferStarted(PARTNER_ID);
    }

    /**
     * @notice Enables swaps with the given token.
     * @param _token token address.
     */
    function setupToken(ERC20 _token) external onlyOwner {
        _token.approve(address(bridge), type(uint256).max);
    }

    /**
     * @notice Set new target bridge address.
     * @param _bridge new bridge address.
     */
    function setBridge(address _bridge) external onlyOwner {
        bridge = IBridge(_bridge);
    }

    /**
     * @notice Set fee rate.
     * @param _feeBP new rate in basis points.
     */
    function setFeeBP(uint _feeBP) external onlyOwner {
        feeBP = _feeBP;
    }

    /**
     * @notice Withdraw all collected fee.
     * @param _token The address of the token contract.
     */
    function withdrawCollectedTokens(ERC20 _token) external onlyOwner {
        uint toWithdraw = _token.balanceOf(address(this));
        if (toWithdraw > 0) {
            _token.transfer(msg.sender, toWithdraw);
        }
    }

    fallback(bytes calldata _data) external payable returns (bytes memory) {
        (bool success, bytes memory result) = address(bridge).call{value: msg.value}(_data);

        if (!success) {
            assembly {
                revert(add(32, result), mload(result))
            }
        }
        return result;
    }

    receive() external payable {}
}
