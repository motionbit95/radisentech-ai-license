import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  message,
} from "antd";
import dayjs from "dayjs";
import { AxiosPut } from "../api";

const UpdateLicense = (props) => {
  const { title, type, disabled, data, onComplete, onCancel } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // data가 변경될 때마다 폼 필드에 값을 설정
    form.setFieldsValue({
      company: data?.Company || "",
      sirial_number: data?.DetectorSerialNumber || "",
      expire_date: data?.UTCTerminateDate ? dayjs(data.UTCTerminateDate) : null, // ExpireDate를 dayjs 객체로 변환
    });
  }, [data]);

  const onReset = () => {
    form.setFieldsValue({
      company: data?.Company || "",
      sirial_number: data?.DetectorSerialNumber || "",
      expire_date: data?.UTCTerminateDate ? dayjs(data.UTCTerminateDate) : null, // ExpireDate를 dayjs 객체로 변환
    });
  };

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

  const onFinish = async (values) => {
    try {
      const { expire_date } = values; // 폼에서 가져온 expire_date
      const pk = data.pk; // data에서 pk 가져오기

      console.log({
        localTime: dayjs().format("YYYY-MM-DD HH:mm:ss"), // 로컬 시간 (사용자의 현재 시간대 기준)
        utcTime: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"), // UTC 시간
        localExpireDate: expire_date
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss"), // 로컬 시간
        utcExpireDate: expire_date
          .add(1, "day")
          .utc()
          .format("YYYY-MM-DD HH:mm:ss"), // UTC 시간
        UniqueCode: data.UniqueCode,
      });

      AxiosPut(`/license/update-subscription/${pk}`, {
        localTime: dayjs().format("YYYY-MM-DD HH:mm:ss"), // 로컬 시간 (사용자의 현재 시간대 기준)
        utcTime: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"), // UTC 시간
        localExpireDate: expire_date
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss"), // 로컬 시간
        utcExpireDate: expire_date
          .utc()
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss"), // UTC 시간
        UniqueCode: data.UniqueCode,
      })
        .then((response) => {
          // 성공 메시지 표시
          message.success(response.data.message);

          // 완료 콜백 호출 (필요 시)
          if (onComplete) {
            onComplete();
          }

          // 모달 닫기
          setModalOpen(false);
          form.resetFields();
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      message.error("Update failed. Please try again."); // 오류 메시지 표시
    }
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
        onCancel={() => {
          setModalOpen(false);
          onReset();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              onReset();
              setModalOpen(false);
            }}
          >
            Cancel
          </Button>,
          <Popconfirm
            title="Are you sure you want to expire date update?"
            onConfirm={() => form.submit()}
          >
            <Button key="submit" type="primary">
              Update
            </Button>
          </Popconfirm>,
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
            <Input placeholder="Company" disabled />
          </Form.Item>
          {/* <Form.Item
            name="sirial_number"
            label="S/N"
            rules={[{ required: true, message: "Please input key" }]}
          >
            <Input placeholder="License Key" disabled />
          </Form.Item> */}
          <Form.Item
            label="Expire Date"
            name="expire_date"
            rules={[{ required: true, message: "Please input expire date" }]}
          >
            <DatePicker format={"MM-DD-YYYY"} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default UpdateLicense;
