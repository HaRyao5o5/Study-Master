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
    // 1. Stripe サブスクリプションがあるかチェック (最優先)
    if (subscriptions.length > 0) return true;

    // 2. プロフィール手動設定（レガシー/管理者用）
    if (profile?.plan === 'pro') {
      if (profile.proUntil && profile.proUntil < Date.now()) {
        return false;
      }
      return true;
    }
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
    // 注: 本番環境では環境変数などで管理するのが一般的です
    const PRICE_ID = 'price_1SuefcGVK67zgnhDHVVZSoRn'; 
    
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
      proUntil: undefined
    });
  };

  return {
    isPro,
    planName,
    canUseAI,
    upgradeToPro,
    downgradeToFree
  };
}
