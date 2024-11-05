import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Table,
  theme,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AxiosGet } from "../api";
import IniFileDownload from "../component/IniFileDownload";

const { Header, Content, Footer } = Layout;

const License = (props) => {
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
    // console.log(props.currentUser.id);
    updateDealerLicenseList();
  }, []);

  const updateDealerLicenseList = async () => {
    setLoading(true);
    try {
      // console.log(props.currentUser.company_name);
      const result = await AxiosGet(
        `/license/list/${props.currentUser.company_name}`
      );
      if (result.status === 200) {
        console.log(result.data.data);
        setList(
          result.data.data
            .filter((item) => item.Deleted === 0)
            .map((item) => ({
              ...item,
              key: item.pk,
            }))
        );
        setLoading(false);
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      if (error.status === 401) {
        navigate("/login");
      }
    }
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
  const DealerlicenseColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Activate Date Time",
      dataIndex: "UTCActivateStartDate",
      key: "UTCActivateStartDate",
      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
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
      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY") : ""),
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
      dataIndex: "UserName",
      key: "UserName",

      ...getColumnSearchProps("UserName"),
    },
    {
      title: "Email",
      dataIndex: "UserEmail",
      key: "UserEmail",

      ...getColumnSearchProps("UserEmail"),
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
        <CompanyInfo
          currentUser={props.currentUser}
          license_cnt={list.length}
        />
        <AdvancedSearchForm onSearch={(filter) => setSearchFilters(filter)} />
        <Table
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          columns={DealerlicenseColumns}
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

const CompanyInfo = (props) => {
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

  return (
    <Descriptions
      style={formStyle}
      column={3}
      labelStyle={{ fontWeight: "bold" }}
    >
      <Descriptions.Item label="Company Name">
        {props.currentUser.company_name}
      </Descriptions.Item>
      <Descriptions.Item label="Unique Code">
        <Space>
          {props.currentUser.unique_code}
          {/* <IniFileDownload code={props.currentUser.unique_code} /> */}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="License Count [Rem/Total]">
        {props.currentUser.license_cnt} / {props.license_cnt}
      </Descriptions.Item>
    </Descriptions>
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
        <Form.Item name={`hospital`} label={`Hospital`}>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"expire_date"}>
        <Form.Item name={`expire_date`} label={`Expire Date`}>
          <DatePicker.RangePicker
            format={"MM-DD-YYYY"}
            placeholder={["Start Date", "End Date"]}
          />
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
