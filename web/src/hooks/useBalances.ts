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

export const useBalances = ({ address }: { address: `0x${string}` }) => {
  const queryClient = useQueryClient();
  const { data: etherBalance, queryKey: etherBalanceQueryKey } = useBalance({
    address,
  });
  const { data: YXTBalance, queryKey: YXTBalanceQueryKey } =
    useReadYexiyueTokenBalanceOf({
      args: [address],
    });
  const { data: exchangeETHBalance, queryKey: exchangeETHBalanceQueryKey } =
    useReadExchangeBalanceOf({
      args: [ETHER_ADDRESS, address],
    });
  const { data: exchangeYXTBalance, queryKey: exchangeYXTBalanceQueryKey } =
    useReadExchangeBalanceOf({
      args: [yexiyueTokenAddress, address],
    });

  // 注意调用的接口参数
  const { data: YXTAllowance, queryKey: YXTAllowanceQueryKey } =
    useReadYexiyueTokenAllowance({
      args: [address, exchangeAddress],
    });

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
