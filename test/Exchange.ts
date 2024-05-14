import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

// 定义以太坊地址常量
const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

// 描述交易所测试套件
describe("Exchange", function () {
  // 初始化函数，用于部署合约和准备测试环境
  async function init() {
    // 获取钱包客户端
    const [owner, first, second, third] = await hre.viem.getWalletClients();
    // 部署 YexiyueToken 合约
    const yexiyueToken = await hre.viem.deployContract("YexiyueToken");
    // 部署 Exchange 合约，指定交易所的管理员地址和初始ETH余额
    const exchange = await hre.viem.deployContract("Exchange", [
      third.account.address,
      10n,
    ]);
    // 获取公共客户端
    const publicClient = await hre.viem.getPublicClient();
    // 返回部署的合约和钱包实例
    return {
      owner,
      first,
      second,
      yexiyueToken,
      exchange,
      publicClient,
    };
  }

  // 测试部署合约是否成功
  it("should deploy", async () => {
    expect(init()).fulfilled;
  });

  // 测试转账和授权功能，以及在交易所进行存款和创建订单的操作
  it("should transfer", async () => {
    // 初始化合约和钱包实例
    const { owner, first, second, yexiyueToken, exchange, publicClient } =
      await init();

    // 转账 YXT 给 first 和 second 账户
    await owner.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "transfer",
      args: [first.account.address, parseEther("200")],
    });
    await owner.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "transfer",
      args: [second.account.address, parseEther("200")],
    });

    // first 账户授权 exchange 合约操作其 YXT
    await first.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "approve",
      args: [exchange.address, parseEther("100")],
    });

    // first 账户向 exchange 存入 YXT
    await first.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "depositToken",
      args: [yexiyueToken.address, parseEther("100")],
    });

    // first 和 second 账户向 exchange 存入 ETH
    await first.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "depositEther",
      args: [],
      value: parseEther("100"),
    });
    await second.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "depositEther",
      args: [],
      value: parseEther("100"),
    });

    // 验证余额是否正确
    expect(
      await publicClient.readContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "balanceOf",
        args: [yexiyueToken.address, first.account.address],
      })
    ).equal(parseEther("100"));

    expect(
      await publicClient.readContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "balanceOf",
        args: [ETHER_ADDRESS, second.account.address],
      })
    ).equal(parseEther("100"));

    // first 账户创建订单
    await first.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "makeOrder",
      args: [
        { token: ETHER_ADDRESS, amount: parseEther("10") },
        { token: yexiyueToken.address, amount: parseEther("10") },
      ],
    });

    // 验证订单数量
    expect(
      await publicClient.readContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "orderCount",
        args: [],
      })
    ).equal(1n);

    // 尝试取消订单（非订单创建者）
    expect(
      second.writeContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "cancelOrder",
        args: [1n],
      })
    ).rejected;

    // 订单创建者成功取消订单
    expect(
      first.writeContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "cancelOrder",
        args: [1n],
      })
    ).fulfilled;

    // second 账户填充订单
    await second.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "fillOrder",
      args: [1n],
    });

    // 验证 second 账户的 ETH 余额是否正确
    expect(
      await publicClient.readContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "balanceOf",
        args: [ETHER_ADDRESS, second.account.address],
      })
    ).equal(parseEther("89"));
  });
});