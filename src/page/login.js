import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex, Space, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const LoginForm = () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log(
      "Received values of form: ",
      values,
      JSON.stringify({
        username: values.userId,
        password: values.password,
      })
    );

    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
        username: values.userId,
        password: values.password,
      })
      .then((result) => {
        // 로그인 성공
        localStorage.setItem("token", JSON.stringify(result.token));
        navigate("/license", { state: { isLoggedIn: true } });
      })
      .catch((error) => console.error(error));
  };
  return (
    <div className="center">
      <Form
        name="login"
        initialValues={{
          remember: true,
        }}
        style={{
          minWidth: 360,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="userId"
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
              {/* 회원가입 페이지로 이동 */}
              <Button
                block
                htmlType="submit"
                onClick={() => navigate("/signup")}
              >
                Join
              </Button>
            </Col>
            <Col span={12}>
              <Button block type="primary" htmlType="submit">
                Login
              </Button>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item>
          <Col span={24}>
            <Flex justify="flex-end" align="center">
              <a href="">Forgot password</a>
            </Flex>
          </Col>
        </Form.Item>
      </Form>
    </div>
  );
};
export default LoginForm;
