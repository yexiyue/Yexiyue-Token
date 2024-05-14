import { Card, Col, Row } from "antd";
import { FillOrders } from "./FillOrders";
import { MyCreateOrders } from "./MyCreateOrders";
import { OtherOrders } from "./OtherOrders";
import { useOrderStore } from "@/stores/useOrderStore";
import {
  useWatchExchangeCancelEvent,
  useWatchExchangeOrderEvent,
  useWatchExchangeTradeEvent,
} from "@/generated";

export const Order = () => {
  const [setOrders] = useOrderStore((store) => [store.setOrders]);

  useWatchExchangeOrderEvent({
    fromBlock: 0n,
    onLogs: (logs) => {
      setOrders({ allOrders: logs });
    },
  });

  useWatchExchangeCancelEvent({
    fromBlock: 0n,
    onLogs: (logs) => {
      setOrders({ cancelOrders: logs });
    },
  });

  useWatchExchangeTradeEvent({
    fromBlock: 0n,
    onLogs: (logs) => {
      setOrders({ fillOrders: logs });
    },
  });

  return (
    <Row
      gutter={16}
      style={{
        marginTop: 16,
      }}
    >
      <Col span={8}>
        <Card bordered={false} title="已完成订单">
          <FillOrders />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} title="创建的订单(交易中)">
          <MyCreateOrders />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} title="其他人的订单(交易中)">
          <OtherOrders />
        </Card>
      </Col>
    </Row>
  );
};
