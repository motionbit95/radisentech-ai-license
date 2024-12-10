import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Layout,
  Result,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Col,
  Typography,
  message,
  Tooltip,
  Image,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import GenerateModal from "../modal/generate";
import CompanyEdit from "../modal/drawer";
import { useNavigate } from "react-router-dom";
import LicenseHistoryModal from "../modal/license-history";
import { AxiosDelete, AxiosGet, AxiosPost, log } from "../api";
import IniFileDownload from "../component/button/download";
import CompanyTransfer from "../modal/company-copy";
import { render } from "@testing-library/react";

const { Content } = Layout;

const Company = (props) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [selectedCompany, setSelectedCompany] = useState(null); // 선택된 Company data
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 플래그

  useEffect(() => {
    // 페이지를 로드할 때 실행
    fetchCompanyList();
  }, []);

  const fetchCompanyList = async () => {
    setLoading(true);
    try {
      const result = await AxiosGet("/company/list");

      if (result.status === 200) {
        let newArr = await Promise.all(
          result.data.map(async (item, index) => {
            const res = await AxiosGet(`/license/list/${item.unique_code}`);
            if (res.status === 200) {
              return {
                ...item,
                use_cnt: res.data.data.length || 0,
                key: item.user_id,
                originalIndex: index, // 원래 인덱스 저장
              };
            } else {
              return {
                ...item,
                use_cnt: 0,
                key: item.user_id,
                originalIndex: index,
              };
            }
          })
        );

        // 원래 인덱스 순서대로 정렬
        newArr.sort((a, b) => a.originalIndex - b.originalIndex);
        setList(newArr); // 정렬된 배열로 설정
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/login");
      } else {
        console.error("Error:", error.message);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    setLoading(true);

    try {
      await AxiosDelete(`/company/delete/${selectedCompany?.id}`);
      await fetchCompanyList(); // 데이터 갱신 후 로딩 해제
      setSelectedCompany(null);
      setSelectedRowKeys([]);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/login");
      } else if (error.response?.status === 500) {
        message.error("Failed to delete company. Licenses History exists.");
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false); // fetchCompanyList가 완료된 후 로딩 해제
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
    onFilter: (value, record) => record[dataIndex] === value,
    filterSearch: true,
    ellipsis: true,
    // filters: list // filter options 설정
    //   .map((item) => item[dataIndex])
    //   .filter((value, index, self) => self.indexOf(value) === index)
    //   .map((value) => ({ text: value, value })),
    filters: list
      .map((item) => item[dataIndex])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((value) => ({
        text:
          value.toString() === "D"
            ? "Supervisor"
            : value === "Y"
            ? "Admin"
            : "Dealer",
        value,
      })),
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
      width: 150,

      ...getColumnSearchProps("user_id"),
      sorter: (a, b) => {
        return a.user_id.localeCompare(b.user_id);
      },

      render: (text, record) => (
        <>
          {record.provider === 0 ? (
            text
          ) : (
            <Space>
              <Image
                preview={false}
                width={20}
                src={require(`../asset/pngwing.com.png`)}
              />

              <Tooltip placement="top" title={text}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          )}
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",

      ...getColumnSearchProps("email"),
    },
    {
      title: "Dealer Company",
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

      render: (text) => (
        <Row gutter={8}>
          <Col span={16}>
            <Typography.Text style={{ whiteSpace: "nowrap" }}>
              {text}
            </Typography.Text>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <IniFileDownload code={text} />
          </Col>
        </Row>
      ),
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
    ...(props.currentUser.permission_flag === "D" ||
    props.currentUser.permission_flag === "Y"
      ? [
          {
            title: "Permission",
            dataIndex: "permission_flag",
            key: "permission_flag",
            render: (text) => (
              <Tag
                color={text === "D" ? "red" : text === "Y" ? "blue" : "green"}
              >
                {text === "D"
                  ? "Supervisor"
                  : text === "Y"
                  ? "Admin"
                  : "Dealer"}
              </Tag>
            ),

            sorter: (a, b) => {
              return a.permission_flag.localeCompare(b.permission_flag);
            },

            ...getColumnFilterProps("permission_flag"),
          },
        ]
      : []),
    {
      title: "License\n[Use/Rem/Tot]",
      dataIndex: "license_cnt",
      key: "license_cnt",
      fixed: "right",
      render: (text, record, index) => (
        <Space>
          <LicenseHistoryModal
            currentUser={props.currentUser}
            data={record}
            title={`${record.use_cnt} / 
             ${text - parseInt(record.use_cnt)}
             / ${text}`}
            onCancel={() => {
              fetchCompanyList();
            }}
          />
        </Space>
      ),
    },
    {
      title: "Search",
      fixed: "right",
      render: (text, record, index) => (
        <Button
          onClick={() => {
            console.log(record.company_name);
            const encodedCompanyName = encodeURIComponent(record.company_name);
            // navigate(`/license?dealerCompany=${encodedCompanyName}`);
            window.location.href = `/license?dealerCompany=${encodedCompanyName}`;
          }}
          icon={<SearchOutlined />}
        />
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    log(list.find((c) => c.key === newSelectedRowKeys[0]));
    setSelectedCompany(list.find((c) => c.key === newSelectedRowKeys[0]));
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <>
      {error ? (
        <Result
          status="403"
          title={error.code}
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Login Account
            </Button>
          }
        />
      ) : (
        <Content
          style={{
            padding: "48px",
          }}
        >
          <Space size={"large"} direction="vertical" className="w-full">
            <Table
              rowSelection={rowSelection}
              loading={loading}
              title={() => (
                <Row justify={"space-between"}>
                  <GenerateModal
                    title="Generate License"
                    type="primary"
                    aiType={selectedCompany?.product}
                    data={selectedCompany}
                    disabled={!hasSelected}
                    onComplete={(data) => {
                      fetchCompanyList();
                      setSelectedCompany(data);
                      setSelectedRowKeys([]);
                    }}
                    setLoading={setLoading}
                  />
                  <Space>
                    <CompanyTransfer
                      disabled={
                        !hasSelected ||
                        selectedCompany?.permission_flag === "D" ||
                        selectedCompany?.license_cnt === 0
                      }
                      data={selectedCompany}
                      list={list}
                      permission_flag={props.currentUser.permission_flag}
                      onComplete={(data) => {
                        fetchCompanyList();
                        setSelectedCompany(data);
                        setSelectedRowKeys([]);
                      }}
                      setLoading={setLoading}
                    />
                    <Button
                      disabled={!hasSelected}
                      onClick={() => setSelectedRowKeys([])}
                    >
                      Cancel
                    </Button>
                    <CompanyEdit
                      currentUser={props.currentUser}
                      disabled={
                        !hasSelected || selectedCompany?.permission_flag === "D"
                      }
                      isLicense={selectedCompany?.use_cnt > 0}
                      isGenerate={selectedCompany?.license_cnt > 0}
                      data={selectedCompany}
                      permission_flag={props.currentUser.permission_flag}
                      onComplete={(data) => {
                        fetchCompanyList();
                        setSelectedCompany(data);
                        setSelectedRowKeys([]);
                      }}
                      setLoading={setLoading}
                    />
                    <Popconfirm
                      title="Delete the Account?"
                      description={
                        <>
                          <div>Are you sure to delete this account?</div>
                          <div>License history will also be deleted.</div>
                        </>
                      }
                      onConfirm={handleDeleteCompany}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        disabled={
                          !hasSelected ||
                          selectedCompany?.permission_flag === "D" ||
                          selectedCompany?.license_cnt > 0
                        }
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </Row>
              )}
              pagination={{
                defaultCurrent: 1,
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              columns={companyColumns}
              dataSource={
                props.currentUser.permission_flag === "D"
                  ? list
                  : list.filter((item) => item.permission_flag !== "D")
              }
              scroll={{
                x: "max-content",
              }}
              onChange={handleChange}
            />
          </Space>
        </Content>
      )}
    </>
  );
};

export default Company;
