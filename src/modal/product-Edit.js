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
import { AxiosPut, log } from "../api";

const ProductEdit = (props) => {
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
    log("Changed values: ", changedValues);
  };

  const onFinish = async (values) => {
    log("Received values of form: ", values, data);
    setLoading(true);

    await AxiosPut(`/product/update/${data?.id}`, {
      ...values,
    })
      .then((result) => {
        if (result.status === 200) {
          setOpen(false);
          onComplete(values);
        }
      })
      .catch((error) => {
        if (error.status === 403) {
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
        title="Edit AI Type"
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
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter AI Type name",
                  },
                ]}
              >
                <Input placeholder="Please enter AI Type name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="description" label="Description">
                <Input placeholder="Please enter AI Type description" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};
export default ProductEdit;
