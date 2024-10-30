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
    // if (!timerActive || expirationTime) {
    //   // 타이머가 비활성화된 경우
    //   message.error("Authentication time has expired. Please try again.");
    //   form.resetFields(); // 데이터 초기화
    //   setOpenCodeInput(false);
    //   return;
    // }

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
          // navigate("/resetPw"); // 비밀번호 재설정 화면으로 이동
        }
      } catch (error) {
        message.error("Code is incorrect. Please try again.");
      }
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
    </div>
  );
};

export default ForgotPw;
