import {
  exchangeAddress,
  useReadExchangeBalanceOf,
  useReadYexiyueTokenAllowance,
  useReadYexiyueTokenBalanceOf,
  yexiyueTokenAddress,
} from "@/generated";
import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { useBalance } from "wagmi";
export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * 使用指定地址查询各种代币和以太币的余额以及授权情况。
 * @param { {address: `0x${string}`}} 参数 - 包含要查询余额的地址。
 * @returns 返回一个对象，包含以太币余额、YXT代币余额、交易所中的以太币余额、
 * 交易所中的YXT代币余额、刷新查询的方法和判断余额是否溢出的方法。
 */
export const useBalances = ({ address }: { address: `0x${string}` }) => {
  // 使用react-query获取queryClient实例
  const queryClient = useQueryClient();
  // 使用wagmi查询以太币余额
  const { data: etherBalance, queryKey: etherBalanceQueryKey } = useBalance({
    address,
  });
  // 查询YXT代币余额
  const { data: YXTBalance, queryKey: YXTBalanceQueryKey } =
    useReadYexiyueTokenBalanceOf({
      args: [address],
    });
  // 查询交易所中的以太币余额
  const { data: exchangeETHBalance, queryKey: exchangeETHBalanceQueryKey } =
    useReadExchangeBalanceOf({
      args: [ETHER_ADDRESS, address],
    });
  // 查询交易所中的YXT代币余额
  const { data: exchangeYXTBalance, queryKey: exchangeYXTBalanceQueryKey } =
    useReadExchangeBalanceOf({
      args: [yexiyueTokenAddress, address],
    });

  // 查询地址对交易所的YXT授权额度
  const { data: YXTAllowance, queryKey: YXTAllowanceQueryKey } =
    useReadYexiyueTokenAllowance({
      args: [address, exchangeAddress],
    });

  // 编写一个memoized函数，用于刷新所有相关查询
  const invalidateQueries = useMemoizedFn(() => {
    queryClient.invalidateQueries({
      queryKey: etherBalanceQueryKey,
    });
    queryClient.invalidateQueries({
      queryKey: exchangeETHBalanceQueryKey,
    });
    queryClient.invalidateQueries({
      queryKey: exchangeYXTBalanceQueryKey,
    });
    queryClient.invalidateQueries({
      queryKey: YXTBalanceQueryKey,
    });
    queryClient.invalidateQueries({
      queryKey: YXTAllowanceQueryKey,
    });
  });

  // 编写一个memoized函数，用于检查余额是否溢出
  const isOverflowedBalance = useMemoizedFn((balance?: bigint) => {
    if (YXTAllowance !== undefined && exchangeYXTBalance !== undefined) {
      if (!balance) {
        return [
          exchangeYXTBalance >= YXTAllowance,
          exchangeYXTBalance,
        ] as const;
      } else {
        const newAllowance = balance + exchangeYXTBalance!;
        return [newAllowance >= YXTAllowance, newAllowance] as const;
      }
    }

    return [false, 0n] as const;
  });
  return {
    etherBalance,
    YXTBalance,
    exchangeETHBalance,
    exchangeYXTBalance,
    invalidateQueries,
    isOverflowedBalance,
  };
};
