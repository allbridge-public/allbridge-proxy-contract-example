import {
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BridgeProxy', function () {
  const partnerId = 1000;

  async function deployContractsFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const tokenDecimals = 18;
    const amount = ethers.parseUnits('1000000000', tokenDecimals);
    const Token = await ethers.getContractFactory('Token');
    const token = await Token.deploy('TestToken', 'TT', amount, tokenDecimals);

    const TestBridge = await ethers.getContractFactory('TestBridge');
    const testBridge = await TestBridge.deploy();

    const BridgeProxy = await ethers.getContractFactory('BridgeProxy');
    const proxy = await BridgeProxy.deploy(testBridge.target, partnerId);

    await token.approve(proxy, ethers.MaxUint256);

    return { proxy, testBridge, token, owner, otherAccount, tokenDecimals };
  }

  describe('Deployment', function () {
    it('Should set the bridge', async function () {
      const { proxy, testBridge } = await loadFixture(
        deployContractsFixture,
      );

      expect(await proxy.bridge()).to.equal(testBridge.target);
    });
  });

  describe('swap', function () {
    const receiveToken = '0x000000000000000000000000a9541e599dc00a7b6f16d2785ec13b4a375b0a3c';
    const recipient = '0x68dE616Ad99812946c4EA907b0D4898CeFa4e9D9';

    it('Should call the bridge#swap', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);
      const amount = ethers.parseUnits('1', tokenDecimals);
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swap(amount, tokenAddressBytes, receiveToken, recipient, amount);
      await expect(tx).to.emit(testBridge, 'SwapEvent').withArgs(
        amount, tokenAddressBytes, receiveToken, recipient, amount
      );
    });

    it('Should charge fee', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);
      await proxy.setFeeBP(10); // 0.1%

      const amount = ethers.parseUnits('1', tokenDecimals);
      const expectedAmount = ethers.parseUnits('0.999', tokenDecimals); // amount - 0.1%
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swap(amount, tokenAddressBytes, receiveToken, recipient, amount);
      await expect(tx).to.emit(testBridge, 'SwapEvent').withArgs(
        expectedAmount, tokenAddressBytes, receiveToken, recipient, amount
      );
    });

    it('Should mark tx with partner ID', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);
      const amount = ethers.parseUnits('1', tokenDecimals);
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swap(amount, tokenAddressBytes, receiveToken, recipient, amount);
      await expect(tx).to.emit(proxy, 'TransferStarted').withArgs(
        partnerId
      );
    });
  });

  describe('swapAndBridge', function () {
    const receiveToken = '0x000000000000000000000000a9541e599dc00a7b6f16d2785ec13b4a375b0a3c';
    const nonce = '0xd8d66546b414d0622e8defe471459577160117b9e478406cd039610da59d539a';
    const recipient = '0x00000000000000000000000068de616ad99812946c4ea907b0d4898cefa4e9d9';
    const destinationChainId = 2;
    const messengerProtocol = 1;
    const value = ethers.parseEther('0.0001');

    it('Should call the bridge#swapAndBridge', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);

      const amount = ethers.parseUnits('1', tokenDecimals);
      const feeTokenAmount = ethers.parseUnits('0.05', tokenDecimals);
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swapAndBridge(tokenAddressBytes, amount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, { value: value });
      await expect(tx).to.emit(testBridge, 'SwapAndBridgeEvent').withArgs(
        tokenAddressBytes, amount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, value
      );
    });

    it('Should charge fee', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);
      await proxy.setFeeBP(10); // 0.1%

      const amount = ethers.parseUnits('1', tokenDecimals);
      const feeTokenAmount = 0;
      const expectedAmount = ethers.parseUnits('0.999', tokenDecimals); // amount - 0.1%
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swapAndBridge(tokenAddressBytes, amount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, { value: value });
      await expect(tx).to.emit(testBridge, 'SwapAndBridgeEvent').withArgs(
        tokenAddressBytes, expectedAmount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, value
      );
    });

    it('Should charge fee from transfer amount', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);
      await proxy.setFeeBP(10); // 0.1%

      const totalAmount = ethers.parseUnits('1', tokenDecimals);
      const feeTokenAmount = ethers.parseUnits('0.5', tokenDecimals);
      const fee = ethers.parseUnits('0.0005', tokenDecimals); // (totalAmount - feeTokenAmount) * 0.1%
      const expectedAmount = totalAmount - fee; // 0.9995
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swapAndBridge(tokenAddressBytes, totalAmount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, { value: value });
      await expect(tx).to.emit(testBridge, 'SwapAndBridgeEvent').withArgs(
        tokenAddressBytes, expectedAmount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, value
      );
    });

    it('Should mark tx with partner ID', async function () {
      const { proxy, testBridge, token, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      await proxy.setupToken(token);

      const amount = ethers.parseUnits('1', tokenDecimals);
      const feeTokenAmount = ethers.parseUnits('0.05', tokenDecimals);
      const tokenAddressBytes = ethers.zeroPadValue(await token.getAddress(), 32);
      const tx = await proxy.swapAndBridge(tokenAddressBytes, amount, recipient, destinationChainId, receiveToken, nonce, messengerProtocol, feeTokenAmount, { value: value });
      await expect(tx).to.emit(proxy, 'TransferStarted').withArgs(
        partnerId
      );
    });
  });

  describe('setupToken', function () {
    it('Should set allowance on token to the bridge', async function () {
      const { proxy, testBridge, token } = await loadFixture(
        deployContractsFixture,
      );

      expect(await token.allowance(proxy.target, testBridge.target)).to.equal(0);
      await proxy.setupToken(token.target);
      expect(await token.allowance(proxy.target, testBridge.target)).to.equal(ethers.MaxUint256);
    });

    it('Should revert when caller is not the owner', async function () {
      const { proxy, token, otherAccount } = await loadFixture(
        deployContractsFixture,
      );
      const response = proxy.connect(otherAccount).setupToken(token.target);
      await expect(response).to.be.revertedWithCustomError(
        proxy,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe('setBridge', function () {
    const newBridge = '0xb54bB3dCB21C0D41E1649513B64371b6aa7b2c23';

    it('Should set bridge', async function () {
      const { proxy } = await loadFixture(
        deployContractsFixture,
      );

      await proxy.setBridge(newBridge);
      expect(await proxy.bridge()).to.equal(newBridge);
    });

    it('Should revert when caller is not the owner', async function () {
      const { proxy, otherAccount } = await loadFixture(
        deployContractsFixture,
      );
      const response = proxy.connect(otherAccount).setBridge(newBridge);
      await expect(response).to.be.revertedWithCustomError(
        proxy,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe('setFeeBP', function () {
    it('Should set fee BP', async function () {
      const { proxy } = await loadFixture(
        deployContractsFixture,
      );

      await proxy.setFeeBP(150);
      expect(await proxy.feeBP()).to.equal(150);
    });

    it('Should revert when caller is not the owner', async function () {
      const { proxy, otherAccount } = await loadFixture(
        deployContractsFixture,
      );
      const response = proxy.connect(otherAccount).setFeeBP(150);
      await expect(response).to.be.revertedWithCustomError(
        proxy,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe('fallback call', function () {
    it('Should forward the call to bridge and return the result', async function () {
      const { proxy, testBridge, token } = await loadFixture(
        deployContractsFixture,
      );
      const data = testBridge.interface.encodeFunctionData('getBridgingCostInTokens', [2, 1, await token.getAddress()]);
      const result = await ethers.provider.call({
        to: await proxy.getAddress(),
        data: data,
      });
      const decodedResult = testBridge.interface.decodeFunctionResult('getBridgingCostInTokens', result)[0];
      expect(decodedResult).to.equal(1000);
    });
  });

  describe('withdrawCollectedTokens', function () {
    it('Should withdraw collected fee', async function () {
      const { proxy, token, owner, tokenDecimals } = await loadFixture(
        deployContractsFixture,
      );
      const amount = ethers.parseUnits('100', tokenDecimals);
      await token.transfer(proxy.target, amount);

      await expect(proxy.withdrawCollectedTokens(token)).to.changeTokenBalances(
        token,
        [proxy.target, owner.address],
        ["-" + amount, amount]
      );
    });

    it('Should revert when caller is not the owner', async function () {
      const { proxy, token, otherAccount } = await loadFixture(
        deployContractsFixture,
      );
      const response = proxy.connect(otherAccount).withdrawCollectedTokens(token);
      await expect(response).to.be.revertedWithCustomError(
        proxy,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
