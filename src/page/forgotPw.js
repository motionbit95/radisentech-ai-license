import { Button, Col, Form, Input, Space } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailOutlined, UserOutlined, UnlockOutlined } from "@ant-design/icons";

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
          <Form.Item
            name="code"
            //   label="Code"
            rules={[
              {
                required: true,
                message: "Please input your code!",
              },
            ]}
          >
            <Input prefix={<UnlockOutlined />} placeholder="Code" />
          </Form.Item>
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
