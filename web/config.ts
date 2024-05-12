import { createStorage, cookieStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { hardhat, mainnet } from "wagmi/chains";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

export const config = defaultWagmiConfig({
  projectId,
  chains: [mainnet, hardhat],
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableEmail: true,
});
