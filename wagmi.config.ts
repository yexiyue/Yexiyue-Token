// 导入定义配置的函数
import { defineConfig } from "@wagmi/cli";
// 导入hardhat和react插件
import { hardhat, react } from "@wagmi/cli/plugins";
// 导入部署的地址信息
import address from "./ignition/deployments/chain-31337/deployed_addresses.json";

// 定义配置信息
export default defineConfig({
  // 输出文件路径
  out: "web/src/generated.ts",
  // 使用的插件列表
  plugins: [
    // 配置hardhat插件
    hardhat({
      project: "./", // 项目路径
      // 部署合约的地址配置
      deployments: {
        YexiyueToken: address["YexiyueTokenModule#YexiyueToken"] as any,
        Exchange: address["Exchange#Exchange"] as any,
      },
      // 定义命令及其执行脚本
      commands: {
        clean: "pnpm hardhat clean", // 清理命令
        build: "pnpm hardhat compile", // 构建命令
        rebuild: "pnpm hardhat compile", // 重新构建命令
      },
    }),
    // 配置react插件
    react(),
  ],
});