import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("YexiyueToken", function () {
  // 测试YexiyueToken合约的部署和基本功能。

  it("Deployment", async function () {
    // 测试合约的部署。
    const contract = await hre.viem.deployContract("YexiyueToken", [], {
      value: parseEther("1"),
    });
    // 部署YexiyueToken合约，并向其发送1个以太币。

    const [owner, otherWallet] = await hre.viem.getWalletClients();
    // 获取两个钱包客户端，一个作为合约所有者，另一个作为其他用户。

    const publicClient = await hre.viem.getPublicClient();
    // 获取公共客户端，用于读取合约状态。

    const res = await publicClient.readContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    // 读取合约所有者的余额。

    expect(res).to.equal(parseEther("1000000"));
    // 期望合约所有者的余额为1000000个代币。

    const balance2 = await publicClient.readContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "balanceOf",
      args: [otherWallet.account.address],
    });
    // 读取其他用户的余额。

    expect(balance2).to.equal(parseEther("0"));
    // 期望其他用户的余额为0。

    await owner.writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "transfer",
      args: [otherWallet.account.address, parseEther("100")],
    });
    // 合约所有者向其他用户转账100个代币。

    expect(
      await publicClient.readContract({
        abi: contract.abi,
        address: contract.address,
        functionName: "balanceOf",
        args: [otherWallet.account.address],
      })
    ).to.equal(parseEther("100"));
    // 期望转账后其他用户的余额为100个代币。
  });

  it("exchange", async () => {
    // 测试Exchange合约与YexiyueToken合约的交互。
    const [owner, otherWallet] = await hre.viem.getWalletClients();
    // 获取两个钱包客户端。

    const yexiyueToken = await hre.viem.deployContract("YexiyueToken", [], {
      value: parseEther("1"),
    });
    // 部署YexiyueToken合约。

    const exchange = await hre.viem.deployContract(
      "Exchange",
      [owner.account.address, 10n],
      {
        value: parseEther("1"),
      }
    );
    // 部署Exchange合约，并设置交易费用账户和费用百分比。

    // 先授权
    await yexiyueToken.write.approve([exchange.address, 1000n], {
      account: owner.account.address,
    });
    // 合约所有者授权Exchange合约从其账户中转移1000个代币。

    // 再存钱
    await exchange.write.depositToken([yexiyueToken.address, 1000n], {
      account: owner.account.address,
    });
    // 合约所有者向Exchange合约存入1000个代币。

    expect(
      await exchange.read.tokens([yexiyueToken.address, owner.account.address])
    ).equal(1000n);
    // 期望Exchange合约记录的合约所有者的代币余额为1000。

    await exchange.write.withdraw([yexiyueToken.address, 100n], {
      account: owner.account.address,
    });
    // 合约所有者从Exchange合约提取100个代币。

    expect(
      await exchange.read.tokens([yexiyueToken.address, owner.account.address])
    ).equal(900n);
    // 期望提取后Exchange合约记录的合约所有者的代币余额为900。
  });
});
