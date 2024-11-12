import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  message,
} from "antd";
import React, { useState } from "react";
import { AxiosPost, log } from "../api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const ProductAdd = (props) => {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 폼 제출 시 실행되는 함수
  const onAddFinish = async (values) => {
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
        title="ADD Product"
        centered
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setAddModalOpen(false)}>
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
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Please enter product name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Product Description"
            rules={[
              { required: true, message: "Please enter product description" },
            ]}
          >
            <Input.TextArea placeholder="Please enter product description" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductAdd;
