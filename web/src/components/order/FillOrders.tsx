import { ETHER_ADDRESS } from "@/hooks/useBalances";
import { Orders, useOrderStore } from "@/stores/useOrderStore";
import { Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import day from "dayjs";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

export const FillOrders = () => {
  const { address } = useAccount();
  if (!address) return null;
  const [{ fillOrders }] = useOrderStore((store) => [store.orders]);

  const columns: ColumnsType<Orders[number]["args"]> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      width: 40,
      render: (time) => {
        return (
          <Typography.Text
            ellipsis={{
              tooltip: {
                title: day(Number(time) * 1000).format("YYYY-MM-DD HH:mm:ss"),
              },
            }}
          >
            {day(Number(time) * 1000).format("YYYY-MM-DD HH:mm:ss")}
          </Typography.Text>
        );
      },
      sorter: (a, b) => Number(a.timestamp) - Number(b.timestamp),
    },
    {
      title: "获取",
      width: 25,
      render: (_, record) => {
        return (
          <Typography.Text
            type="warning"
            ellipsis={{
              tooltip: { title: formatEther(record.giveToken?.amount!) },
            }}
          >
            {formatEther(record.giveToken?.amount!)}{" "}
            {record.giveToken?.token === ETHER_ADDRESS ? "ETH" : "YXT"}
          </Typography.Text>
        );
      },
      sorter: (a, b) =>
        Number(a.giveToken?.amount) - Number(b.giveToken?.amount),
    },
    {
      title: "支出",
      width: 25,
      render: (_, record) => {
        return (
          <Typography.Text
            type="success"
            ellipsis={{
              tooltip: { title: formatEther(record.getToken?.amount!) },
            }}
          >
            {formatEther(record.getToken?.amount!)}{" "}
            {record.getToken?.token === ETHER_ADDRESS ? "ETH" : "YXT"}
          </Typography.Text>
        );
      },
      sorter: (a, b) => Number(a.getToken?.amount) - Number(b.getToken?.amount),
    },
  ];
  return (
    <Table<Orders[number]["args"]>
      rowKey={(record) => record.id!}
      columns={columns}
      dataSource={fillOrders.map((order) => {
        return order.args;
      })}
    />
  );
};
