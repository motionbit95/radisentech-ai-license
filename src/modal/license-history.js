import React, { useEffect, useState } from "react";
import { Button, Col, Modal, Table, Tag, Typography, message } from "antd";
import { AxiosGet, AxiosPost, AxiosPut, log } from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { CloseOutlined } from "@ant-design/icons";
const LicenseHistoryModal = (props) => {
  const navigate = useNavigate();
  const { title, data, onCancel } = props;
  const [history, setHistoryList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // admin pk 의 ID 찾기
  const AdminID = ({ admin_pk }) => {
    const [admin_id, setAdminID] = useState(null);
    useEffect(() => {
      if (admin_pk) {
        AxiosGet(`/company/${admin_pk}`).then((response) => {
          if (response.status === 200) {
            setAdminID(response.data.user_id);
          }
        });
      }
    }, []);
    return <div>{admin_id}</div>;
  };

  const fetchHistoryList = async (data) => {
    log("data", data);
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
          setLoading(false);
          throw new Error("Unauthorized");
        }
      } catch (error) {
        if (error.response?.status === 403) {
          navigate("/login");
        } else if (error.response?.status === 404) {
          message.error(error.response.data.error);
          setHistoryList([]);
          setLoading(false);
        } else {
          console.error("Error:", error);
          setLoading(false);
        }
      }
    }
    setLoading(false);
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

  const handleHistoryCancel = (history) => {
    if (data.license_cnt - data.use_cnt < history.new_cnt - history.prev_cnt) {
      message.error(
        "The number of licenses to be canceled is greater than the number of licenses currently in use."
      );
      return;
    }
    // 이관 데이터를 취소하는 과정 예외처리 추가
    if (history?.description === "Transfer") {
      // 재이관
      setLoading(true);
      AxiosPost("/company/transfer-cancel", {
        sourceId: history?.source_id,
        targetId: history?.target_id,
      })
        .then((response) => {
          fetchHistoryList(props.data);
          onCancel();
          setLoading(false);
        })
        .catch((error) => {
          log(error);
          setLoading(false);
        });
    } else {
      AxiosGet("/company/user-info")
        .then((response) => {
          if (response.status === 200) {
            AxiosPut(`/company/update-license/${history?.company_pk}`, {
              license_cnt: history?.prev_cnt - history?.new_cnt,
              description: "Generated Canceled",
              canceled: 1,
              admin_id: response.data.id,
            })
              .then((response) => {
                log(response);
                setLoading(true);
                AxiosPut(`/company/history-cancel/${history?.id}`, {
                  canceled: 1,
                }).then((response) => {
                  log(response);
                  // 히스토리 데이터는 부모 테이블에서 받아온 데이터 기준으로 다시 받아와야하므로 props로 받아온 데이터를 넘긴다
                  // 여기 함수에서 받은 data는 X 버튼을 클릭한 행의 데이터임.
                  fetchHistoryList(props.data);
                  onCancel();
                  setLoading(false);
                });
              })
              .catch((error) => {
                log(error);
                setLoading(false);
              });
          }
        })
        .catch((error) => {
          log(error);
          setLoading(false);
        });
    }
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
      title: "Update Time",
      dataIndex: "create_time",
      key: "create_time",

      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
    },
    {
      title: "Previous",
      dataIndex: "prev_cnt",
      key: "prev_cnt",
    },
    {
      title: "Added",
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
      title: "Total",
      dataIndex: "new_cnt",
      key: "new_cnt",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
    },
    {
      title: "Admin",
      dataIndex: "admin_id",
      key: "admin_id",
      render: (text) => <AdminID admin_pk={text} />,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",

      render: (text, record, index) => (
        <Tag
          color={
            text.includes("Canceled")
              ? "red"
              : text === "Generated"
              ? "green"
              : "blue"
          }
        >
          {text}
        </Tag>
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
          size="small"
          style={{
            display: record.description === "Transfer" ? "none" : "block",
          }}
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
        title={`[${data?.user_name}] License Generate History`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={1000}
        footer={null}
      >
        <Table
          dataSource={history}
          size="small"
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
