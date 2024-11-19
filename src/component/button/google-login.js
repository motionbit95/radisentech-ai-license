import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Col } from "antd";
import { useNavigate } from "react-router-dom";
import { AxiosGet, AxiosPost, log } from "../../api";

function GoogleLoginButton() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(localStorage.getItem("token"));
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;

    console.log(credential);

    try {
      AxiosPost("/company/auth/google", {
        token: credential,
      }).then(async (response) => {
        if (response.status === 200) {
          AxiosGet(`/company/check-user-id/${response.data.user.id}`)
            .then(async (res) => {
              console.log(res);
              if (res.status === 200) {
                const user = response.data.user;
                navigate("/signup", { state: { user } });
              }
            })
            .catch((error) => {
              if (error.response.status === 401) {
                const user = response.data.user;
                AxiosPost("/company/login", {
                  user_id: user.id,
                  password: "default",
                }).then((res) => {
                  if (res.status === 200) {
                    localStorage.setItem("token", res.data.token);
                    navigate("/license", { state: { isLoggedIn: true } });
                  }
                });
              }
            });
        }
      });

      // console.log(response);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Col
        span={24}
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <GoogleLogin
          auto_select={true}
          // useOneTap

          locale="en"
          onSuccess={handleLoginSuccess}
          onError={() => console.log("로그인 오류")}
        />
      </Col>
    </GoogleOAuthProvider>
  );
}

export default GoogleLoginButton;
