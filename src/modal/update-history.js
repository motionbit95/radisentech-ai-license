import React, { useState } from "react";
import { Modal, Table, message } from "antd";
import { AxiosGet } from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const UpdateHistoryModal = (props) => {
  const { title, data } = props;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUpdateHistory = async (data) => {
    setLoading(true);
    if (data) {
      try {
        const result = await AxiosGet(`/license/license-history/${data?.pk}`);
        if (result.status === 200) {
          setUpdateHistory(result.data);
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
    console.log("data", data);
    setIsModalOpen(true);
    fetchUpdateHistory(data);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const historyColumn = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Previous Expire Date",
      dataIndex: "previous_expire_date",
      key: "previous_expire_date",
      render: (text) => dayjs(text).format("MM-DD-YYYY"),
    },
    {
      title: "New Expire Date",
      dataIndex: "new_expire_date",
      key: "new_expire_date",
      render: (text) => dayjs(text).format("MM-DD-YYYY"),
    },
    {
      title: "Update",
      dataIndex: "update_date",
      key: "update_date",
      render: (text) => dayjs(text).format("MM-DD-YYYY HH:mm:ss"),
    },
  ];

  return (
    <>
      <a onClick={showModal}>{title}</a>
      <Modal
        title="Update History"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={800}
      >
        <Table
          dataSource={updateHistory}
          loading={loading}
          columns={historyColumn}
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
export default UpdateHistoryModal;
