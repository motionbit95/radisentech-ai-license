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
  message,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import CompanyEdit from "../modal/drawer";
import { useNavigate } from "react-router-dom";
import { AxiosDelete, AxiosGet } from "../api";
import ProductEdit from "../modal/product-Edit";
import ProductAdd from "../modal/product-Add";
import dayjs from "dayjs";
const { Content } = Layout;

const parseMonthsToYears = (months) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return years === 0
    ? `${remainingMonths === 1 ? "1 month" : `${remainingMonths} months`} `
    : `${years === 1 ? "1 year" : `${years} years`}`;
};

const Product = (props) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null); // 선택된 product data
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 플래그

  const [hasActive, setHasActive] = useState(false);

  useEffect(() => {
    fetchProductList();
  }, []);

  useEffect(() => {
    const getIsActive = async () => {
      try {
        const response = await AxiosGet(
          `/license/is-activated-aitype/${selectedProduct?.name} `
        ); // 제품 목록을 불러오는 API 요청
        if (response.status === 200) {
          // 등록된 AI Type이 있다는 뜻
          setHasActive(true);
        }
      } catch (error) {
        setHasActive(false);
        console.error("Error fetching product list:", error);
      }
    };

    if (selectedProduct) {
      getIsActive();
    }
  }, [selectedProduct]);

  const fetchProductList = async () => {
    try {
      const response = await AxiosGet("/product/list"); // 제품 목록을 불러오는 API 요청
      setList(response.data?.map((item) => ({ ...item, key: item.id }))); // 받아온 데이터를 상태에 저장
    } catch (error) {
      console.error("Error fetching product list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setLoading(true);

    try {
      await AxiosDelete(`/product/delete/${selectedProduct?.name}`);
      await fetchProductList(); // 데이터 갱신 후 로딩 해제
      message.success("Product deleted successfully");
      setSelectedProduct(null);
      setSelectedRowKeys([]);
    } catch (error) {
      if (error.response?.status === 401) {
        // 이미 라이센스에 등록된 product type의 경우 삭제 제한
        message.error(
          "Cannot delete product with name in use in LicenseManagement ProductType field."
        );
      } else if (error.response?.status === 403) {
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
      (record[dataIndex] ? record[dataIndex].toString() : "").includes(value),
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
      title: "AI Type",
      dataIndex: "name",
      key: "name",
      width: 150,

      sorter: (a, b) => a.name.localeCompare(b.name),

      ...getColumnSearchProps("name"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",

      ...getColumnSearchProps("description"),
    },
    {
      title: "Limit",
      dataIndex: "limit_month",
      key: "limit_month",
      render: (text) => (text ? parseMonthsToYears(text) : "-"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",

      sorter: (a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
      },

      render: (text) =>
        text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : "-",
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",

      sorter: (a, b) => {
        return new Date(a.updated_at) - new Date(b.updated_at);
      },

      render: (text) =>
        text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : "-",
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedProduct(list.find((c) => c.key === newSelectedRowKeys[0]));
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
                  <div></div>
                  <Space>
                    <ProductAdd
                      onComplete={(data) => {
                        fetchProductList();
                        setSelectedProduct(data);
                        setSelectedRowKeys([]);
                      }}
                    />
                    <Button
                      disabled={!hasSelected}
                      onClick={() => setSelectedRowKeys([])}
                    >
                      Cancel
                    </Button>
                    <ProductEdit
                      disabled={!hasSelected}
                      data={selectedProduct}
                      setLoading={setLoading}
                      onComplete={(data) => {
                        fetchProductList();
                        setSelectedProduct(data);
                        setSelectedRowKeys([]);
                      }}
                    />
                    <Popconfirm
                      title="Delete the Product?"
                      description={
                        "Are you sure you want to delete this product?"
                      }
                      onConfirm={handleDeleteProduct}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button disabled={!hasSelected || hasActive}>
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

export default Product;
