// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyDJRvpxyAmWFpCnSYLb2hpKpQDigAkH4Og",
  authDomain: "crack-atlas-441608-m9.firebaseapp.com",
  projectId: "crack-atlas-441608-m9",
  storageBucket: "crack-atlas-441608-m9.firebasestorage.app",
  messagingSenderId: "674500122407",
  appId: "1:674500122407:web:d00d37b18e120c59f13b02",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 필요한 항목 내보내기
export { auth };
