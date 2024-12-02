import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosPut, log } from "../api";

const EditLicense = (props) => {
  const { data, disabled, onComplete } = props;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    console.log("모달에서 받은거는 ? > ", data);
  }, [data]);

  const onFinish = async (values) => {
    log("Received values of form: ", values);

    try {
      await AxiosPut(`/license/update-license/${data?.pk}`, {
        Company: values.Company,
        Hospital: values.Hospital,
        Country: values.Country,
        UserEmail: values.UserEmail,
        UserName: values.UserName,
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
    } catch (error) {
      message.error("Update failed. Please try again."); // 오류 메시지 표시
    }
  };

  const showDrawer = () => {
    setOpen(true);

    // drawer가 열리면 필드값을 업데이트합니다.
    form.setFieldsValue({ ...data });
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Button disabled={disabled} onClick={showDrawer}>
        Edit
      </Button>

      {/* 수정 */}
      <Drawer
        title="Edit License"
        onClose={onClose}
        width={720}
        open={open}
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
            <Popconfirm
              title="Are you sure to Edit?"
              onConfirm={() => form.submit()}
            >
              <Button type="primary">Submit</Button>
            </Popconfirm>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={data}
          onFinish={onFinish}
        >
          <Form.Item
            name="DealerCompany"
            label="Dealer Company"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="Company"
            label="Company"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="Hospital"
                label="Hospital Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Country"
                label="Country"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="UserName"
                label="User Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="UserEmail"
                label="Email"
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
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default EditLicense;
