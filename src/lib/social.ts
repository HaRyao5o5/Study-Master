// src/lib/social.ts
// ソーシャル機能（フォロー、タイムライン）の API

import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  collectionGroup,
  getDocs, 
  query, 
  where,
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
 * Firestore の `in` クエリ（最大30件）でバッチ取得し、N+1 問題を解消
 */
export const getTimelineFeed = async (myUid: string, maxCount: number = 50): Promise<Activity[]> => {
  // まずフォロー中のユーザーを取得
  const following = await getFollowing(myUid);
  
  if (following.length === 0) {
    return [];
  }
  
  const followingUids = following.map(f => f.uid);
  
  // Firestore の `in` クエリは最大30件なのでチャンクに分割
  const chunks: string[][] = [];
  for (let i = 0; i < followingUids.length; i += 30) {
    chunks.push(followingUids.slice(i, i + 30));
  }
  
  // 各チャンクでバッチクエリを実行
  const allActivities: Activity[] = [];
  try {
    await Promise.all(
      chunks.map(async (chunk) => {
        const activitiesRef = collectionGroup(db, 'activities');
        const q = query(
          activitiesRef,
          where('uid', 'in', chunk),
          orderBy('createdAt', 'desc'),
          limit(maxCount)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => {
          const data = d.data();
          allActivities.push({ id: d.id, uid: data.uid, type: data.type, detail: data.detail, createdAt: data.createdAt } as Activity);
        });
      })
    );
  } catch (error: any) {
    // Firestoreインデックス未作成の場合のフォールバック
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn(
        'Firestore collectionGroup インデックスが必要です。' +
        'エラーメッセージ内のURLからインデックスを作成してください:',
        error.message
      );
      // フォールバック: 個別ユーザーのactivitiesコレクションから取得
      await Promise.all(
        followingUids.map(async (uid) => {
          try {
            const userActivities = await getUserActivities(uid, Math.ceil(maxCount / followingUids.length));
            allActivities.push(...userActivities);
          } catch {
            // 個別ユーザーの取得失敗は無視
          }
        })
      );
    } else {
      throw error;
    }
  }
  
  // ソートして上位N件を返す
  allActivities.sort((a, b) => b.createdAt - a.createdAt);
  return allActivities.slice(0, maxCount);
};
