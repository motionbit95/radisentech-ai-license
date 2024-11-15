import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Image,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { AxiosGet, AxiosPost, log } from "../api";

const CompanyCopy = (props) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const { data, disabled, onComplete, setloading } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCopyCompany, setSelectedCopyCompany] = useState(null); // 선택된 Company data

  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      AxiosGet(`/company/available-transfer/${data.unique_code}`).then(
        (response) => {
          if (response.status === 200) {
            setList(
              response.data.map((item) => ({
                ...item,
                key: item.id,
              }))
            );
          }
        }
      );
    }
  }, [isModalOpen]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setLoading(true);
    AxiosPost("/company/transfer", {
      sourceId: data.id,
      targetId: selectedCopyCompany.id,
    })
      .then((response) => {
        // source의 unique_code 리셋
        AxiosGet(`/company/reset-unique-code/${data?.id}`).then((response) => {
          if (response.status === 200) {
            onComplete();
          }
        });
        if (response.status === 200) {
          message.success("Company transferred successfully.");
          setIsModalOpen(false);
          setSelectedCopyCompany(null);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error copying company: ", error);
        message.error("Failed to copy company. Please try again.");
      });
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={"Search " + dataIndex}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            {"Search"}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            {"Reset"}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            {"Close"}
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      (record[dataIndex] ? record[dataIndex].toString() : "")
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // table column
  const companyColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "ID",
      dataIndex: "user_id",
      key: "user_id",
      fixed: "left",

      ...getColumnSearchProps("user_id"),
      sorter: (a, b) => {
        return a.user_id.localeCompare(b.user_id);
      },

      render: (text) => (
        <Space>
          {parseFloat(text) ? (
            <Image
              preview={false}
              width={20}
              src={require(`../asset/pngwing.com.png`)}
            />
          ) : (
            text
          )}
          {parseFloat(text) ? (
            <Tooltip placement="top" title={text}>
              <InfoCircleOutlined />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",

      sorter: (a, b) => {
        return new Date(a.email) - new Date(b.email);
      },

      ...getColumnSearchProps("email"),
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",

      sorter: (a, b) => {
        return a.company_name.localeCompare(b.company_name);
      },

      ...getColumnSearchProps("company_name"),
    },
    {
      title: "Unique Code",
      dataIndex: "unique_code",
      key: "unique_code",

      // ...getColumnSearchProps("unique_code"),
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",

      sorter: (a, b) => {
        return a.user_name.localeCompare(b.user_name);
      },

      ...getColumnSearchProps("user_name"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
  ];

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    log(list.find((c) => c.key === newSelectedRowKeys[0]));
    setSelectedCopyCompany(list.find((c) => c.key === newSelectedRowKeys[0]));
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <Button disabled={disabled} onClick={showModal}>
        Transfer
      </Button>
      <Modal
        title="Transfer Company"
        open={isModalOpen}
        onCancel={handleCancel}
        centered
        width={1300}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Popconfirm
            key="confirm"
            title="Are you sure you want to proceed with the transfer?"
            onConfirm={handleOk}
            okText="Yes"
            cancelText="No"
          >
            <Button disabled={selectedRowKeys.length === 0} type="primary">
              Transfer
            </Button>
          </Popconfirm>,
        ]}
      >
        <Table
          dataSource={
            data?.id ? list.filter((item) => item.id !== data.id) : list
          }
          loading={loading}
          rowSelection={rowSelection}
          columns={companyColumns}
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
export default CompanyCopy;
