import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("YexiyueToken", function () {
  it("Deployment", async function () {
    const contract = await hre.viem.deployContract("YexiyueToken", [], {
      value: parseEther("1"),
    });
    // 总共10个，取了第一二个
    const [owner, otherWallet] = await hre.viem.getWalletClients();

    const publicClient = await hre.viem.getPublicClient();

    const res = await publicClient.readContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "balanceOf",
      args: [owner.account.address],
    });

    expect(res).to.equal(parseEther("1000000"));

    const balance2 = await publicClient.readContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "balanceOf",
      args: [otherWallet.account.address],
    });
    expect(balance2).to.equal(parseEther("0"));

    await owner.writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "transfer",
      args: [otherWallet.account.address, parseEther("100")],
    });

    expect(
      await publicClient.readContract({
        abi: contract.abi,
        address: contract.address,
        functionName: "balanceOf",
        args: [otherWallet.account.address],
      })
    ).to.equal(parseEther("100"));
  });

  it("exchange", async () => {
    const [owner, otherWallet] = await hre.viem.getWalletClients();
    const yexiyueToken = await hre.viem.deployContract("YexiyueToken", [], {
      value: parseEther("1"),
    });
    const exchange = await hre.viem.deployContract(
      "Exchange",
      [owner.account.address, 10n],
      {
        value: parseEther("1"),
      }
    );

    // 先授权
    await yexiyueToken.write.approve([exchange.address, 1000n], {
      account: owner.account.address,
    });
    // 再存钱
    await exchange.write.depositToken([yexiyueToken.address, 1000n], {
      account: owner.account.address,
    });

    expect(
      await exchange.read.tokens([yexiyueToken.address, owner.account.address])
    ).equal(1000n);

    await exchange.write.withdraw([yexiyueToken.address, 100n], {
      account: owner.account.address,
    });
    expect(
      await exchange.read.tokens([yexiyueToken.address, owner.account.address])
    ).equal(900n);
  });
});
