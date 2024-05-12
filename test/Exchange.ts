import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Exchange", function () {
  async function init() {
    const [owner, first, second, third] = await hre.viem.getWalletClients();
    const yexiyueToken = await hre.viem.deployContract("YexiyueToken");
    const exchange = await hre.viem.deployContract("Exchange", [
      third.account.address,
      10n,
    ]);
    const publicClient = await hre.viem.getPublicClient();
    return {
      owner,
      first,
      second,
      yexiyueToken,
      exchange,
      publicClient,
    };
  }

  it("should deploy", async () => {
    expect(init()).fulfilled;
  });

  it("should transfer", async () => {
    const { owner, first, second, yexiyueToken, exchange, publicClient } =
      await init();
    // 往第一个账号转200YXT
    await owner.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "transfer",
      args: [first.account.address, parseEther("200")],
    });
    // 往第二个账号转200YXT
    await owner.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "transfer",
      args: [second.account.address, parseEther("200")],
    });

    // 授权给交易所100
    await first.writeContract({
      address: yexiyueToken.address,
      abi: yexiyueToken.abi,
      functionName: "approve",
      args: [exchange.address, parseEther("100")],
    });
    // 第一个账号存款100YXT
    await first.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "depositToken",
      args: [yexiyueToken.address, parseEther("100")],
    });

    // 两个账号分别往交易所存100ETH
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
    // 账号一创建订单
    await first.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "makeOrder",
      args: [
        { token: ETHER_ADDRESS, amount: parseEther("10") },
        { token: yexiyueToken.address, amount: parseEther("10") },
      ],
    });

    expect(
      await publicClient.readContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "orderCount",
        args: [],
      })
    ).equal(1n);

    // 取消订单
    // 不是订单创建者，取消失败
    expect(
      second.writeContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "cancelOrder",
        args: [1n],
      })
    ).rejected;
    expect(
      first.writeContract({
        address: exchange.address,
        abi: exchange.abi,
        functionName: "cancelOrder",
        args: [1n],
      })
    ).fulfilled;

    await second.writeContract({
      address: exchange.address,
      abi: exchange.abi,
      functionName: "fillOrder",
      args: [1n],
    });

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
