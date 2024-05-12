import Link from "next/link";
import Balance from "./components/Balance";
import Order from "./components/Order";

export default function Home() {
  return (
    <div>
      <Link href="/connect">connect</Link>
      <Balance />
      <Order />
    </div>
  );
}
