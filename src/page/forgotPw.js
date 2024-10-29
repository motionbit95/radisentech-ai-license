import { Button, Col, Form, Input, Space } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

const ForgotPw = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [openCodeInput, setOpenCodeInput] = useState(false);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);

    setOpenCodeInput(true);

    if (openCodeInput) {
      console.log("Code: ", values.code);
      //   navigate("/login");
    }
  };
  return (
    <div className="center">
      <Form
        form={form}
        name="forgot_pw"
        style={{
          minWidth: 360,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="user_name"
          //   label="User Name"
          rules={[
            {
              required: true,
              message: "Please input your name!",
              whitespace: true,
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="User Name" />
        </Form.Item>
        <Form.Item
          name="email"
          //   label="E-mail"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="E-mail" />
        </Form.Item>

        {openCodeInput && (
          <>
            <h1>Check your email!</h1>
            <Form.Item>
              <PinInput
                length={6}
                onComplete={(code) => {
                  console.log("Code: ", code);
                }}
              />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Button block type="primary" htmlType="submit">
            {openCodeInput ? "Submit" : "Get Code"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPw;

const PinInput = ({ length, onComplete }) => {
  const [values, setValues] = useState(Array(length).fill(""));

  const handleChange = (value, index) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value) {
      // 다음 필드로 포커스 이동
      if (index < length - 1) {
        document.getElementById(`pin-input-${index + 1}`).focus();
      }
    } else {
      // 값이 삭제될 때 이전 필드로 포커스 이동
      if (index > 0) {
        document.getElementById(`pin-input-${index - 1}`).focus();
      }
    }

    // 모든 입력이 완료되었을 때 onComplete 호출
    if (newValues.every((v) => v !== "")) {
      onComplete && onComplete(newValues.join(""));
    }
  };

  return (
    <Space>
      {values.map((_, index) => (
        <Input
          key={index}
          id={`pin-input-${index}`}
          value={values[index]}
          onChange={(e) => handleChange(e.target.value, index)}
          maxLength={1}
          style={{
            width: 40,
            height: 40,
            textAlign: "center",
            fontSize: "1.2em",
          }}
        />
      ))}
    </Space>
  );
};
