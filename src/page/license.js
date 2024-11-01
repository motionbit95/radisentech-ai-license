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
import ADDLicense from "../modal/addLicense-test";

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

  const [selectedLicense, setSelectedLicense] = useState(null); // 선택된 Company data
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
          setList(
            result.data.data.map((item) => ({
              ...item,
              key: item.pk, // data의 key 값은 pk
            }))
          );

          const active = new Date(result.data.data[0].UTCActivateStartDate);
          const expire = new Date(result.data.data[0].UTCTerminateDate);

          result.data.data.map((item) => {
            console.log(item);
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status === 401) {
          navigate("/login");
        }
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
    return list.find((item) => item.Company === company_name).UniqueCode;
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
      sorter: (a, b) => {
        return a.Company.localeCompare(b.Company);
      },

      render: (text) => (
        <Space>
          {text}
          <Tooltip placement="top" title={getCompanyCode(text)}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Activate Date Time",
      dataIndex: "UTCActivateStartDate",
      key: "UTCActivateStartDate",
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      sorter: (a, b) => {
        return (
          new Date(a.UTCActivateStartDate) - new Date(b.UTCActivateStartDate)
        );
      },
    },
    {
      title: "Expire Date",
      dataIndex: "UTCTerminateDate",
      key: "UTCTerminateDate",
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      sorter: (a, b) => {
        return new Date(a.UTCTerminateDate) - new Date(b.UTCTerminateDate);
      },
    },
    {
      title: "Country",
      dataIndex: "Country",
      key: "Country",

      sorter: (a, b) => {
        return a.Country.localeCompare(b.Country);
      },
    },
    {
      title: "AI Type",
      dataIndex: "AIType",
      key: "AIType",

      sorter: (a, b) => {
        return a.AIType.localeCompare(b.AIType);
      },

      ...getColumnSearchProps("AIType"),
    },
    {
      title: "Hospital Name",
      dataIndex: "Hospital",
      key: "Hospital",

      sorter: (a, b) => {
        return a.Hospital.localeCompare(b.Hospital);
      },
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",

      ...getColumnSearchProps("user_name"),
    },
    {
      title: "S/N",
      dataIndex: "DetectorSerialNumber",
      key: "DetectorSerialNumber",

      ...getColumnSearchProps("DetectorSerialNumber"),
    },
    {
      title: "Email",
      dataIndex: "UserEmail",
      key: "UserEmail",

      ...getColumnSearchProps("UserEmail"),
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
    console.log(list.find((c) => c.key === newSelectedRowKeys[0]));
    setSelectedLicense(list.find((c) => c.key === newSelectedRowKeys[0]));
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const applyFilters = (item) => {
    const { company, country, hospital, expire_date } = searchFilters;

    return (
      (!company || item.Company.toLowerCase().includes(company)) &&
      (!country || item.Country.toLowerCase().includes(country)) &&
      (!hospital || item.Hospital.toLowerCase().includes(hospital)) &&
      (!expire_date ||
        (new Date(expire_date[0]) <= new Date(item.UTCTerminateDate) &&
          new Date(expire_date[1]) >= new Date(item.UTCTerminateDate)))
    );
  };

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
            <Row justify={"space-between"}>
              <UpdateLicense
                type="primary"
                disabled={!hasSelected}
                title="Update License"
                data={selectedLicense}
                onComplete={(data) => {
                  updateLicenseList();
                  setSelectedLicense(data);
                  setSelectedRowKeys([]);
                }}
              />
              {/* Lisence 추가 테스트용 */}
              <ADDLicense onAddFinish={() => updateLicenseList()} />
            </Row>
          )}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={licenseColumns}
          dataSource={
            searchFilters
              ? // 리스트 필터 조건
                list.filter(applyFilters)
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

    // 모든 검색 값들을 소문자로 변환
    const normalizedFilters = Object.fromEntries(
      Object.entries(values).map(([key, value]) =>
        typeof value === "string" ? [key, value.toLowerCase()] : [key, value]
      )
    );
    props.onSearch(normalizedFilters);
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
