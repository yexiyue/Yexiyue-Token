import { useBalances } from "@/hooks/useBalances";
import { Card, Col, Row, Statistic } from "antd";
import { formatEther } from "viem";

type BalanceProps = {
  address: `0x${string}`;
};

export const Balance = ({ address }: BalanceProps) => {
  const { etherBalance, YXTBalance, exchangeETHBalance, exchangeYXTBalance } =
    useBalances({ address });
  return (
    <Row
      gutter={16}
      style={{
        marginTop: 16,
      }}
    >
      <Col span={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="以太坊余额"
            value={formatEther(etherBalance?.value || 0n)}
            precision={3}
            valueStyle={{ color: "#3f8600" }}
            suffix="ETH"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="YXT余额"
            value={formatEther(YXTBalance || 0n)}
            precision={3}
            valueStyle={{ color: "#cf1322" }}
            suffix="YXT"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="交易所中ETH余额"
            value={formatEther(exchangeETHBalance || 0n)}
            precision={3}
            valueStyle={{ color: "#cf1322" }}
            suffix="ETH"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="交易所中YXT余额"
            value={formatEther(exchangeYXTBalance || 0n)}
            precision={3}
            valueStyle={{ color: "#cf1322" }}
            suffix="YXT"
          />
        </Card>
      </Col>
    </Row>
  );
};
