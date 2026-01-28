// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import { collection, addDoc, onSnapshot, doc } from 'firebase/firestore';
import { db } from './firebase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Stripe Checkout セッションを作成し、決済ページへリダイレクトする
 */
export async function createCheckoutSession(uid: string, priceId: string) {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe の初期化に失敗しました。');

  // 1. users/{uid}/checkout_sessions にドキュメントを追加
  const sessionsCollectionRef = collection(db, 'users', uid, 'checkout_sessions');
  const sessionDocRef = await addDoc(sessionsCollectionRef, {
    price: priceId, // Stripe ダッシュボードで作成した商品の価格ID
    success_url: window.location.origin + '/checkout-success',
    cancel_url: window.location.origin + '/pricing',
    mode: 'subscription', // サブスクリプションの場合
    allow_promotion_codes: true,
  });

  // 2. 拡張機能が生成した URL が書き込まれるのを待機
  return new Promise<void>((resolve, reject) => {
    const unsubscribe = onSnapshot(doc(db, 'users', uid, 'checkout_sessions', sessionDocRef.id), (snap) => {
      const data = snap.data();
      if (data) {
        const { error, url } = data;
        
        if (error) {
          unsubscribe();
          reject(new Error(`Stripe セッション作成エラー: ${error.message}`));
        }
        
        if (url) {
          // 3. 決済ページへリダイレクト
          unsubscribe();
          window.location.assign(url);
          resolve();
        }
      }
    });

    // タイムアウト (30秒)
    setTimeout(() => {
        unsubscribe();
        reject(new Error('決済ページの生成がタイムアウトしました。拡張機能が正しくインストールされているか確認してください。'));
    }, 30000);
  });
}
