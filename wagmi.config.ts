import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";
import address from "./ignition/deployments/chain-31337/deployed_addresses.json";

export default defineConfig({
  out: "web/src/generated.ts",
  plugins: [
    hardhat({
      project: "./",
      // 获取部署地址
      deployments: {
        YexiyueToken: address["YexiyueTokenModule#YexiyueToken"] as any,
        Exchange: address["Exchange#Exchange"] as any,
      },
      commands: {
        clean: "pnpm hardhat clean",
        build: "pnpm hardhat compile",
        rebuild: "pnpm hardhat compile",
      },
    }),
    react(),
  ],
});
