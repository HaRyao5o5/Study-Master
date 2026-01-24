// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestoreの設定
const firestoreDb = getFirestore(app);

// オフライン永続化を有効にする（エラーは無視）
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(firestoreDb, {
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // 複数のタブが開いている場合
      console.warn('Firestore: 複数のタブが開いているため、永続化は最初のタブでのみ有効です');
    } else if (err.code === 'unimplemented') {
      // ブラウザが対応していない場合
      console.warn('Firestore: このブラウザは永続化をサポートしていません');
    } else {
      console.warn('Firestore persistence error:', err);
    }
  });
}

export const db = firestoreDb;
export const storage = getStorage(app);

// --- 既存の関数 ---

export const saveUserData = async (user) => {
  if (!user) return;
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        userStats: {
          totalXp: 0,
          level: 1,
          streak: 0,
          lastLogin: ''
        }
      });
    }
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const updateUserProfile = async (user, newName) => {
  if (!user || !newName) return;
  try {
    // 1. Firebase Authのキャッシュ更新
    await updateProfile(user, { displayName: newName });

    // 2. Firestoreのユーザーデータ更新（ランキング用）
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { displayName: newName });

    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("userStats.totalXp", "desc"), limit(50));

    const querySnapshot = await getDocs(q);
    const leaderboard = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        displayName: data.displayName || 'Unknown Warrior',
        photoURL: data.photoURL || null,
        totalXp: data.userStats?.totalXp || 0,
        level: data.userStats?.level || 1,
        streak: data.userStats?.streak || 0
      });
    });

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    // エラー時は空の配列を返す
    return [];
  }
};

export { signInWithPopup, signOut };