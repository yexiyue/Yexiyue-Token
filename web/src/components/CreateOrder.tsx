import { useWriteExchangeMakeOrder, yexiyueTokenAddress } from "@/generated";
import { ETHER_ADDRESS } from "@/hooks/useBalances";
import {
  App,
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  SelectProps,
} from "antd";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

export const tokenOptions: SelectProps["options"] = [
  {
    label: "ETH",
    value: ETHER_ADDRESS,
  },
  {
    label: "YXT",
    value: yexiyueTokenAddress,
  },
];

export const CreateOrder = () => {
  const [form] = Form.useForm();
  const getToken = Form.useWatch("getToken", form);
  const { message } = App.useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    form.setFieldValue(
      "giveToken",
      tokenOptions?.filter((item) => item.value !== getToken).at(0)?.value
    );
  }, [getToken]);

  const {
    data: hash,
    writeContract,
    isPending,
    error,
  } = useWriteExchangeMakeOrder();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (error && hash) {
      message.open({
        content: "交易失败",
        key: "confirm",
        type: "error",
      });
    }
  }, [error]);

  useEffect(() => {
    if (hash && isConfirmed) {
      message.open({
        content: "交易成功",
        key: "confirm",
        type: "success",
      });
      setVisible(false);
    }
  }, [isConfirmed, isConfirming]);

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        创建订单
      </Button>
      <Modal
        open={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        destroyOnClose
        onOk={async () => {
          const res = await form.validateFields();
          writeContract({
            args: [
              {
                token: res.getToken,
                amount: parseEther(String(res.getAmount)),
              },
              {
                token: res.giveToken,
                amount: parseEther(String(res.giveAmount)),
              },
            ],
          });
          message.open({
            content: "确认交易中...",
            key: "confirm",
            type: "loading",
            duration: 0,
          });
        }}
        centered
        title="创建订单"
        okButtonProps={{
          loading: isPending || isConfirming,
        }}
        okText="创建订单"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="getToken"
            label="要获取的Token"
            initialValue={ETHER_ADDRESS}
          >
            <Select options={tokenOptions} placeholder="选择要获取的Token" />
          </Form.Item>

          <Form.Item name="getAmount" label="要获取的数量">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入要获取的数量"
            />
          </Form.Item>

          <Form.Item name="giveToken" label="要支付的Token">
            <Select
              options={tokenOptions.map((item) => ({
                ...item,
                disabled: item.value === getToken,
              }))}
              placeholder="选择要支付的Token"
            />
          </Form.Item>

          <Form.Item name="giveAmount" label="要支付的数量">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入要支付的数量"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
