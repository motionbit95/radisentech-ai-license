import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { AxiosPut } from "../api";
const GenerateModal = (props) => {
  const { title, type, disabled, data, onComplete, setLoading } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };

  const onFinish = (values) => {
    setLoading(true);
    AxiosPut(`/company/update-license/${data?.user_id}`, values)
      .then((response) => {
        // 업데이트에 성공하면 아래 구문 실행
        console.log(response);
        setLoading(false);
        form.resetFields();
        setModalOpen(false);
        onComplete(values);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <>
      <Button
        disabled={disabled}
        type={type}
        onClick={() => setModalOpen(true)}
      >
        {title}
      </Button>
      <Modal
        title={title}
        centered
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Generate
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={onFinish}
          hideRequiredMark
          {...formItemLayout}
        >
          <Form.Item
            initialValue={data?.company_name}
            name="company_name"
            label="Company"
            rules={[{ required: true, message: "Please input company" }]}
          >
            <Input disabled placeholder="Company" />
          </Form.Item>
          <Form.Item
            label="License No."
            name="license_cnt"
            rules={[{ required: true, message: "Please input license number" }]}
          >
            <InputNumber className="w-full" placeholder="License No. Input" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default GenerateModal;
