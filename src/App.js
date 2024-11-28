import React, { useEffect, useState } from "react";
import License from "./page/license-admin";
import {
  Button,
  Col,
  Image,
  Layout,
  Menu,
  Result,
  Space,
  Spin,
  Switch,
  Tag,
} from "antd";
import { Footer, Header } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import Company from "./page/company";
import LicenseDealer from "./page/license-dealer";
import { AxiosGet, log } from "./api";
import Product from "./page/product";
import Logo from "./asset/logo-black.svg";
import { googleLogout } from "@react-oauth/google";

function App({ page, toggleTheme, isDarkMode }) {
  const navigate = useNavigate();
  const [permission_flag, setPermissionFlag] = useState(""); // D: Developer, Y: Admin, N: Delear

  const [currentUser, setCurrentUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await AxiosGet("/company/user-info");
        if (response?.status === 200) {
          setCurrentUser(response.data);
          setPermissionFlag(response.data.permission_flag);
          setIsLoggedIn(true);
        }
      } catch (error) {
        if (error?.response?.status === 403) {
          setCurrentUser({});
          setIsLoggedIn(false);
          navigate("/login");
        }
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    getUser();
  }, [navigate]);

  const items = [
    {
      key: "license",
      label: "License List",
    },
    ...(permission_flag === "N"
      ? []
      : [
          {
            key: "company",
            label: "Company List",
          },
        ]),
    ...(permission_flag === "N"
      ? []
      : [
          {
            key: "product",
            label: "AI List",
          },
        ]),
    {
      key: "statistics",
      label: "Statistics",
      disabled: true,
    },
  ];

  useEffect(() => {
    if (isLoggedIn && window.location.pathname === "/") {
      navigate("/license");
    }
  }, [isLoggedIn, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isLoggedIn ? (
    <Layout style={{ minHeight: "100vh" }}>
      <Space size={"large"} direction="vertical">
        {/* 헤더 */}
        <Header style={{ display: "flex", alignItems: "center" }}>
          <Col span={12}>
            <Space size="large">
              <div style={{ textAlign: "center" }}>
                <Image preview={false} src={Logo} alt="logo" width={100} />
              </div>
              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={page ? [page] : ["license"]}
                items={items}
                style={{ flex: 1, minWidth: 0 }}
                onClick={({ key }) => {
                  navigate(`/${key}`);
                }}
              />
            </Space>
          </Col>

          <Col span={12} style={{ textAlign: "right" }}>
            <Space>
              {currentUser.user_id && (
                <Space>
                  <div style={{ color: "white" }}>{currentUser.user_id}</div>
                  <Tag
                    color={
                      permission_flag === "D"
                        ? "red"
                        : permission_flag === "Y"
                        ? "blue"
                        : "green"
                    }
                  >
                    {permission_flag === "D"
                      ? "Supervisor"
                      : permission_flag === "Y"
                      ? "Admin"
                      : "Dealer"}
                  </Tag>
                </Space>
              )}
              <Button
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </Space>
          </Col>
        </Header>

        {/* 페이지 내용 */}
        {page === "license" &&
          (permission_flag === "N" ? (
            <LicenseDealer currentUser={currentUser} />
          ) : (
            <License currentUser={currentUser} />
          ))}

        {page === "company" &&
          (permission_flag === "Y" || permission_flag === "D" ? (
            <Company currentUser={currentUser} />
          ) : (
            <Result status="403" title="403" subTitle="Unauthorized" />
          ))}

        {page === "product" &&
          (permission_flag === "Y" || permission_flag === "D" ? (
            <Product currentUser={currentUser} />
          ) : (
            <Result status="403" title="403" subTitle="Unauthorized" />
          ))}
      </Space>
      <Footer style={{ textAlign: "center" }}>©2024 Created by RadiSen</Footer>
    </Layout>
  ) : (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={() => navigate("/login")}>
          Login
        </Button>
      }
    />
  );
}

export default App;

export const LoadingScreen = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // height: "100vh",
      }}
    >
      <Spin size="large" />
    </div>
  );
};
