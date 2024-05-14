import { useWriteExchange } from "@/generated";
import { ETHER_ADDRESS, useBalances } from "@/hooks/useBalances";
import { App, Button, Form, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { tokenOptions } from "./CreateOrder";

export const Withdraw = () => {
  const [open, setOpen] = useState(false);
  const { address } = useAccount();
  const { message } = App.useApp();
  if (!address) return null;
  const { exchangeETHBalance, exchangeYXTBalance, invalidateQueries } =
    useBalances({
      address,
    });

  const [form] = Form.useForm();
  const token = Form.useWatch("token", form);
  const {
    data: hash,
    writeContract: withdraw,
    isPending,
    error,
  } = useWriteExchange();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && isSuccess) {
      message.open({
        content: "交易成功",
        key: "withdraw",
        type: "success",
      });
      setOpen(false);
      invalidateQueries();
      form.resetFields();
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error && hash) {
      message.open({
        content: "取款失败",
        key: "withdraw",
        type: "error",
      });
    }
  }, [error]);

  const onOk = async () => {
    const res = await form.validateFields();
    if (token === ETHER_ADDRESS) {
      withdraw({
        functionName: "withdrawEther",
        args: [parseEther(String(res.amount))],
        account: address,
      });
    } else {
      withdraw({
        functionName: "withdraw",
        args: [res.token, parseEther(String(res.amount))],
        account: address,
      });
    }
    message.open({
      content: "发送交易中",
      key: "withdraw",
      type: "loading",
      duration: 0,
    });
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        取款
      </Button>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        title="取款"
        centered
        onOk={onOk}
        cancelText="取消"
        okText={isPending ? "发送交易中" : isLoading ? "交易确认中" : "取款"}
        okButtonProps={{
          loading: isPending || isLoading,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="取款的Token"
            name="token"
            rules={[
              {
                required: true,
                message: "请选择要取款的Token",
              },
            ]}
          >
            <Select options={tokenOptions} placeholder="选择要取款的Token" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="要取款的数量"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (value === undefined || value === null) {
                    return Promise.reject("请输入要取款的数量");
                  }
                  if (value <= 0) {
                    return Promise.reject("请输入大于0的数量");
                  }
                  if (
                    token === ETHER_ADDRESS &&
                    value > Number(formatEther(exchangeETHBalance || 0n))
                  ) {
                    return Promise.reject("交易所中的ETH余额不足");
                  } else if (
                    token !== ETHER_ADDRESS &&
                    value > Number(formatEther(exchangeYXTBalance || 0n))
                  ) {
                    return Promise.reject("交易所中的YXT余额不足");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入要取款的数量"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
