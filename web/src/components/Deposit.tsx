import {
  exchangeAddress,
  useWriteExchange,
  useWriteYexiyueTokenApprove,
} from "@/generated";
import { ETHER_ADDRESS, useBalances } from "@/hooks/useBalances";
import { App, Button, Form, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { tokenOptions } from "./CreateOrder";

export const Deposit = () => {
  const [open, setOpen] = useState(false);
  const { address } = useAccount();
  const { message, modal } = App.useApp();
  if (!address) return null;
  const { invalidateQueries, etherBalance, YXTBalance, isOverflowedBalance } =
    useBalances({
      address,
    });

  const [form] = Form.useForm();
  const token = Form.useWatch("token", form);
  const {
    data: hash,
    writeContract: deposit,
    isPending,
    error,
  } = useWriteExchange();
  const { writeContractAsync: approve } = useWriteYexiyueTokenApprove();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && isSuccess) {
      message.open({
        content: "交易成功",
        key: "deposit",
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
        content: "存款失败",
        key: "deposit",
        type: "error",
      });
    }
  }, [error]);

  const onOk = async () => {
    const res = await form.validateFields();
    if (token === ETHER_ADDRESS) {
      deposit({
        functionName: "depositEther",
        value: parseEther(String(res.amount)),
        account: address,
      });
    } else {
      const [shouldApprove, approveAmount] = isOverflowedBalance(
        parseEther(String(res.amount))
      );

      if (shouldApprove) {
        await modal.confirm({
          title: "是否授权",
          content: `是否授权(${formatEther(approveAmount)})YXT 给交易所`,
          onOk: async () => {
            await approve({
              args: [exchangeAddress, approveAmount],
            });
          },
        });
      }
      deposit({
        functionName: "depositToken",
        args: [res.token, parseEther(String(res.amount))],
        account: address,
      });
    }
    message.open({
      content: "发送交易中",
      key: "deposit",
      type: "loading",
      duration: 0,
    });
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        存款
      </Button>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        title="存款"
        centered
        onOk={onOk}
        cancelText="取消"
        okText={isPending ? "发送交易中" : isLoading ? "交易确认中" : "存款"}
        okButtonProps={{
          loading: isPending || isLoading,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="存入的Token"
            name="token"
            rules={[
              {
                required: true,
                message: "请选择要存入的Token",
              },
            ]}
          >
            <Select options={tokenOptions} placeholder="选择要存入的Token" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="要存入的数量"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (value === undefined || value === null) {
                    return Promise.reject("请输入要存入的数量");
                  }
                  if (value <= 0) {
                    return Promise.reject("请输入大于0的数量");
                  }
                  if (
                    token === ETHER_ADDRESS &&
                    value > Number(formatEther(etherBalance?.value || 0n))
                  ) {
                    return Promise.reject("ETH余额不足");
                  } else if (
                    token !== ETHER_ADDRESS &&
                    value > Number(formatEther(YXTBalance || 0n))
                  ) {
                    return Promise.reject("YXT余额不足");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入要存入的数量"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
