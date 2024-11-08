import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import LoginForm from "./page/login";
import SignUp from "./page/signup";
import { Button, ConfigProvider, Result } from "antd";
import ForgotPw from "./page/find-password";

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
    element: <App />,
  },
  {
    path: "/license",
    element: <App page="license" />,
  },
  {
    path: "/company",
    element: <App page="company" />,
  },
  {
    path: "/*",
    element: (
      <div className="center">
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<Button type="primary">Back Home</Button>}
        />
      </div>
    ),
  },
]);

const lightTheme = {
  token: {
    colorPrimary: "blue",
  },
};

const darkTheme = {
  token: {
    colorPrimary: "black",
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>
);
