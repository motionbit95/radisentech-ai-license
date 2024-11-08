import React, { useRef, useState } from "react";
import { Button, Input, Modal, Space, Table, message } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { AxiosPost } from "../api";

const CompanyCopy = (props) => {
  const navigate = useNavigate();
  const { data, list, disabled, onComplete, setloading } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCopyCompany, setSelectedCopyCompany] = useState(null); // 선택된 Company data

  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    console.log(data?.id, selectedCopyCompany?.id);

    AxiosPost("/company/transfer", {
      sourceId: data.id,
      targetId: selectedCopyCompany.id,
    })
      .then((response) => {
        if (response.status === 200) {
          message.success("Company copied successfully.");
          setIsModalOpen(false);
          onComplete();
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

      ...getColumnSearchProps("unique_code"),
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
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    console.log(list.find((c) => c.key === newSelectedRowKeys[0]));
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
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={1000}
      >
        <Table
          dataSource={
            data?.id ? list.filter((item) => item.id !== data.id) : list
          }
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
