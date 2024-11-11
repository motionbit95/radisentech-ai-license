// api.js
import axios from "axios";

// 기본 Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL, // API 기본 URL 설정
  timeout: 5000, // 요청 시간 초과 설정
});

// 요청 시 공통 설정 (예: 헤더 추가)
axiosInstance.interceptors.request.use(
  (config) => {
    // 공통 Authorization 헤더 설정
    config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 시 공통 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 응답 처리
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// GET 요청 함수
export const AxiosGet = async (url, config = {}) => {
  try {
    const response = await axiosInstance.get(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// POST 요청 함수
export const AxiosPost = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// PUT 요청 함수
export const AxiosPut = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// DELETE 요청 함수
export const AxiosDelete = async (url, config = {}) => {
  try {
    const response = await axiosInstance.delete(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};

export const log = (...arg) => {
  console.log(arg);
};
