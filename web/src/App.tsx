import { useAccount } from "wagmi";
import { Balance } from "./components/Balance";
import { CreateOrder } from "./components/CreateOrder";
import { Deposit } from "./components/Deposit";
import { Withdraw } from "./components/Withdraw";
import { Order } from "./components/order";

function App() {
  const { address } = useAccount();
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <w3m-button size="sm" />
        {address && <Deposit />}
        {address && <Withdraw />}
        {address && <CreateOrder />}
      </div>
      {address && <Balance address={address} />}
      <Order />
    </div>
  );
}

export default App;
