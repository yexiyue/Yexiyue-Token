import { useOrderStore } from "@/stores/useOrderStore";
import { useMemo } from "react";

export const useOrders = () => {
  const [{ fillOrders, allOrders, cancelOrders }] = useOrderStore((store) => [
    store.orders,
  ]);

  const cancelOrdersIdSet = useMemo(() => {
    return new Set(cancelOrders.map((order) => order.args.id));
  }, [cancelOrders]);
  const fillOrdersIdSet = useMemo(() => {
    return new Set(fillOrders.map((order) => order.args.id));
  }, [allOrders]);

  const ordersInTransactionsData = useMemo(() => {
    return allOrders.filter(
      (order) =>
        !cancelOrdersIdSet.has(order.args.id) &&
        !fillOrdersIdSet.has(order.args.id)
    );
  }, [allOrders, cancelOrdersIdSet]);

  return { ordersInTransactionsData };
};
