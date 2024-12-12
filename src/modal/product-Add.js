import { Button, Form, Input, Modal, Select, message } from "antd";
import React, { useState } from "react";
import { AxiosPost } from "../api";
import { useNavigate } from "react-router-dom";

const ProductAdd = (props) => {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 폼 제출 시 실행되는 함수
  const onAddFinish = async (values) => {
    console.log("Received values:", values);
    try {
      // 서버에 데이터 전송
      const result = await AxiosPost("/product/add", {
        ...values,
      }).catch((error) => {
        message.error(error.response.data.error);
      });

      // 성공 시 메시지 표시
      if (result.status === 200) {
        message.success("Product registered successfully");
        setAddModalOpen(false);
        form.resetFields();
        props.onComplete(); // 목록 새로 고침 등 추가 작업이 필요할 경우 호출
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/login");
      } else {
        message.error("Error registering product");
        console.error("Error:", error);
      }
    }
  };
  return (
    <>
      <Button
        type="primary"
        disabled={props.disabled}
        onClick={() => setAddModalOpen(true)}
      >
        ADD
      </Button>

      {/* 추가 모달 */}
      <Modal
        title="ADD AI Type"
        centered
        open={addModalOpen}
        onCancel={() => {
          form.resetFields();
          setAddModalOpen(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              form.resetFields();
              setAddModalOpen(false);
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Add
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={onAddFinish}
          hideRequiredMark
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="AI Type Name"
            rules={[{ required: true, message: "Please enter AI Type name" }]}
          >
            <Input placeholder="Please enter AI Type name" />
          </Form.Item>
          <Form.Item name="description" label="AI Type Description">
            <Input.TextArea placeholder="Please enter AI Type description" />
          </Form.Item>
          <Form.Item name="limit_month" label="Month">
            <Select placeholder="Please select limit months">
              <Select.Option value={1}>1 month</Select.Option>
              <Select.Option value={2}>2 months</Select.Option>
              <Select.Option value={3}>3 months</Select.Option>
              <Select.Option value={6}>6 months</Select.Option>
              <Select.Option value={12}>1 year</Select.Option>
              <Select.Option value={24}>2 years</Select.Option>
              <Select.Option value={36}>3 years</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductAdd;
