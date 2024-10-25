import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
const UpdateLicense = (props) => {
  const { title, type, disabled, data } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [license, setLicense] = useState({});

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

  useEffect(() => {
    if (!data) return;
    setLicense({ ...data, expire_date: dayjs(data?.expire_date) });
  }, [data]);

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
            Update
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={onFinish}
          hideRequiredMark
          {...formItemLayout}
          initialValues={license}
        >
          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: "Please input company" }]}
          >
            <Input placeholder="Company" disabled />
          </Form.Item>
          <Form.Item
            name="key"
            label="License Key"
            rules={[{ required: true, message: "Please input key" }]}
          >
            <Input placeholder="License Key" disabled />
          </Form.Item>
          <Form.Item
            label="Expire Date"
            name="expire_date"
            rules={[{ required: true, message: "Please input expire date" }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default UpdateLicense;
