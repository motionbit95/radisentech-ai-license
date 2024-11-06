import React, { useState } from "react";
import { Button, Col, Modal, Table, Tag, Typography, message } from "antd";
import { AxiosGet, AxiosPut } from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { CloseOutlined } from "@ant-design/icons";
const LicenseHistoryModal = (props) => {
  const navigate = useNavigate();
  const { title, data, onCancel } = props;
  const [history, setHistoryList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistoryList = async (data) => {
    console.log("data", data);
    setLoading(true);
    if (data) {
      try {
        const result = await AxiosGet(`/company/generate-history/${data?.id}`);
        if (result.status === 200) {
          const sortedData = result.data.sort(
            (a, b) => new Date(b.create_time) - new Date(a.create_time)
          );
          setHistoryList(sortedData);
          setLoading(false);
        } else {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        if (error.response?.status === 403) {
          navigate("/login");
        } else {
          console.error("Error:", error.message);
          setLoading(false);
          message.error(error.response.data.error);
        }
      }
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
    fetchHistoryList(data);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleHistoryCancel = (data) => {
    console.log("data", data);
    setLoading(true);
    AxiosPut(`/company/update-license/${data?.company_pk}`, {
      license_cnt: data?.prev_cnt - data?.new_cnt,
      description: "Canceled",
      canceled: 1,
    })
      .then((response) => {
        console.log(response);
        AxiosPut(`/company/history-cancel/${data?.id}`, {
          canceled: 1,
        }).then((response) => {
          console.log(response);
          // 히스토리 데이터는 부모 테이블에서 받아온 데이터 기준으로 다시 받아와야하므로 props로 받아온 데이터를 넘긴다
          // 여기 함수에서 받은 data는 X 버튼을 클릭한 행의 데이터임.
          fetchHistoryList(props.data);
          onCancel();
          setLoading(false);
        });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  // table column
  const historyColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Previous Count",
      dataIndex: "prev_cnt",
      key: "prev_cnt",
    },
    {
      title: "Added Count",
      dataIndex: "new_cnt",
      key: "new_cnt",
      render: (text, record, index) => (
        <Typography.Text
          style={{ color: text - record.prev_cnt > 0 ? "#40a9ff" : "#ff4d4f" }}
        >
          {text - record.prev_cnt}
        </Typography.Text>
      ),
    },
    {
      title: "Total Count",
      dataIndex: "new_cnt",
      key: "new_cnt",
    },
    {
      title: "Update Time",
      dataIndex: "create_time",
      key: "create_time",

      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",

      render: (text, record, index) => (
        <Tag color={text === "Canceled" ? "red" : "green"}>{text}</Tag>
      ),
    },
    {
      title: "Action",
      dataIndex: "canceled",
      key: "canceled",
      render: (text, record, index) => (
        <Button
          disabled={text === 1 ? true : false}
          danger
          onClick={() => handleHistoryCancel(record)}
        >
          <CloseOutlined />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Col
        style={{
          cursor: "pointer",
          color: "#1890ff",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
        onClick={showModal}
      >
        {title}
      </Col>
      <Modal
        title="License History"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={1000}
        footer={null}
      >
        <Table
          dataSource={history}
          columns={historyColumns}
          loading={loading}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Modal>
    </>
  );
};
export default LicenseHistoryModal;
