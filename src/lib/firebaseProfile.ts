// src/lib/firebaseProfile.ts
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfileData {
  displayName?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

/**
 * プロフィールデータの取得
 */
export const getProfile = async (uid: string) => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * プロフィールデータの更新
 */
export const updateProfile = async (uid: string, profileData: UserProfileData) => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    const profileSnap = await getDoc(profileRef);
    
    const now = new Date();
    
    if (profileSnap.exists()) {
      // 既存プロフィールの更新
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: now
      });
    } else {
      // 新規プロフィールの作成
      await setDoc(profileRef, {
        ...profileData,
        createdAt: now,
        updatedAt: now
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * デフォルトプロフィールの作成
 */
export const createDefaultProfile = async (uid: string, displayName: string = 'ユーザー') => {
  const defaultProfile = {
    displayName: displayName,
    avatar: 'avatar-1', // デフォルトアバター
  };
  
  await updateProfile(uid, defaultProfile);
  return defaultProfile;
};
