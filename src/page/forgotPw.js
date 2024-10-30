import { Button, Col, Form, Input, Space, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailOutlined, UserOutlined, UnlockOutlined } from "@ant-design/icons";
import axios from "axios";

const ForgotPw = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [openCodeInput, setOpenCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expirationTime, setExpirationTime] = useState(300); // 5분 (300초)
  const [timerActive, setTimerActive] = useState(false);
  const [resetpwForm, setResetpwForm] = useState(true);

  //타이머
  const startTimer = () => {
    setTimerActive(true);
    const timer = setInterval(() => {
      setExpirationTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimerActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (openCodeInput) {
      startTimer();
    }
  }, [openCodeInput]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const onFinish = async (values) => {
    if (!openCodeInput) {
      // 1. 이메일로 코드 발송
      setLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/mailer/sendEmail`,
          {
            to: values.email,
          }
        );

        if (response.status === 200) {
          message.success("Code sent to your email.");
          setOpenCodeInput(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error sending email: ", error);
        message.error("Failed to send code. Please try again.");
      }
    } else {
      // 2. 코드가 일치하는지 확인
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/mailer/validateCode`,
          {
            email: values.email,
            code: values.code,
          }
        );

        if (response.status === 200) {
          message.success("Code is correct. Please set your new password.");
          setResetpwForm(true);
        }
      } catch (error) {
        message.error("Code is incorrect. Please try again.");
      }
    }
  };
  return (
    <div className="center">
      {!resetpwForm ? (
        <Form
          form={form}
          name="forgot_pw"
          style={{
            minWidth: 360,
          }}
          onFinish={onFinish}
        >
          {loading && <Spin size="large" />}
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
              <Input
                prefix={<UnlockOutlined />}
                placeholder="Code"
                suffix={
                  <div type="danger" style={{ marginLeft: 10, opacity: 0.4 }}>
                    {timerActive ? `${formatTime(expirationTime)}` : "0:00"}
                  </div>
                }
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              {openCodeInput ? "Submit" : "Get Code"}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <ResetpwForm />
      )}
    </div>
  );
};

export default ForgotPw;

const ResetpwForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  return (
    <Form
      form={form}
      name="reset_pw"
      style={{
        minWidth: 360,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="current"
        label="Current Password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The new password that you entered do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="new"
        label="New Password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
          {
            validator: (_, value) => {
              if (!value || value.length < 8) {
                return Promise.reject(
                  new Error("Password must be at least 8 characters long.")
                );
              }
              if (!/[!@#$%^&*]/.test(value)) {
                return Promise.reject(
                  new Error(
                    "Password must contain at least one special character."
                  )
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
