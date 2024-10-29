import React, { useEffect, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Flex,
  Space,
  Row,
  Col,
  Alert,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "antd/es/form/Form";
const LoginForm = () => {
  const [form] = useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values) => {
    console.log(
      "Received values of form: ",
      values
      // JSON.stringify({
      //   username: values.user_id,
      //   password: values.password,
      // })
    );

    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/company/login`, values)
      .then((result) => {
        // 로그인 성공
        localStorage.setItem("token", JSON.stringify(result.token));
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
              <a href="">Forgot password</a>
            </Flex>
          </Col>
        </Form.Item>
      </Form>
    </div>
  );
};
export default LoginForm;
