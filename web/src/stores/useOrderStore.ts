import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type OrderStoreState = {
  orders: {
    allOrders: any[];
    fillOrders: any[];
    cancelOrders: any[];
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
