import React, { useState } from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Switch,
  Typography,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const CompanyEdit = (props) => {
  const navigate = useNavigate();
  const { disabled, data, onComplete, setLoading } = props;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const showDrawer = () => {
    setOpen(true);

    // drawer가 열리면 필드값을 업데이트합니다.
    form.setFieldsValue({ ...data });
  };
  const onClose = () => {
    setOpen(false);
  };

  const onFinish = (values) => {
    console.log("Received values of form: ", values, data);
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .put(
        `${process.env.REACT_APP_SERVER_URL}/company/update/${data?.id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
          },
        }
      )
      .then((result) => {
        if (result.status === 200) {
          setOpen(false);
          onComplete(values);
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          navigate("/login");
        }
      });
  };

  return (
    <>
      <Button disabled={disabled} onClick={showDrawer}>
        Edit
      </Button>
      <Drawer
        title="Edit Company"
        width={720}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Popconfirm
              title="Cancel this task?"
              description="Are you sure to cancel this task?"
              onConfirm={() => {
                form.resetFields();
                onClose();
              }}
              onCancel={() => {}}
              okText="Yes"
              cancelText="No"
            >
              <Button>Cancel</Button>
            </Popconfirm>
            <Button type="primary" onClick={() => form.submit()}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          hideRequiredMark
          initialValues={data}
          form={form}
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="unique_code"
                label="Unique Code"
                rules={[
                  {
                    required: true,
                    message: "Please enter company code",
                  },
                ]}
              >
                <Input placeholder="Please enter company code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user_id"
                label="ID"
                rules={[
                  {
                    required: true,
                    message: "Please enter id",
                  },
                ]}
              >
                <Input placeholder="Please enter id" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="user_name"
                label="User Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter user name",
                  },
                ]}
              >
                <Input placeholder="Please enter user name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please enter user email",
                  },
                ]}
              >
                <Input placeholder="Please enter user email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company_name"
                label="Company Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter company name",
                  },
                ]}
              >
                <Input placeholder="Please enter company name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  {
                    required: true,
                    message: "Please enter company address",
                  },
                ]}
              >
                <Input placeholder="Please enter company address" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                <Input
                  className="w-full"
                  placeholder="Please enter phone number"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="permission_flag"
                label="Supervisor"
                rules={[
                  {
                    required: true,
                    message: "Please enter country",
                  },
                ]}
              >
                <Switch
                  checkedChildren="Admin"
                  unCheckedChildren="Dealer"
                  defaultChecked={data?.permission_flag === "Y" ? true : false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};
export default CompanyEdit;
