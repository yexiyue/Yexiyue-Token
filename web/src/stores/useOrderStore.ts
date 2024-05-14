import { exchangeAbi } from "@/generated";
import { GetLogsReturnType, ExtractAbiItem } from "viem";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Orders = GetLogsReturnType<
  ExtractAbiItem<typeof exchangeAbi, "Order">
>;
export type Trades = GetLogsReturnType<
  ExtractAbiItem<typeof exchangeAbi, "Trade">
>;
export type Cancels = GetLogsReturnType<
  ExtractAbiItem<typeof exchangeAbi, "Cancel">
>;

type OrderStoreState = {
  orders: {
    allOrders: Orders;
    fillOrders: Trades;
    cancelOrders: Cancels;
  };
  setOrders: (orders: Partial<OrderStoreState["orders"]>) => void;
};

export const useOrderStore = create(
  devtools(
    immer<OrderStoreState>((set) => ({
      orders: {
        allOrders: [],
        fillOrders: [],
        cancelOrders: [],
      },
      setOrders: (orders) =>
        set((state) => ({ orders: { ...state.orders, ...orders } })),
    }))
  )
);
