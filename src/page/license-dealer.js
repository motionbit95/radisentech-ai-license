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
  Select,
  Space,
  Table,
  theme,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AxiosGet, log } from "../api";
import IniFileDownload from "../component/button/download";

const { Content } = Layout;

const License = (props) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [selectedLicense, setSelectedLicense] = useState(null); // 선택된 Company data
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);

  useEffect(() => {
    setProduct(props.currentUser.product);
  }, [props.currentUser.product]);

  useEffect(() => {
    // 페이지를 로드할 때 실행
    updateDealerLicenseList();
  }, []);

  const updateDealerLicenseList = async () => {
    setLoading(true);
    try {
      log(props.currentUser.unique_code);
      const result = await AxiosGet(
        `/license/list/${props.currentUser.unique_code}`
      );
      if (result.status === 200) {
        log(result.data.data);
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
      if (error.status === 401) {
        navigate("/login");
      } else {
        console.error("Error:", error.message);
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
    log("Various parameters", pagination, filters, sorter);
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
    filteredValue: filteredInfo[dataIndex] || [],
    onFilter: (value, record) => {
      try {
        const parsedValue = JSON.parse(record[dataIndex]);
        // 배열로 변환된 값이 포함되어 있는지 확인 (includes 사용)
        return Array.isArray(parsedValue) && parsedValue.includes(value);
      } catch (e) {
        // JSON 파싱 오류가 나면 원본 텍스트로 비교
        return record[dataIndex] === value;
      }
    },
    filterSearch: true,
    ellipsis: true,
    filters: list
      .map((item) => {
        try {
          const parsedValue = JSON.parse(item[dataIndex]);
          // 배열로 변환된 값이 있을 경우, 해당 값들을 개별 필터로 추가
          return Array.isArray(parsedValue)
            ? parsedValue.map((val) => ({ text: val, value: val }))
            : [{ text: item[dataIndex], value: item[dataIndex] }];
        } catch (e) {
          return [{ text: item[dataIndex], value: item[dataIndex] }];
        }
      })
      .flat() // 배열로 만들어진 필터를 모두 평평하게 처리
      .filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (v) => v.text === value.text && v.value === value.value
          )
      ), // 중복 텍스트 제거
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
      dataIndex: "LocalActivateStartDate",
      key: "LocalActivateStartDate",
      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
      sorter: (a, b) => {
        return (
          new Date(a.LocalActivateStartDate) -
          new Date(b.LocalActivateStartDate)
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

      render: (text) => {
        try {
          return Array.isArray(JSON.parse(text))
            ? JSON.parse(text).join(", ")
            : text;
        } catch (e) {
          // JSON 파싱 오류가 나면 원본 텍스트 반환
          return text;
        }
      },

      ...getColumnFilterProps("AIType"),
    },
    {
      title: "Product Type",
      dataIndex: "ProductType",
      key: "ProductType",

      sorter: (a, b) => {
        return a.ProductType.localeCompare(b.ProductType);
      },

      render: (text) => {
        try {
          return Array.isArray(JSON.parse(text))
            ? JSON.parse(text).join(", ")
            : text;
        } catch (e) {
          // JSON 파싱 오류가 나면 원본 텍스트 반환
          return text;
        }
      },
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
    log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    log(list.find((c) => c.key === newSelectedRowKeys[0]));
    setSelectedLicense(list.find((c) => c.key === newSelectedRowKeys[0]));
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const applyFilters = (item) => {
    const { company, country, hospital, expire_date, AIType } = searchFilters;

    return (
      (!company || item.Company.toLowerCase().includes(company.trim())) &&
      // (!AIType || item.AIType.toLowerCase().includes(AIType)) &&
      (!AIType || AIType?.includes(item?.AIType)) &&
      (!country || item.Country.toLowerCase().includes(country.trim())) &&
      (!hospital || item.Hospital.toLowerCase().includes(hospital.trim())) &&
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
        <AdvancedSearchForm
          product={product}
          onSearch={(filter) => setSearchFilters(filter)}
        />
        <Table
          // rowSelection={rowSelection}
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
      AIType
      column={3}
      labelStyle={{ fontWeight: "bold" }}
    >
      <Descriptions.Item label="Company Name">
        {props.currentUser.company_name}
      </Descriptions.Item>
      <Descriptions.Item label="Unique Code">
        <Space>
          {props.currentUser.unique_code}
          <IniFileDownload code={props.currentUser.unique_code} />
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="License Count [Use/Rem/Tot]">
        {props.license_cnt} /{" "}
        {props.currentUser.license_cnt - props.license_cnt} /{" "}
        {props.currentUser.license_cnt}
      </Descriptions.Item>
    </Descriptions>
  );
};

const AdvancedSearchForm = (props) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [form] = Form.useForm();
  const formStyle = {
    background: colorBgContainer,
    padding: 24,
    borderRadius: borderRadiusLG,
    maxWidth: "none",
    borderRadius: borderRadiusLG,
    padding: 24,
  };

  const handleSelectChange = (value) => {
    const newValue = value.length === 0 ? undefined : value;
    form.setFieldsValue({ AIType: newValue });
  };

  const getFields = () => {
    const children = [];
    children.push(
      <Col span={8} key={"AIType"}>
        <Form.Item name={"AIType"} label={`AI Type`}>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Please select"
            onChange={handleSelectChange} // 선택 변경 시 실행
            allowClear
          >
            {props.product?.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"country"}>
        <Form.Item name={`country`} label={`Country`}>
          <Input placeholder="search..." allowClear />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"hospital"}>
        <Form.Item name={`hospital`} label={`Hospital`} allowClear>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"expire_date"}>
        <Form.Item name={`expire_date`} label={`Expire Date`}>
          <DatePicker.RangePicker
            format={"MM-DD-YYYY"}
            className="w-full"
            placeholder={["Start Date", "End Date"]}
            allowClear
          />
        </Form.Item>
      </Col>
    );

    return children;
  };
  const onFinish = (values) => {
    log("Received values of form: ", values);

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
