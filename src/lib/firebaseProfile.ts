import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { claimUsername } from './usernameRegistry';
import { Profile } from '../types';

export interface UserProfileData {
  name?: string;
  username?: string;
  bio?: string;
  avatarId?: string;
  customAvatarUrl?: string | null; // URL from Storage or null to remove
  avatarSettings?: {
    scale: number;
    position: { x: number; y: number };
  } | null;
  title?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  } | null;
  createdAt?: string; // Changed to string for serialization safety
  updatedAt?: string;
  [key: string]: any;
}

/**
 * プロフィールデータの取得
 */
export const getProfile = async (uid: string): Promise<Profile | null> => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { uid, ...profileSnap.data() } as Profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * アバター画像のアップロード
 */
export const uploadAvatar = async (uid: string, file: Blob): Promise<string> => {
  try {
    const storageRef = ref(storage, `users/${uid}/profile/avatar.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * プロフィールデータの更新
 * ユーザー名の変更がある場合、claimUsernameを呼び出します
 */
export const updateProfile = async (uid: string, profileData: UserProfileData, currentUsername?: string) => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    const profileSnap = await getDoc(profileRef);
    
    const now = new Date().toISOString();
    
    // ユーザー名の変更処理
    if (profileData.username && profileData.username !== currentUsername) {
        await claimUsername(uid, profileData.username, currentUsername);
    }
    
    // Remove undefined values to avoid Firestore errors.
    // Explicit nulls are preserved to allow field deletion/clearing.
    const safeData = Object.entries(profileData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
             acc[key] = value;
        }
        return acc;
    }, {} as any);

    if (profileSnap.exists()) {
      // 既存プロフィールの更新
      await updateDoc(profileRef, {
        ...safeData,
        updatedAt: now
      });
    } else {
      // 新規プロフィールの作成
      await setDoc(profileRef, {
        ...safeData,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // Sync critical data to root user document for Leaderboard/Search optimization
    const userRootRef = doc(db, 'users', uid);
    const rootUpdates: any = {};
    
    if (safeData.name !== undefined) rootUpdates.displayName = safeData.name;
    if (safeData.customAvatarUrl !== undefined) rootUpdates.photoURL = safeData.customAvatarUrl;
    if (safeData.avatarId !== undefined) rootUpdates.avatarId = safeData.avatarId;
    
    if (Object.keys(rootUpdates).length > 0) {
        // Use set with merge to create if not exists
        await setDoc(userRootRef, rootUpdates, { merge: true });
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
    name: displayName,
    avatarId: 'avatar-1', // デフォルトアバター
  };
  
  await updateProfile(uid, defaultProfile);
  return defaultProfile;
};
