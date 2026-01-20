// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ★追加

const firebaseConfig = {
  apiKey: "AIzaSyBwcFNJHEzSq2s6IuXKdFMFpwZchoQW058",
  authDomain: "study-master-72997.firebaseapp.com",
  projectId: "study-master-72997",
  storageBucket: "study-master-72997.firebasestorage.app", // ここが重要
  messagingSenderId: "103028404835",
  appId: "1:103028404835:web:88ae5e62d977a4ef50be56"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); // ★追加