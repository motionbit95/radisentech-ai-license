import React, { useState } from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import { AxiosPut } from "../api";

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

  const onValuesChange = (changedValues) => {
    console.log("Changed values: ", changedValues);
  };

  const onFinish = async (values) => {
    console.log("Received values of form: ", values, data);
    setLoading(true);

    await AxiosPut(`/company/update/${data?.id}`, {
      permission_flag: data?.permission_flag,
      ...values,
    })
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
          onValuesChange={onValuesChange}
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
          {/* 슈퍼바이저 컨트롤러 */}
          {props.permission_flag === "D" && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="permission_flag" label="Supervisor">
                  <Select
                    placeholder="Select permission type"
                    style={{ width: "200px" }}
                  >
                    <Select.Option value="N">Delear</Select.Option>
                    <Select.Option value="Y">Admin</Select.Option>
                    <Select.Option value="D">Developer</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Drawer>
    </>
  );
};
export default CompanyEdit;
