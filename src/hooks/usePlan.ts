import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useApp } from '../context/AppContext';
import { db } from '../lib/firebase';
import { createCheckoutSession } from '../lib/stripe';

/**
 * ユーザーのプラン状態を管理・判定するカスタムフック
 */
export function usePlan() {
  const { profile, updateProfile, user } = useApp();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // 管理者かどうかを判定 (環境変数の UID リストに含まれるか)
  const isAdmin = useMemo(() => {
    if (!user?.uid) return false;
    const adminUids = ((import.meta.env.VITE_ADMIN_UIDS as string) || '').split(',').map((u: string) => u.trim());
    return adminUids.includes(user.uid);
  }, [user]);

  // Stripe Extension が生成する 'subscriptions' コレクションを監視
  useEffect(() => {
    if (!user?.uid) {
        setSubscriptions([]);
        return;
    }

    const subsRef = collection(db, 'users', user.uid, 'subscriptions');
    // アクティブまたはトライアル中のサブスクリプションを検索
    const q = query(
        subsRef, 
        where('status', 'in', ['active', 'trialing'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setSubscriptions(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [user]);

  const isPro = useMemo(() => {
    // 1. 手動設定（デバッグ/管理者用）を最優先
    // プロフィールが 'pro' かつ期限内であれば PRO と判定
    if (profile?.plan === 'pro') {
      if (!profile.proUntil || profile.proUntil > Date.now()) {
        return true;
      }
    }

    // 2. 手動で 'free' に設定されている場合、Stripe のチェックをスキップする（デバッグ用）
    // これにより Stripe 側にサブスクが残っていても FREE 状態をテスト可能
    if (profile?.plan === 'free') {
        return false;
    }

    // 3. Stripe サブスクリプションがあるかチェック
    if (subscriptions.length > 0) return true;

    return false;
  }, [profile, subscriptions]);

  const planName = isPro ? 'PRO' : 'FREE';

  /**
   * AI機能が利用可能かどうか
   */
  const canUseAI = isPro;

  /**
   * Stripe Checkout セッションを作成してリダイレクト
   */
  const upgradeToPro = async () => {
    if (!user) return;
    
    // Stripe ダッシュボードで作成した商品の価格ID
    const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID; 
    
    if (!PRICE_ID) {
        throw new Error('Stripe の価格IDが設定されていません。環境変数をご確認ください。');
    }
    
    try {
        await createCheckoutSession(user.uid, PRICE_ID);
    } catch (err) {
        console.error(err);
        throw err;
    }
  };

  /**
   * プランをダウングレードする（デバッグ用・期限切れ用）
   */
  const downgradeToFree = async () => {
    if (!user) return;
    
    const currentProfile = profile || {
        uid: user.uid,
        name: user.displayName || 'ユーザー',
        plan: 'free'
    } as any;

    await updateProfile({
      ...currentProfile,
      plan: 'free',
      proUntil: undefined // 期限を消去
    });
  };

  /**
   * 決済なしで強制的に PRO にする（デバッグ用）
   */
  const forceUpgradeToPro = async () => {
    if (!user) return;
    
    const currentProfile = profile || {
        uid: user.uid,
        name: user.displayName || 'ユーザー',
        plan: 'free'
    } as any;

    await updateProfile({
      ...currentProfile,
      plan: 'pro',
      proUntil: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1年分有効にする
    });
  };

  return {
    isPro,
    planName,
    canUseAI,
    isAdmin, // 管理者フラグを返す
    upgradeToPro,
    downgradeToFree,
    forceUpgradeToPro
  };
}
