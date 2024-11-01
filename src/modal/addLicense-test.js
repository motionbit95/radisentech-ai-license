import { Button, DatePicker, Form, Input, Modal, message } from "antd";
import axios from "axios";
import React, { useState } from "react";

const ADDLicense = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 라이선스 추가 요청 함수
  const addLicense = async (values) => {
    // localStorage에서 토큰 가져오기
    try {
      await axios.post(
        "/license/add",
        {
          ...values,
          LocalActivateStartDate: values.LocalActivateStartDate.format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          LocalTerminateDate: values.LocalTerminateDate.format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          UTCActivateStartDate: values.UTCActivateStartDate.format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          UTCTerminateDate: values.UTCTerminateDate.format(
            "YYYY-MM-DD HH:mm:ss"
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Authorization 헤더 추가
          },
        }
      );
      message.success("License added successfully.");
      form.resetFields();
      setAddModalOpen(false);
    } catch (error) {
      message.error("Failed to add license.");
      console.error("Error adding license:", error); // 에러 로그 추가
    }
  };
  // 폼 제출 시 실행되는 함수
  const onAddFinish = (values) => {
    addLicense(values); // 추가 요청
  };
  return (
    <>
      {/* 라이선스 추가 버튼 */}
      <Button type="primary" onClick={() => setAddModalOpen(true)}>
        ADD
      </Button>

      {/* 추가 모달 */}
      <Modal
        title="ADD License"
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
            name="DealerCompany"
            label="Dealer Company"
            rules={[{ required: true, message: "Please input Dealer Company" }]}
          >
            <Input placeholder="Dealer Company" />
          </Form.Item>
          <Form.Item
            name="Company"
            label="Company"
            rules={[{ required: true, message: "Please input Company" }]}
          >
            <Input placeholder="Company" />
          </Form.Item>
          <Form.Item
            name="Country"
            label="Country"
            rules={[{ required: true, message: "Please input Country" }]}
          >
            <Input placeholder="Country" />
          </Form.Item>
          <Form.Item
            name="AIType"
            label="AI Type"
            rules={[{ required: true, message: "Please input AI Type" }]}
          >
            <Input placeholder="AI Type" />
          </Form.Item>
          <Form.Item
            name="Hospital"
            label="Hospital"
            rules={[{ required: true, message: "Please input Hospital" }]}
          >
            <Input placeholder="Hospital" />
          </Form.Item>
          <Form.Item
            name="UserEmail"
            label="User Email"
            rules={[{ type: "email", message: "Please input a valid email!" }]}
          >
            <Input placeholder="User Email" />
          </Form.Item>
          <Form.Item name="HardWareInfo" label="Hardware Info">
            <Input placeholder="Hardware Info" />
          </Form.Item>
          <Form.Item name="DetectorSerialNumber" label="Detector Serial Number">
            <Input placeholder="Detector Serial Number" />
          </Form.Item>
          <Form.Item
            label="Local Activate Start Date"
            name="LocalActivateStartDate"
            rules={[
              {
                required: true,
                message: "Please select Local Activate Start Date",
              },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="Local Terminate Date"
            name="LocalTerminateDate"
            rules={[
              { required: true, message: "Please select Local Terminate Date" },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="UTC Activate Start Date"
            name="UTCActivateStartDate"
            rules={[
              {
                required: true,
                message: "Please select UTC Activate Start Date",
              },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="UTC Terminate Date"
            name="UTCTerminateDate"
            rules={[
              { required: true, message: "Please select UTC Terminate Date" },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="ActivateCount"
            label="Activate Count"
            rules={[{ required: true, message: "Please input Activate Count" }]}
          >
            <Input placeholder="Activate Count" type="number" />
          </Form.Item>
          <Form.Item name="UniqueCode" label="Unique Code">
            <Input placeholder="Unique Code" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ADDLicense;
