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
import UpdateLicense from "../modal/expire";

const { Header, Content, Footer } = Layout;

const LicenseDealer = () => {
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

  const getCompanyCode = (company_name) => {
    return dummyCompany.find((item) => item.company_name === company_name).key;
  };

  // table column
  const licenseColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Activate Date Time",
      dataIndex: "activate_date_time",
      key: "activate_date_time",

      sorter: (a, b) => {
        return new Date(a.activate_date_time) - new Date(b.activate_date_time);
      },
    },
    {
      title: "Expire Date",
      dataIndex: "expire_date",
      key: "expire_date",

      sorter: (a, b) => {
        return new Date(a.expire_date) - new Date(b.expire_date);
      },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",

      filters: Array.from({ length: countryCodes.length }, (_, index) => {
        return {
          text: countryCodes[index]?.country,
          value: countryCodes[index]?.country,
        };
      }),
      ...getColumnFilterProps("country"),

      sorter: (a, b) => {
        return a.country.localeCompare(b.country);
      },
    },
    {
      title: "AI Type",
      dataIndex: "ai_type",
      key: "ai_type",

      sorter: (a, b) => {
        return a.ai_type.localeCompare(b.ai_type);
      },
    },
    {
      title: "Hospital Name",
      dataIndex: "hospital_name",
      key: "hospital_name",
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: 150,
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
        <AdvancedSearchForm onSearch={(filter) => setSearchFilters(filter)} />
        <Table
          // rowSelection={rowSelection}
          title={() => (
            <Space
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Col style={{ textAlign: "right" }}>{`License No. / `}</Col>
            </Space>
          )}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={licenseColumns}
          dataSource={
            searchFilters
              ? dummyLisense.filter((item) => {
                  if (
                    searchFilters.expire_date
                      ? new Date(searchFilters.expire_date[0]) <
                          new Date(item.expire_date) &&
                        new Date(searchFilters.expire_date[1]) >
                          new Date(item.expire_date)
                      : true &&
                        item.company.includes(searchFilters.company || "") &&
                        item.country.includes(searchFilters.country || "") &&
                        item.hospital_name.includes(
                          searchFilters.hospital_name || ""
                        )
                  ) {
                    return item;
                  }
                })
              : dummyLisense
          }
          scroll={{
            x: "max-content",
          }}
          onChange={handleChange}
        />
      </Space>
    </Content>
  );
};

const AdvancedSearchForm = (props) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);
  const formStyle = {
    background: colorBgContainer,
    padding: 24,
    borderRadius: borderRadiusLG,
    maxWidth: "none",
    borderRadius: borderRadiusLG,
    padding: 24,
  };

  const getFields = () => {
    const children = [];
    children.push(
      <Col span={8} key={"country"}>
        <Form.Item name={`country`} label={`Country`}>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"hospital"}>
        <Form.Item name={`hospital_name`} label={`Hospital`}>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"expire_date"}>
        <Form.Item name={`expire_date`} label={`Expire Date`}>
          <DatePicker.RangePicker
            className="w-full"
            placeholder={["Start Date", "End Date"]}
          />
        </Form.Item>
      </Col>
    );
    return children;
  };
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    props.onSearch(values);
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={onFinish}
      {...formItemLayout}
    >
      <Row gutter={24}>{getFields()}</Row>
      <div
        style={{
          textAlign: "right",
        }}
      >
        <Space size="small">
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            Clear
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default LicenseDealer;
