import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import LoginForm from "./page/login";
import SignUp from "./page/signup";
import { Button, ConfigProvider, Result } from "antd";
import ForgotPw from "./page/find-password";

const lightTheme = {};

const darkTheme = {
  token: {
    colorBgBase: "#141414", // 배경 색
    colorBgContainer: "#1f1f1f",
    colorText: "#fff",
    colorTextSecondary: "#bfbfbf", // 보조 텍스트 색
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
const Root = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // 테마 상태 관리

  // 다크모드 또는 라이트모드 테마 선택
  const currentTheme = !isDarkMode ? darkTheme : lightTheme;

  // 테마 전환 함수
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  // 라우터 관리
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginForm />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/forgot",
      element: <ForgotPw />,
    },
    {
      path: "/",
      element: <App toggleTheme={toggleTheme} isDarkMode={isDarkMode} />,
    },
    {
      path: "/license",
      element: (
        <App page="license" toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      ),
    },
    {
      path: "/company",
      element: (
        <App page="company" toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      ),
    },
    {
      path: "/product",
      element: (
        <App page="product" toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      ),
    },
    {
      path: "/*",
      element: (
        <div className="center">
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
              <Button
                type="primary"
                onClick={() => (window.location.href = "/")}
              >
                Back Home
              </Button>
            }
          />
        </div>
      ),
    },
  ]);

  return (
    <React.StrictMode>
      <ConfigProvider
      // theme={currentTheme}
      >
        {/* Router 내에 버튼을 전달하여 테마 전환 */}
        <RouterProvider router={router} />
      </ConfigProvider>
    </React.StrictMode>
  );
};

root.render(<Root />);
