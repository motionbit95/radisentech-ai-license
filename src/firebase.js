// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDJRvpxyAmWFpCnSYLb2hpKpQDigAkH4Og",
  authDomain: "crack-atlas-441608-m9.firebaseapp.com",
  projectId: "crack-atlas-441608-m9",
  storageBucket: "crack-atlas-441608-m9.firebasestorage.app",
  messagingSenderId: "674500122407",
  appId: "1:674500122407:web:d00d37b18e120c59f13b02",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
