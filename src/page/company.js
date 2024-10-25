import React, { useMemo, useRef, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Table,
  theme,
  Tooltip,
} from "antd";
import { countryCodes, dummyCompany, dummyLisense } from "../data";
import Highlighter from "react-highlight-words";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { type } from "@testing-library/user-event/dist/type";
import ButtonGroup from "antd/es/button/button-group";
import GenerateModal from "../modal/generate";
import CompanyEdit from "../modal/drawer";

const { Header, Content, Footer } = Layout;

const Company = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
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
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

  const getColumnFilterProps = (dataIndex) => ({
    filteredValue: filteredInfo[dataIndex] || null,
    onFilter: (value, record) => {
      return record[dataIndex] === value;
      // console.log(value, record[dataIndex]);
    },
    filterSearch: true,
    ellipsis: true,
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
      dataIndex: "id",
      key: "id",
      fixed: "left",
      width: 150,

      ...getColumnSearchProps("id"),
      sorter: (a, b) => {
        return a.id.localeCompare(b.id);
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",

      sorter: (a, b) => {
        return new Date(a.email) - new Date(b.email);
      },
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
      title: "Code",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",

      sorter: (a, b) => {
        return a.user_name.localeCompare(b.user_name);
      },
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <Content
      style={{
        padding: "48px",
      }}
    >
      <Space size={"large"} direction="vertical" className="w-full">
        <Table
          rowSelection={rowSelection}
          title={() => (
            <Row justify={"space-between"}>
              <GenerateModal
                title="Generate License"
                type="primary"
                disabled={!hasSelected}
                // onClick={() => console.log(selectedRowKeys)}
              />
              <ButtonGroup>
                <Button disabled={!hasSelected}>Copy</Button>
                <Button
                  disabled={!hasSelected}
                  onClick={() => setSelectedRowKeys([])}
                >
                  Cancel
                </Button>
                <CompanyEdit
                  disabled={!hasSelected}
                  data={dummyCompany.find((c) => c.key === selectedRowKeys[0])}
                />
                <Button disabled={!hasSelected}>Delete</Button>
              </ButtonGroup>
            </Row>
          )}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={companyColumns}
          dataSource={dummyCompany}
          scroll={{
            x: "max-content",
          }}
          onChange={handleChange}
        />
      </Space>
    </Content>
  );
};

export default Company;
