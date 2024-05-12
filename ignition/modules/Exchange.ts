import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

export default buildModule("Exchange", (m) => {
  const owner = m.getAccount(1);
  const exchange = m.contract("Exchange", [owner, 10n], {
    value: parseEther("1"),
  });

  return {
    exchange,
  };
});
