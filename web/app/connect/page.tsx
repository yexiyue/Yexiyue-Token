"use client";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "antd";
import { useAccount } from "wagmi";

export default function Connect() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  console.log(address);
  return (
    <div>
      <Button onClick={() => open()}>Connect</Button>
    </div>
  );
}
