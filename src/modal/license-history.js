import React, { useEffect, useState } from "react";
import { Button, Col, Modal, Table, message } from "antd";
import { AxiosGet } from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const LicenseHistoryModal = (props) => {
  const navigate = useNavigate();
  const { title, data } = props;
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
          setHistoryList(result.data);
          setLoading(false);
        } else {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        if (error.response?.status === 401) {
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
      render: (text, record, index) => text - record.prev_cnt,
    },
    {
      title: "Total Count",
      dataIndex: "new_cnt",
      key: "new_cnt",
    },
    {
      title: "Create Time",
      dataIndex: "create_time",
      key: "create_time",

      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
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
        width={800}
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
