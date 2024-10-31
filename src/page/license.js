import React, { useEffect, useMemo, useRef, useState } from "react";
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
import UpdateHistoryModal from "../modal/update-history";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Header, Content, Footer } = Layout;

const License = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 페이지를 로드할 때 실행
    updateLicenseList();
  }, []);

  const updateLicenseList = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/license/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        if (result.status === 200) {
          setList(result.data.data);
          console.log(result.data.data);

          const active = new Date(result.data.data[0].UTCActivateStartDate);
          const expire = new Date(result.data.data[0].UTCTerminateDate);

          // result.data.data.map((item) => {
          //   console.log(item);
          // });
          setLoading(false);
        } else if (result.status === 401) {
          navigate("/login");
        }
      })
      .catch((error) => {
        console.log(error);
        // setError(error);
      });
  };

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
      title: "Company",
      dataIndex: "Company",
      key: "Company",
      fixed: "left",
      // ...getColumnSearchProps("Company"),
      //     sorter: (a, b) => {
      //       return a.Company.localeCompare(b.Company);
      //     },

      // render: (text) => (
      //   <Space>
      //     {text}
      //     <Tooltip placement="top" title={getCompanyCode(text)}>
      //       <InfoCircleOutlined />
      //     </Tooltip>
      //   </Space>
      // ),
    },
    {
      title: "Activate Date Time",
      dataIndex: "UTCActivateStartDate",
      key: "UTCActivateStartDate",
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      // sorter: (a, b) => {
      //   return new Date(a.activate_date_time) - new Date(b.activate_date_time);
      // },
    },
    {
      title: "Expire Date",
      dataIndex: "UTCTerminateDate",
      key: "UTCTerminateDate",
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      // sorter: (a, b) => {
      //   return new Date(a.expire_date) - new Date(b.expire_date);
      // },
    },
    {
      title: "Country",
      dataIndex: "Country",
      key: "Country",

      // filters: Array.from({ length: countryCodes.length }, (_, index) => {
      //   return {
      //     text: countryCodes[index]?.country,
      //     value: countryCodes[index]?.country,
      //   };
      // }),
      // ...getColumnFilterProps("country"),

      // sorter: (a, b) => {
      //   return a.country.localeCompare(b.country);
      // },
    },
    {
      title: "AI Type",
      dataIndex: "AIType",
      key: "AIType",

      // sorter: (a, b) => {
      //   return a.ai_type.localeCompare(b.ai_type);
      // },
    },
    {
      title: "Hospital Name",
      dataIndex: "Hospital",
      key: "Hospital",
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "S/N",
      dataIndex: "DetectorSerialNumber",
      key: "DetectorSerialNumber",
    },
    {
      title: "Email",
      dataIndex: "UserEmail",
      key: "UserEmail",
    },
    {
      title: "Update",
      dataIndex: "UpdatedAt",
      key: "UpdatedAt",
      fixed: "right",
      render: (text, record, index) => (
        <UpdateHistoryModal history={[]} title={text} />
      ),
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
          rowSelection={rowSelection}
          loading={loading}
          title={() => (
            // <Button
            //   type="primary"
            //   disabled={!hasSelected}
            //   onClick={() => console.log(selectedRowKeys)}
            // >
            //   Update License
            // </Button>
            <UpdateLicense
              type="primary"
              disabled={!hasSelected}
              title="Update License"
              data={list.find((c) => c.key === selectedRowKeys[0])}
            />
          )}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={licenseColumns}
          dataSource={
            searchFilters
              ? list.filter((item) => {
                  if (
                    searchFilters.UTCTerminateDate
                      ? new Date(searchFilters.UTCTerminateDate[0]) <
                          new Date(item.UTCTerminateDate) &&
                        new Date(searchFilters.UTCTerminateDate[1]) >
                          new Date(item.UTCTerminateDate)
                      : true &&
                        item.Company.includes(searchFilters.Company || "") &&
                        item.Country.includes(searchFilters.Country || "") &&
                        item.Hospital.includes(searchFilters.Hospital || "")
                  ) {
                    return item;
                  }
                })
              : list
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
      <Col span={8} key={"company"}>
        <Form.Item name={`company`} label={`Company`}>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
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
          <DatePicker.RangePicker placeholder={["Start Date", "End Date"]} />
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

export default License;
