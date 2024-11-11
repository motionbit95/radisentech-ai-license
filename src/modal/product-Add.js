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
  const onAddFinish = (values) => {};
  return (
    <>
      <Button disabled={props.disabled} onClick={() => setAddModalOpen(true)}>
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
        ></Form>
      </Modal>
    </>
  );
};

export default ProductAdd;
