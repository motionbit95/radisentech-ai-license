import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Result,
  Row,
  Select,
  Spin,
  message,
} from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AxiosGet, AxiosPost } from "../api";

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
const SignUp = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isRegistered, setIsRegistered] = useState(false);
  const [ischeckedId, setIsCheckedId] = useState(false);
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isCheckedEmail, setIsCheckedEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    setLoading(true);

    // if (!ischeckedId) {
    //   message.error("Please check the ID before submitting.");
    //   return;
    // }

    // Id 체크, Email 인증 확인 후 진행
    if (isCheckedEmail && ischeckedId) {
      AxiosPost("/company/add", values)
        .then((response) => {
          if (response.status === 200) {
            setIsRegistered(true);
            setLoading(false);
          }
        })
        .catch((error) => {
          message.error(error.response.data.message);
          setLoading(false);
        });
    } else {
      message.error("Please check the ID and Email before submitting.");
      setLoading(false);
    }
  };

  // ID 중복 체크
  const handleCheckDuplicateId = async () => {
    setLoading(true);
    // userId 필드가 유효할 때만 중복 체크 실행
    const isValid = await form
      .validateFields(["user_id"])
      .then(() => true)
      .catch(() => false);

    if (!isValid) {
      return setIsCheckedId(false), setLoading(false); // 유효하지 않으면 함수 종료
    }

    const userId = form.getFieldValue("user_id");

    AxiosGet(`/company/check-user-id/${userId}`)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          message.success(response.data.message);
          setIsCheckedId(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        message.error(error.response.data.message);
        setIsCheckedId(false);
        setLoading(false);
      });
  };

  const sendEmailCode = () => {
    setLoading(true);
    AxiosPost("/company/send-code", {
      user_id: form.getFieldValue("user_id"),
      email: form.getFieldValue("email"),
    })
      .then((response) => {
        if (response.status === 200) {
          setIsSendEmail(true);
          message.success("Code sent to your email.");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error sending email: ", error);
        message.error("The ID and email must be entered. Please try again.");
        setLoading(false);
      });
  };

  const handleCheckCode = () => {
    setLoading(true);
    AxiosPost("/company/verify-code", {
      user_id: form.getFieldValue("user_id"),
      authCode: form.getFieldValue("code"),
    })
      .then((response) => {
        if (response.status === 200) {
          message.success("Code verified successfully.");
          setIsCheckedEmail(true);
          setIsSendEmail(false);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error verifying code: ", error);
        message.error("Failed to verify code. Please try again.");
        setLoading(false);
      });
  };

  const [autoCompleteResult, setAutoCompleteResult] = useState([]);
  const onWebsiteChange = (value) => {
    if (!value) {
      setAutoCompleteResult([]);
    } else {
      setAutoCompleteResult(
        [".com", ".org", ".net"].map((domain) => `${value}${domain}`)
      );
    }
  };
  const websiteOptions = autoCompleteResult.map((website) => ({
    label: website,
    value: website,
  }));

  return (
    <div className="center">
      {isRegistered ? (
        <Result
          icon={<SmileOutlined />}
          title="Successfully Registered!"
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          }
        />
      ) : (
        <Form
          {...formItemLayout}
          form={form}
          name="register"
          onFinish={onFinish}
          initialValues={{
            prefix: "82",
          }}
          style={{
            minWidth: 600,
          }}
          scrollToFirstError
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
            label="ID"
            tooltip="You need to check for ID duplicates."
            rules={[
              {
                required: true,
                message: "Please input your id!",
                whitespace: true,
              },
              {
                max: 20, // 최대 길이
                message: "ID cannot be longer than 20 characters.",
              },
              {
                validator: (_, value) => {
                  if (!value || value.length < 4) {
                    return Promise.reject(
                      new Error("ID must be at least 4 characters long.")
                    );
                  }
                  if (!/^[a-zA-Z0-9]+$/.test(value)) {
                    return Promise.reject(
                      new Error("ID must contain only letters and numbers.")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Row gutter={8}>
              <Col span={16}>
                <Input onChange={() => setIsCheckedId(false)} />
              </Col>
              <Col span={8}>
                <Button
                  className="w-full"
                  onClick={handleCheckDuplicateId}
                  style={ischeckedId ? { borderColor: "#52c41a" } : {}}
                >
                  Check ID
                  {ischeckedId && <SmileOutlined style={{ marginLeft: 3 }} />}
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
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
            name="email"
            label="E-mail"
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
            <Row gutter={8}>
              <Col span={16}>
                <Input
                  onChange={() => {
                    setIsCheckedEmail(false);
                    setIsSendEmail(false);
                  }}
                />
              </Col>
              <Col span={8}>
                <Button
                  className="w-full"
                  onClick={sendEmailCode}
                  style={
                    isSendEmail || isCheckedEmail
                      ? { borderColor: "#52c41a" }
                      : {}
                  }
                >
                  {isCheckedEmail
                    ? "Successful!"
                    : isSendEmail
                    ? "Sent Email"
                    : "Send code"}
                  {isSendEmail ||
                    (isCheckedEmail && (
                      <SmileOutlined style={{ marginLeft: 3 }} />
                    ))}
                </Button>
              </Col>
            </Row>
          </Form.Item>
          {isSendEmail && (
            <Form.Item
              name={"code"}
              label={"Code"}
              rules={[{ required: true }]}
            >
              <Row gutter={8}>
                <Col span={16}>
                  <Input />
                </Col>
                <Col span={8}>
                  <Button className="w-full" onClick={handleCheckCode}>
                    Code Check
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          )}

          <Form.Item
            name="company_name"
            label="Company Name"
            rules={[
              {
                required: true,
                message: "Please input your company name!",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="user_name"
            label="User Name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              {
                required: true,
                message: "Please input your address!",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: "Please input your phone number!",
              },
            ]}
          >
            <Input className="w-full" />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Should accept agreement")),
              },
            ]}
            {...tailFormItemLayout}
          >
            <Checkbox>
              I have read the <a href="">agreement</a>
            </Checkbox>
          </Form.Item>
          <div>{contextHolder}</div>

          <Form.Item {...tailFormItemLayout}>
            <Row gutter={8}>
              <Col span={12}>
                <Button className="w-full" type="primary" htmlType="submit">
                  Register
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};
export default SignUp;
