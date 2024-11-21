import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { AxiosGet, AxiosPost, log } from "../../api";

function GoogleLoginButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(localStorage.getItem("token"));
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;

    console.log(credential);
    setLoading(true);

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
                setLoading(false);
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
                    setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Spin
        size="large"
        spinning={loading}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
        }}
      />
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
