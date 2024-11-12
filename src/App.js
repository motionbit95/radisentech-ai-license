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

  // 로그인한 유저 데이터 가져오기
  useEffect(() => {
    const getUser = async () => {
      AxiosGet("/company/user-info")
        .then((response) => {
          log(response);
          if (response?.status === 200) {
            // log("CURRENT_USER", response.data);
            setCurrentUser(response.data);
            setPermissionFlag(response.data.permission_flag);
          }
        })
        .catch((error) => {
          log(error);
          if (error?.response?.status === 403) {
            navigate("/login");
          }
        });
    };

    getUser();
  }, []);

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
            label: "Product List",
          },
        ]),
    {
      key: "statistics",
      label: "Statistics",
      disabled: true,
    },
  ];

  // 로그인 페이지에서 라이센스 페이지로 이동할 때 로그인 플래그를 받습니다.
  const [isLoggedIn, setIsLoggedIn] = useState(
    /*location.state?.isLoggedIn*/ true
  );

  useEffect(() => {
    // 로그인 된 사용자의 경우 lisecse 페이지로 리다이렉트
    if (isLoggedIn && window.location.pathname === "/") {
      navigate("/license");
    }

    // 페이지를 로드할 때 로그인 토큰을 확인하여 기 로그인 사용자의 경우 로그인을 처리합니다.
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Space size={"large"} direction="vertical">
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
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

          <Col span={12} direction style={{ textAlign: "right" }}>
            <Space>
              {isLoggedIn ? (
                <Space>
                  <Button
                    onClick={() => {
                      // 저장된 토큰을 삭제합니다.
                      localStorage.removeItem("token");
                      setIsLoggedIn(false);
                      navigate("/login");
                    }}
                  >
                    Logout
                  </Button>
                </Space>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    googleLogout();
                    // 저장된 토큰을 삭제합니다.
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
              )}
              {/* <Switch checked={isDarkMode} onChange={toggleTheme} /> */}
            </Space>
          </Col>
        </Header>
        <div></div>
        {/* 로그인 되어있지 않은 사용자의 경우 접근 제한 / 로그인 유도 */}
        {!isLoggedIn ? (
          <div>
            <Result
              status="403"
              title="403"
              subTitle="Sorry, you are not authorized to access this page."
              extra={
                <Button type="primary" onClick={() => navigate("/login")}>
                  Login Account
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {page === "license" && (
              <>
                {permission_flag === "N" && (
                  <LicenseDealer currentUser={currentUser} />
                )}
                {(permission_flag === "Y" || permission_flag === "D") && (
                  <License currentUser={currentUser} />
                )}
              </>
            )}

            {page === "company" && permission_flag && (
              <>
                {permission_flag === "Y" || permission_flag === "D" ? (
                  <Company currentUser={currentUser} />
                ) : (
                  <div>
                    <Result
                      status="403"
                      title="403"
                      subTitle="Sorry, you are not authorized to access this page."
                      extra={
                        <Button
                          type="primary"
                          onClick={() => navigate("/login")}
                        >
                          Login Account
                        </Button>
                      }
                    />
                  </div>
                )}
              </>
            )}
            {page === "product" && permission_flag && (
              <>
                {permission_flag === "Y" || permission_flag === "D" ? (
                  <Product currentUser={currentUser} />
                ) : (
                  <div>
                    <Result
                      status="403"
                      title="403"
                      subTitle="Sorry, you are not authorized to access this page."
                      extra={
                        <Button
                          type="primary"
                          onClick={() => navigate("/login")}
                        >
                          Login Account
                        </Button>
                      }
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          ©2024 Created by RadiSen
        </Footer>
      </Space>
    </Layout>
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
