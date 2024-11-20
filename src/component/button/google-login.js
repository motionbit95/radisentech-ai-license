import React, { useState } from "react";
import { Button, message } from "antd";
import { auth, provider, signInWithPopup } from "../../firebaseConfig";
import { AxiosGet, AxiosPost } from "../../api";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      AxiosPost("/company/check-user-email/", {
        user_id: user.uid,
        email: user.email,
      })
        .then((response) => {
          if (response.status === 200) {
            message.success(response.data.message);
            AxiosPost("/company/login", {
              user_id: user.uid,
              password: "default",
            })
              .then((res) => {
                if (res.status === 200) {
                  localStorage.setItem("token", res.data.token);
                  navigate("/license", { state: { isLoggedIn: true } });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
          if (response.status === 201) {
            message.success(response.data.message);
            // signup 페이지로 이동
            navigate("/signup", {
              state: {
                user: {
                  id: user.uid,
                  email: user.email,
                  name: user.displayName,
                },
              },
            });
          }
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            // 에러
            message.error(error.response.data.message);
          }
        });
    } catch (error) {
      console.error("Error during Google login:", error);
      message.error("Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="large"
      icon={
        <img
          src={require("../../asset/pngwing.com.png")}
          width="20px"
          alt="Google"
        />
      }
      loading={loading}
      onClick={handleGoogleLogin}
      style={{ margin: "10px" }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;
