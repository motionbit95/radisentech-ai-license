import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Flex,
  Row,
  Col,
  message,
  Divider,
  Image,
  Space,
  Card,
  theme,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import { AxiosPost, log } from "../api";
import GoogleLoginButton from "../component/button/google-login";
import Logo from "../asset/logo.svg";
const LoginForm = () => {
  const [form] = useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onFinish = (values) => {
    log(
      "Received values of form: ",
      values
      // JSON.stringify({
      //   username: values.user_id,
      //   password: values.password,
      // })
    );

    AxiosPost("/company/login", values)
      .then((result) => {
        // 로그인 성공
        log(result);
        localStorage.setItem("token", result.data.token);
        navigate("/license", { state: { isLoggedIn: true } });
      })
      .catch((error) => {
        form.resetFields();
        messageApi.open({
          type: "error",
          content: "Login failed. Please try again.",
          duration: 3, // 3초 동안 표시
        });
      });
  };

  return (
    <div className="center">
      <Card
        style={{
          padding: "1rem",
          backgroundColor: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
        title={
          <div style={{ textAlign: "center" }}>
            <Space direction="vertical">
              <Image preview={false} src={Logo} alt="logo" width={100} />
              <h2>AI License Manager</h2>
            </Space>
          </div>
        }
        bordered={false}
      >
        <Space direction="vertical" style={{ width: "100%" }}></Space>
        <Form
          form={form}
          name="login"
          style={{
            minWidth: 360,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="user_id"
            rules={[
              {
                required: true,
                message: "Please input your User ID!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="ID" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                <Button block type="primary" htmlType="submit">
                  Login
                </Button>
              </Col>
              <Col span={12}>
                {/* 회원가입 페이지로 이동 */}
                <Button
                  block
                  htmlType="submit"
                  onClick={() => navigate("/signup")}
                >
                  Join
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <div>{contextHolder}</div>
          <Form.Item>
            <Col span={24}>
              <Flex justify="flex-end" align="center">
                <a href="/forgot">Forgot password</a>
              </Flex>
            </Col>
          </Form.Item>
          <Divider plain>Other Login Options</Divider>
          <GoogleLoginButton />
        </Form>
      </Card>
    </div>
  );
};
export default LoginForm;
