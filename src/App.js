import React, { useEffect, useState } from "react";
import License from "./page/license";
import {
  Button,
  Col,
  Layout,
  Menu,
  Result,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { Footer, Header } from "antd/es/layout/layout";
import { useLocation, useNavigate } from "react-router-dom";
import Company from "./page/company";
import LicenseDealer from "./page/licenseDealer";
import axios from "axios";

function App({ page }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [permission_flag, setPermissionFlag] = useState("");

  // 관리자(개발자)로 로그인 했을 경우 permission_flag(D)
  // 관리자(CS)의 경우(Y)
  // Dealer의 경우(N)

  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/company/user-info`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Authorization 헤더 추가
          },
        })
        .then((response) => {
          if (response.status === 200) {
            // console.log("CURRENT_USER", response.data);
            setCurrentUser(response.data);
            setPermissionFlag(response.data.permission_flag);
            setLoading(false);
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            navigate("/login");
          }
        });
    };

    getUser();
  }, []);

  const items = [
    // Admin 계정 일 경우 License, Company, Statistics
    // Delear 일 경우 LicenseDealer, Statistics
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
          </Col>
          <Col span={12} direction style={{ textAlign: "right" }}>
            {isLoggedIn ? (
              <Button
                onClick={() => {
                  // 저장된 토큰을 삭제합니다.
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                  navigate("/");
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Login
              </Button>
            )}
          </Col>
        </Header>
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
                {permission_flag === "N" && <LicenseDealer />}
                {(permission_flag === "Y" || permission_flag === "D") && (
                  <License permission_flag />
                )}
              </>
            )}
            {page === "company" && <Company />}
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
