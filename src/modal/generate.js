import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
} from "antd";
import { AxiosGet, AxiosPost, AxiosPut, log } from "../api";
const GenerateModal = (props) => {
  const {
    title,
    type,
    disabled,
    data,
    onComplete,
    setLoading,
    onCancel,
    aiType,
  } = props;
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

  useEffect(() => {
    console.log(aiType);
  }, [modalOpen]);

  const onFinish = (values) => {
    if (
      values.license_cnt < 0 &&
      data?.license_cnt - data?.use_cnt < Math.abs(values.license_cnt)
    ) {
      message.error(
        `You can't generate license more than ${
          data?.license_cnt - data?.use_cnt
        }`
      );
      return;
    }

    console.log(values, data.id);

    AxiosPost("/company/update-license-cnt", {
      license_cnt: values.license_cnt,
      company_pk: data.id,
      ai_type: values.AIType,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // 현재 로그인한 사용자의 pk 가져오기
    AxiosGet("/company/user-info")
      .then((response) => {
        if (response.status === 200) {
          const admin_id = response.data.id;
          setLoading(true);
          AxiosPut(`/company/update-license/${data?.id}`, {
            ...values,
            description: "Generated",
            canceled: 0,
            admin_id,
            ai_type: values.AIType, // 타입도 구분
          })
            .then((response) => {
              // 업데이트에 성공하면 아래 구문 실행
              log(response);
              setLoading(false);
              form.resetFields();
              setModalOpen(false);
              onComplete(values);
            })
            .catch((error) => {
              log(error);
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        console.log(error);
        message.error("Failed to generate license. Please try again.");
      });
  };

  return (
    <>
      <Button
        disabled={disabled || !aiType || aiType?.length === 0}
        type={type}
        onClick={() => setModalOpen(true)}
      >
        {title}
      </Button>
      <Modal
        title={
          title
          // <div
          //   style={{
          //     display: "flex",
          //     justifyContent: "space-between",
          //     marginTop: "20px",
          //   }}
          // >
          //   <div>{title}</div>
          //   <div>
          //     {data?.use_cnt} / {data?.license_cnt - data?.use_cnt} /{" "}
          //     {data.license_cnt}
          //   </div>
          // </div>
        }
        centered
        open={modalOpen}
        onCancel={() => {
          form.resetFields();
          setModalOpen(false);
        }}
        footer={[
          <Space>
            <Button
              key="back"
              onClick={() => {
                form.resetFields();
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Popconfirm
              title="Are you sure to generate license?"
              onConfirm={() => form.submit()}
              okText="Yes"
              cancelText="No"
            >
              <Button key="submit" type="primary">
                Generate
              </Button>
            </Popconfirm>
          </Space>,
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
          <Form.Item name="AIType" label="AI Type">
            <Select>
              {aiType?.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
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
