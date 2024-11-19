import React, { useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth"; // Firebase 인증 관련 모듈
import { auth } from "../../firebase"; // Firebase 설정 파일
import { AxiosGet, AxiosPost } from "../../api";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  // Google 로그인 성공 시 호출되는 함수
  const handleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    console.log("Google OAuth Credential:", credential);

    try {
      // Firebase 인증을 위한 Google 인증 provider 설정
      const googleCredential = GoogleAuthProvider.credential(credential); // Firebase 인증에 사용할 Google credential 생성
      const result = await signInWithCredential(auth, googleCredential); // Firebase 인증

      const user = result.user;
      console.log("Authenticated user with Firebase:", user);

      // 인증이 완료된 후 백엔드로 인증 토큰 전송
      AxiosPost("/company/auth/google", { token: credential })
        .then(async (response) => {
          if (response.status === 200) {
            // 사용자 정보 확인
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
        })
        .catch((error) => {
          console.error("Google 로그인 실패:", error);
        });
    } catch (error) {
      console.error("Firebase 인증 실패:", error);
    }
  };

  // Google 로그인 실패 시 호출되는 함수
  const handleLoginFailure = (error) => {
    console.error("Google 로그인 실패:", error);
  };

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
