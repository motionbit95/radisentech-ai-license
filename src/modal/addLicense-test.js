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
import React, { useEffect, useState } from "react";
import { AxiosPost } from "../api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const ADDLicense = (props) => {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 라이선스 추가 요청 함수
  const addLicense = async (values) => {
    console.log("Received values of form: ", values.date_range);
    // 시간 데이터 변환
    const dates = {
      LocalActivateStartDate: values.date_range[0].format("YYYY-MM-DD"),
      LocalTerminateDate: values.date_range[1].format("YYYY-MM-DD"),
      UTCActivateStartDate: values.date_range[0].toDate().toISOString(),
      UTCTerminateDate: values.date_range[1].toDate().toISOString(),
    };

    try {
      // 추가 요청
      const response = await AxiosPost(
        "/license/add",
        { ...values, ...dates },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT 토큰 추가
          },
        }
      ).catch((error) => {
        message.error(error.response.data.error);
      });
      // 성공 메시지 표시
      message.success(response.data.message);

      // 모달 닫기
      setAddModalOpen(false);

      props.onAddFinish();
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
      }
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="DealerCompany"
                label="Dealer Company"
                rules={[
                  { required: true, message: "Please input Dealer Company" },
                ]}
              >
                <Input placeholder="Dealer Company" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Company"
                label="Company"
                rules={[{ required: true, message: "Please input Company" }]}
              >
                <Input placeholder="Company" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Country"
                label="Country"
                rules={[{ required: true, message: "Please input Country" }]}
              >
                <Input placeholder="Country" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="AIType"
                label="AI Type"
                rules={[{ required: true, message: "Please input AI Type" }]}
              >
                <Input placeholder="AI Type" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="Hospital"
                label="Hospital"
                rules={[{ required: true, message: "Please input Hospital" }]}
              >
                <Input placeholder="Hospital" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="UserEmail"
                label="User Email"
                rules={[
                  { type: "email", message: "Please input a valid email!" },
                ]}
              >
                <Input placeholder="User Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="UserName" label="User Name">
                <Input placeholder="User Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="HardWareInfo" label="Hardware Info">
            <Input placeholder="Hardware Info" />
          </Form.Item>
          <Form.Item name="DetectorSerialNumber" label="Detector Serial Number">
            <Input placeholder="Detector Serial Number" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Activate Date Range"
                name="date_range"
                rules={[
                  {
                    required: true,
                    message: "Please select end date",
                  },
                ]}
              >
                <CustomRangePicker
                  onChange={(value) =>
                    form.setFieldsValue({ date_range: value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="UniqueCode"
            label="Unique Code"
            rules={[{ required: true, message: "Please input Unique Code" }]}
          >
            <Input placeholder="Unique Code" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const CustomRangePicker = (props) => {
  const { onChange } = props;
  // 오늘 날짜를 시작 날짜로 설정
  const today = dayjs();
  const [dates, setDates] = useState([today, null]);

  // 종료 날짜의 유효성 검사
  const validateEndDate = (date) => {
    const currentTime = dayjs();
    if (date && date.isBefore(currentTime)) {
      message.error("종료 날짜는 현재 시간 이후만 선택할 수 있습니다.");
      return false;
    }
    return true;
  };

  const handleChange = (value) => {
    if (value && value[1]) {
      // 종료 날짜가 현재 시간 이전인지 검사
      if (!validateEndDate(value[1])) {
        setDates([today, null]); // 유효하지 않은 경우 초기화
        return;
      }
    }

    onChange(value);
    setDates(value);
  };

  return (
    <DatePicker.RangePicker
      value={dates}
      onChange={handleChange}
      disabled={[true, false]} // 시작 날짜는 비활성화
      disabledDate={(current) => current && current < today.startOf("day")} // 시작 날짜: 오늘 이전은 선택 불가
      format="YYYY-MM-DD"
      style={{ width: "100%" }}
    />
  );
};

export default ADDLicense;
