import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const yexiyueToken = buildModule("YexiyueTokenModule", (m) => {
  const contract = m.contract("YexiyueToken", [], {
    value: parseEther("100"),
  });
  return {
    yexiyueToken: contract,
  };
});

export default yexiyueToken;
