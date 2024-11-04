import { Button, Col, Form, Input, Result, Space, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailOutlined, UserOutlined, UnlockOutlined } from "@ant-design/icons";
import { SmileOutlined } from "@ant-design/icons";
import { AxiosPost } from "../api";

const ForgotPw = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [openCodeInput, setOpenCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expirationTime, setExpirationTime] = useState(300); // 5분 (300초)
  const [timerActive, setTimerActive] = useState(false);
  const [resetpwForm, setResetpwForm] = useState(false);
  const [savedUserId, setSavedUserId] = useState("");
  const [isResetPW, setIsResetPW] = useState(false);

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
      // 1. 유저ID, 이메일의 유무 확인 이후 이메일 발송
      setLoading(true);
      AxiosPost("/company/request-reset-code", {
        user_id: values.user_id,
        email: values.email,
      })
        .then((response) => {
          if (response.status === 200) {
            message.success("Code sent to your email.");
            setSavedUserId(values.user_id);
            setOpenCodeInput(true);
            setLoading(false);
          }
        })
        .catch((error) => {
          message.error("Failed to send code. Please try again.");
          setLoading(false);
          form.resetFields();
          console.error("Error sending email: ", error);
        });
    } else if (!resetpwForm) {
      // 2. 코드가 일치하는지 확인
      setLoading(true);

      console.log("Received values of form: ", values);

      AxiosPost("/company/verify-code", {
        user_id: savedUserId,
        authCode: values.code,
      })
        .then((response) => {
          if (response.status === 200) {
            const token = response.data.token;
            localStorage.setItem("token", token); // JWT 토큰 저장
            setSavedUserId(values.user_id);

            message.success("Code is correct. Please set your new password.");
            setLoading(false);
            setResetpwForm(true);
          }
        })
        .catch((error) => {
          message.error("Code is incorrect. Please try again.");
          setLoading(false);
          form.resetFields();
          console.error("Error verifying code: ", error);
        });
    } else {
      // 3. 새로운 비밀번호 제출
      setLoading(true);

      AxiosPost("/company/reset-password", {
        user_id: savedUserId,
        new_password: values.new,
      })
        .then((response) => {
          if (response.status === 200) {
            message.success("Password updated successfully.");
            setIsResetPW(true);
            setLoading(false);
          }
        })
        .catch((error) => {
          message.error("Failed to reset password. Please try again.");
          console.error("Error resetting password:", error);
        });
    }
  };

  return (
    <div className="center">
      {isResetPW ? (
        <Result
          icon={<SmileOutlined />}
          title="Successfully changed password!"
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          }
        />
      ) : (
        <>
          {!resetpwForm ? (
            <Form
              form={form}
              name="forgot_pw"
              style={{
                minWidth: 360,
              }}
              onFinish={onFinish}
            >
              <Spin
                size="large"
                spinning={loading}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 999,
                }}
              />
              <Form.Item
                name="user_id"
                rules={[
                  {
                    required: true,
                    message: "Please input your name!",
                    whitespace: true,
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="User ID" />
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
                      <div
                        type="danger"
                        style={{ marginLeft: 10, opacity: 0.4 }}
                      >
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
            <Form
              layout="vertical"
              form={form}
              name="reset_pw"
              style={{
                minWidth: 360,
              }}
              onFinish={onFinish}
            >
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
                          new Error(
                            "Password must be at least 8 characters long."
                          )
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
              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={["new"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The new password that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button block type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </>
      )}
    </div>
  );
};

export default ForgotPw;
