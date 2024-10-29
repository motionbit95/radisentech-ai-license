import React, { useState } from "react";
import { Button, Col, Drawer, Form, Input, Popconfirm, Row, Space } from "antd";
import axios from "axios";
const CompanyEdit = (props) => {
  const { disabled, data, onComplete } = props;
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
    axios
      .put(
        `${process.env.REACT_APP_SERVER_URL}/company/update/${data?.id}`,
        values
      )
      .then((result) => {
        // 업데이트에 성공하면 아래 구문 실행
        console.log(result);

        // form.resetFields();
        setOpen(false);
        onComplete(values);
      })
      .catch((error) => {
        console.log(error);
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
              title="Delete the task"
              description="Are you sure to delete this task?"
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
                <Input className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};
export default CompanyEdit;
