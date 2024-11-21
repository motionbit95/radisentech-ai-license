import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Col, message, Spin } from "antd";
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
        // 구글 로그인 성공했을 때
        if (response.status === 200) {
          AxiosPost(`/company/check-user-email`, {
            email: response.data.user.email,
            user_id: response.data.user.id,
          })
            .then((res) => {
              console.log(res);
              if (res.status === 200) {
                // 구글 로그인 성공
                AxiosPost("/company/login", {
                  user_id: response.data.user.id,
                  password: "default",
                })
                  .then((res) => {
                    // 토큰 발급 성공
                    if (res.status === 200) {
                      localStorage.setItem("token", res.data.token);
                      setLoading(false);
                      navigate("/license", { state: { isLoggedIn: true } });
                    }
                  })
                  .catch((error) => {
                    // 토큰 발급 실패
                    if (error.response.status === 401) {
                      message.error(error.response.data.error);
                      setLoading(false);
                    }
                  });
              }

              if (res.status === 201) {
                // 해당 회원이 없음 회원가입 화면으로 이동
                const user = response.data.user;
                setLoading(false);
                navigate("/signup", { state: { user } });
              }
            })
            .catch((error) => {
              // 401 - 해당 이메일로는 가입할 수 없음
              if (error.response.status === 401) {
                message.error(error.response.data.error);
                setLoading(false);
              }
            });
        }
      });
    } catch (error) {
      // 구글 로그인 실패했을 때
      message.error("Google login failed. Please try again.");
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
