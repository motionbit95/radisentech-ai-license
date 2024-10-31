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
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import ButtonGroup from "antd/es/button/button-group";
import GenerateModal from "../modal/generate";
import CompanyEdit from "../modal/drawer";
import { useNavigate } from "react-router-dom";
import LicenseHistoryModal from "../modal/license-history";
import { AxiosDelete, AxiosGet, AxiosPost } from "../api";

const { Content } = Layout;

const Company = () => {
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
        setList(result.data.map((item) => ({ ...item, key: item.user_id })));
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      if (error.response?.status === 401) {
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
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false); // fetchCompanyList가 완료된 후 로딩 해제
    }
  };

  const copyUser = async () => {
    setLoading(true);

    try {
      const result = await AxiosPost(
        `/company/copy-user/${selectedCompany?.id}`
      );

      if (result.status === 201) {
        await fetchCompanyList(); // 데이터 갱신이 완료된 후 로딩 해제
        setSelectedRowKeys([]);
      } else if (result.status === 401) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error:", error);
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
      dataIndex: "user_id",
      key: "user_id",
      fixed: "left",
      width: 150,

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
      dataIndex: "unique_code",
      key: "unique_code",
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
    {
      title: "License",
      dataIndex: "license_cnt",
      key: "license_cnt",
      fixed: "right",
      render: (text, record, index) => (
        <LicenseHistoryModal history={[]} title={text} />
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    console.log(list.find((c) => c.key === newSelectedRowKeys[0]));
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
                    data={selectedCompany}
                    disabled={!hasSelected}
                    onComplete={(data) => {
                      fetchCompanyList();
                      setSelectedCompany(data);
                      setSelectedRowKeys([]);
                    }}
                    setLoading={setLoading}
                  />
                  <ButtonGroup>
                    <Popconfirm
                      title="Copy the Account?"
                      description="Are you sure to copy this account?"
                      onConfirm={copyUser}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button disabled={!hasSelected}>Copy</Button>
                    </Popconfirm>
                    <Button
                      disabled={!hasSelected}
                      onClick={() => setSelectedRowKeys([])}
                    >
                      Cancel
                    </Button>
                    <CompanyEdit
                      disabled={!hasSelected}
                      data={selectedCompany}
                      onComplete={(data) => {
                        fetchCompanyList();
                        setSelectedCompany(data);
                        setSelectedRowKeys([]);
                      }}
                      setLoading={setLoading}
                    />
                    <Popconfirm
                      title="Delete the Account?"
                      description="Are you sure to delete this account?"
                      onConfirm={handleDeleteCompany}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button disabled={!hasSelected}>Delete</Button>
                    </Popconfirm>
                  </ButtonGroup>
                </Row>
              )}
              pagination={{
                defaultCurrent: 1,
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              columns={companyColumns}
              dataSource={list}
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
