import React, { useEffect, useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Layout,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  theme,
  Tooltip,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import UpdateLicense from "../modal/expire";
import UpdateHistoryModal from "../modal/update-history";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ADDLicense from "../modal/add-license";
import { AxiosGet, AxiosPut, log } from "../api";
import ButtonGroup from "antd/es/button/button-group";
import Product from "./product";
import EditLicense from "../modal/edit-license";

// 플러그인 초기화
dayjs.extend(utc);
dayjs.extend(timezone);

function formatDateToMMDDYYYYHHMMSS(date) {
  const padZero = (num) => String(num).padStart(2, "0"); // 두 자릿수로 변환

  const month = padZero(date.getMonth() + 1); // 월 (0부터 시작하므로 +1)
  const day = padZero(date.getDate()); // 일
  const year = date.getFullYear(); // 연도

  const hours = padZero(date.getHours()); // 시간 (24시간 기준)
  const minutes = padZero(date.getMinutes()); // 분
  const seconds = padZero(date.getSeconds()); // 초

  return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
}

// 로컬 시간으로 변환 후 MMDDYYYYHHMMSS 형식으로 반환
function convertUTCToLocalTimeWithFormat(utcTime) {
  const utcDate = new Date(utcTime); // UTC 시간 문자열을 Date 객체로 변환

  // 로컬 시간으로 변환
  const localDate = new Date(
    utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
  );

  // MMDDYYYYHHMMSS 형식으로 포맷
  const formattedDate = formatDateToMMDDYYYYHHMMSS(localDate);
  return formattedDate;
}

const { Content } = Layout;

const License = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [searchFilters, setSearchFilters] = useState({
    AIType: undefined,
    company: undefined,
    dealer_company: undefined,
    country: undefined,
    hospital: undefined,
    expire_date: undefined,
    deleted: false,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [selectedLicense, setSelectedLicense] = useState(null); // 선택된 Company data
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);

  useEffect(() => {
    // URLSearchParams로 쿼리 파라미터 파싱
    const searchParams = new URLSearchParams(location.search);
    const dealerCompany = searchParams.get("dealerCompany");

    if (dealerCompany) {
      console.log("Dealer Company:", decodeURIComponent(dealerCompany));
      setSearchFilters((prevFilters) => ({
        ...prevFilters,
        dealer_company: decodeURIComponent(dealerCompany),
      }));
      // 필요한 추가 처리
    } else {
      console.log("Dealer Company 파라미터가 없습니다.");
    }
  }, [location.search]);

  useEffect(() => {
    // 페이지를 로드할 때 실행
    updateLicenseList();
    fetchProductList();
  }, []);

  const updateLicenseList = async () => {
    setLoading(true);
    try {
      const result = await AxiosGet("/license/list");
      if (result.status === 200) {
        setList(
          result.data.data.map((item) => ({
            ...item,
            key: item.pk, // data의 key 값은 pk
          }))
        );
        setLoading(false);
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      if (error.status === 403) {
        navigate("/login");
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductList = async () => {
    try {
      const response = await AxiosGet("/product/list"); // 제품 목록을 불러오는 API 요청
      setProduct(response.data); // 받아온 데이터를 상태에 저장
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
  };

  const deleteLicense = async () => {
    if (selectedLicense) {
      setLoading(true);
      AxiosPut(`/license/withdrawal-subscription/${selectedLicense.pk}`)
        .then((result) => {
          log(result);
          if (result.status === 200) {
            updateLicenseList();
            setSelectedLicense(null);
            setLoading(false);
          }
        })
        .catch((error) => {
          log(error);
          if (error.status === 403) {
            navigate("/login");
          }
        });
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

  const getCompanyCode = (company_name) => {
    return list.find((item) => item.DealerCompany === company_name)?.UniqueCode;
  };

  const getAIDescription = (ai_type) => {
    if (!product) return ai_type;
    return product.find((item) => item.name === ai_type)?.description;
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
      title: "Dealer Company",
      dataIndex: "DealerCompany",
      key: "DealerCompany",
      fixed: "left",

      sorter: (a, b) => {
        return a.DealerCompany.localeCompare(b.DealerCompany);
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
      title: "Company",
      dataIndex: "Company",
      key: "Company",
      fixed: "left",
      sorter: (a, b) => {
        return a.Company.localeCompare(b.Company);
      },
    },
    {
      title: "Activate Date Time",
      dataIndex: "UTCActivateStartDate", // UTC 기준 데이터
      key: "UTCActivateStartDate",
      render: (text, record) => {
        if (!text) return "";

        const utcTime = text; // UTC 시간
        const formattedLocalTime = convertUTCToLocalTimeWithFormat(utcTime); // 브라우저의 타임존으로 시간 변환

        return formattedLocalTime;
      },
      sorter: (a, b) => {
        // 로컬 시간으로 비교하려면 UTC에서 9시간을 더해 한국 시간으로 변환 후 정렬
        const dateA = new Date(a.UTCActivateStartDate);
        const dateB = new Date(b.UTCActivateStartDate);

        return dateA - dateB; // 한국 시간 기준으로 정렬
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
          return (
            <Space>
              {Array.isArray(JSON.parse(text))
                ? JSON.parse(text).join(", ")
                : text}
              <Tooltip placement="top" title={getAIDescription(text)}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          );
        } catch (e) {
          // JSON 파싱 오류가 나면 원본 텍스트 반환
          return (
            <Space>
              {text}
              <Tooltip placement="top" title={getAIDescription(text)}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          );
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
    // {
    //   title: "S/N",
    //   dataIndex: "DetectorSerialNumber",
    //   key: "DetectorSerialNumber",

    //   ...getColumnSearchProps("DetectorSerialNumber"),
    // },
    {
      title: "Email",
      dataIndex: "UserEmail",
      key: "UserEmail",

      ...getColumnSearchProps("UserEmail"),
    },
    {
      title: "Deleted",
      dataIndex: "Deleted",
      key: "Deleted",
      hidden: searchFilters.deleted ? false : true,
      render: (text) => (text ? "Deleted" : ""),
    },
    {
      title: "Update",
      dataIndex: "UTCUpdatedAt",
      key: "UTCUpdatedAt",
      fixed: "right",
      render: (text, record, index) => {
        const utcTime = text; // UTC 시간
        const formattedLocalTime = convertUTCToLocalTimeWithFormat(utcTime); // 브라우저의 타임존으로 시간 변환

        return (
          <UpdateHistoryModal
            data={record}
            title={text ? formattedLocalTime : ""}
          />
        );
      },
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
  const hasSelected = selectedRowKeys.length > 0;

  const applyFilters = (item) => {
    const {
      company,
      dealer_company,
      country,
      hospital,
      expire_date,
      deleted,
      AIType,
    } = searchFilters;

    return (
      // deleted 플래그가 false일 경우 삭제된 라이센스는 보이지 않습니다.
      ((!deleted && item.Deleted === 0) || deleted) &&
      (!AIType || AIType?.includes(item?.AIType)) &&
      (!company || item.Company.includes(company)) &&
      (!dealer_company || item.DealerCompany.includes(dealer_company)) &&
      (!country || item.Country.includes(country)) &&
      (!hospital || item.Hospital.includes(hospital)) &&
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
        <AdvancedSearchForm
          data={list}
          product={product}
          onSearch={(filter) => setSearchFilters(filter)}
          searchFilters={searchFilters}
        />
        <Table
          rowClassName={(record) => (record.Deleted === 0 ? "" : "deleted-row")}
          rowSelection={rowSelection}
          loading={loading}
          title={() => (
            <Row justify={"space-between"}>
              <UpdateLicense
                type="primary"
                disabled={!hasSelected || selectedLicense.Deleted === 1}
                title="Update License"
                data={selectedLicense}
                onComplete={(data) => {
                  updateLicenseList();
                  setSelectedLicense(data);
                  setSelectedRowKeys([]);
                }}
              />
              <Space>
                <EditLicense
                  data={selectedLicense}
                  disabled={!hasSelected}
                  onComplete={(data) => {
                    updateLicenseList();
                    setSelectedLicense(data);
                    setSelectedRowKeys([]);
                  }}
                />
                {props.currentUser.permission_flag === "D" && (
                  <ButtonGroup>
                    <ADDLicense
                      product={product}
                      onAddFinish={() => updateLicenseList()}
                    />
                    {/* delete 상태 변경 */}
                    <Popconfirm
                      title="Are you sure to delete this license?"
                      onConfirm={() => {
                        deleteLicense();
                        setSelectedRowKeys([]);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        danger
                        disabled={!hasSelected || selectedLicense.Deleted === 1}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                    {/* Lisence 추가 테스트용 */}
                  </ButtonGroup>
                )}
              </Space>
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
  const formStyle = {
    background: colorBgContainer,
    padding: 24,
    borderRadius: borderRadiusLG,
    maxWidth: "none",
    borderRadius: borderRadiusLG,
    padding: 24,
  };

  useEffect(() => {
    form.setFieldsValue(props.searchFilters);
  }, [props.searchFilters]);

  // 여기에서 search 키워드 확인해서 검색

  const handleSelectChange = (value) => {
    // 'All'이 선택되었을 때, 다른 항목이 선택되면 'All'을 제거
    if (value.includes("all")) {
      if (value.length === 1) {
        // 'All'만 선택된 경우: 모든 항목을 선택
        value = props.product.map((item) => item.name);
      } else {
        // 'All'과 다른 항목이 선택된 경우: 'All'을 제거
        value = value.filter((item) => item !== "all");
      }
    }

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
            defaultValue={props.searchFilters?.AIType || ["all"]}
            onChange={handleSelectChange} // 선택 변경 시 실행
            allowClear
          >
            <Select.Option value={"all"}>All</Select.Option>
            {props.product
              .map((item) => item.name)
              .map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"company"}>
        <Form.Item name={`company`} label={`Company`}>
          <Input placeholder="search..." />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"dealer_company"}>
        <Form.Item name={`dealer_company`} label={`Dealer Company`}>
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
            className="w-full"
            placeholder={["Start Date", "End Date"]}
          />
        </Form.Item>
      </Col>
    );
    children.push(
      <Col span={8} key={"deleted"}>
        <Form.Item
          name={"deleted"}
          label={`View Deleted`}
          valuePropName="checked"
        >
          <Checkbox />
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
