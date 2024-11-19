import React, { useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"; // import GoogleLogin from @react-oauth/google
import { auth } from "../../firebase"; // Firebase 설정 파일
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { AxiosGet, AxiosPost } from "../../api";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  // Google 로그인 성공 시 호출되는 함수
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

  // Google 로그인 실패 시 호출되는 함수
  const handleLoginFailure = (error) => {
    console.error("Google 로그인 실패:", error);
  };

  // 리디렉션 후 결과 처리 (페이지 로드 후 호출)
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Authenticated user:", user);
      }
    });
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleLoginSuccess} // 로그인 성공 시 처리
          onError={handleLoginFailure} // 로그인 실패 시 처리
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleLoginButton;
