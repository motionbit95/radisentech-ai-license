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
  message,
} from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AxiosGet, AxiosPost } from "../api";
const { Option } = Select;

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
  const onFinish = (values) => {
    console.log("Received values of form: ", values);

    if (!ischeckedId) {
      message.error("Please check the ID before submitting.");
      return;
    }

    AxiosPost("/company/add", values)
      .then((response) => {
        if (response.status === 201) {
          setIsRegistered(true);
        }
      })
      .catch((error) => {
        message.error(error.response.data.message);
      });
  };

  // ID 중복 체크
  const handleCheckDuplicateId = async () => {
    // userId 필드가 유효할 때만 중복 체크 실행
    const isValid = await form
      .validateFields(["user_id"])
      .then(() => true)
      .catch(() => false);

    if (!isValid) {
      return setIsCheckedId(false); // 유효하지 않으면 함수 종료
    }

    const userId = form.getFieldValue("user_id");

    AxiosGet(`/company/check-user-id/${userId}`)
      .then((response) => {
        if (response.data.exists) {
          message.error(response.data.message);
          setIsCheckedId(false);
        } else {
          message.success(response.data.message);
          setIsCheckedId(true);
        }
      })
      .catch((error) => {
        console.error("Error checking ID:", error);
        message.error("Failed to check ID. Please try again.");
        setIsCheckedId(false);
      });
  };

  // const prefixSelector = (
  //   <Form.Item name="prefix" noStyle>
  //     <Select
  //       popupMatchSelectWidth={false}
  //       style={{
  //         width: 70,
  //       }}
  //     >
  //       {countryCodes.map(({ code, country }) => (
  //         <Option key={code} value={code}>
  //           +{code}
  //         </Option>
  //       ))}
  //     </Select>
  //   </Form.Item>
  // );

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
                <Input onChange={() => setIsSendEmail(false)} />
              </Col>
              <Col span={8}>
                <Button
                  className="w-full"
                  // onClick={handleCheckDuplicateEmail}
                  onClick={() => setIsSendEmail(true)}
                  style={isSendEmail ? { borderColor: "#52c41a" } : {}}
                >
                  Send code
                  {isSendEmail && <SmileOutlined style={{ marginLeft: 3 }} />}
                </Button>
              </Col>
            </Row>
          </Form.Item>
          {isSendEmail && (
            <Form.Item name={"code"} label={"Code"}>
              <Input />
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
