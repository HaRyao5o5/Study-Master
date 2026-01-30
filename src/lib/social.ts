// src/lib/social.ts
// ソーシャル機能（フォロー、タイムライン）の API

import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  getDoc
} from 'firebase/firestore';
import { FollowRelation, Activity, ActivityType, SocialStats } from '../types';

// ========================================
// フォロー機能
// ========================================

/**
 * ユーザーをフォローする
 */
export const followUser = async (myUid: string, targetUid: string): Promise<void> => {
  if (myUid === targetUid) throw new Error('自分自身をフォローすることはできません');

  const timestamp = Date.now();
  
  // 自分の following に追加
  const followingRef = doc(db, 'users', myUid, 'following', targetUid);
  await setDoc(followingRef, {
    uid: targetUid,
    followedAt: timestamp
  });

  // 相手の followers に追加
  const followerRef = doc(db, 'users', targetUid, 'followers', myUid);
  await setDoc(followerRef, {
    uid: myUid,
    followedAt: timestamp
  });
};

/**
 * ユーザーのフォローを解除する
 */
export const unfollowUser = async (myUid: string, targetUid: string): Promise<void> => {
  // 自分の following から削除
  const followingRef = doc(db, 'users', myUid, 'following', targetUid);
  await deleteDoc(followingRef);

  // 相手の followers から削除
  const followerRef = doc(db, 'users', targetUid, 'followers', myUid);
  await deleteDoc(followerRef);
};

/**
 * フォロー中かどうかを確認する
 */
export const isFollowing = async (myUid: string, targetUid: string): Promise<boolean> => {
  const followingRef = doc(db, 'users', myUid, 'following', targetUid);
  const snap = await getDoc(followingRef);
  return snap.exists();
};

/**
 * フォロー中のユーザー一覧を取得する
 */
export const getFollowing = async (uid: string): Promise<FollowRelation[]> => {
  const followingRef = collection(db, 'users', uid, 'following');
  const q = query(followingRef, orderBy('followedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    followedAt: doc.data().followedAt
  }));
};

/**
 * フォロワー一覧を取得する
 */
export const getFollowers = async (uid: string): Promise<FollowRelation[]> => {
  const followersRef = collection(db, 'users', uid, 'followers');
  const q = query(followersRef, orderBy('followedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    followedAt: doc.data().followedAt
  }));
};

/**
 * フォロー数とフォロワー数を取得する
 */
export const getSocialStats = async (uid: string): Promise<SocialStats> => {
  const [following, followers] = await Promise.all([
    getDocs(collection(db, 'users', uid, 'following')),
    getDocs(collection(db, 'users', uid, 'followers'))
  ]);
  
  return {
    followingCount: following.size,
    followerCount: followers.size
  };
};

// ========================================
// アクティビティ機能
// ========================================

/**
 * アクティビティを記録する
 */
export const logActivity = async (
  uid: string, 
  type: ActivityType, 
  detail: Activity['detail']
): Promise<void> => {
  const activitiesRef = collection(db, 'users', uid, 'activities');
  const activityId = `${type}_${Date.now()}`;
  
  await setDoc(doc(activitiesRef, activityId), {
    uid,
    type,
    detail,
    createdAt: Date.now()
  });
};

/**
 * 特定ユーザーのアクティビティを取得する
 */
export const getUserActivities = async (uid: string, maxCount: number = 20): Promise<Activity[]> => {
  const activitiesRef = collection(db, 'users', uid, 'activities');
  const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(maxCount));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Activity));
};

/**
 * タイムライン（フォロー中ユーザーのアクティビティ）を取得する
 */
export const getTimelineFeed = async (myUid: string, maxCount: number = 50): Promise<Activity[]> => {
  // まずフォロー中のユーザーを取得
  const following = await getFollowing(myUid);
  
  if (following.length === 0) {
    return [];
  }
  
  // 各ユーザーの最新アクティビティを取得
  const activitiesPromises = following.map(f => getUserActivities(f.uid, 10));
  const activitiesArrays = await Promise.all(activitiesPromises);
  
  // フラット化してソート
  const allActivities = activitiesArrays.flat();
  allActivities.sort((a, b) => b.createdAt - a.createdAt);
  
  // 上位N件を返す
  return allActivities.slice(0, maxCount);
};
