import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Modal } from "antd";
const GenerateModal = (props) => {
  const { title, type, disabled } = props;
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
    console.log("Received values of form: ", values);

    form.resetFields();
    setModalOpen(false);
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
            name="company"
            label="Company"
            rules={[{ required: true, message: "Please input company" }]}
          >
            <Input placeholder="Company" />
          </Form.Item>
          <Form.Item
            label="License No."
            name="license_no"
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
