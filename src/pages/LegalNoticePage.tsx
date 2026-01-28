// src/pages/LegalNoticePage.tsx
import React from 'react';
import { ShieldAlert, CreditCard, Clock, Package, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalNoticePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <button 
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-bold"
      >
        <Undo2 size={20} /> 戻る
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-10 flex items-center gap-3">
          <ShieldAlert className="text-blue-600" />
          特定商取引法に基づく表記
        </h1>

        <div className="space-y-12">
          {/* 基本情報 */}
          <section>
            <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 border-l-4 border-blue-600 pl-4">
              事業者の名称
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                矢田晴哉
              </p>
            </div>
          </section>

          {/* 連絡先 */}
          <section>
            <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 border-l-4 border-blue-600 pl-4">
              所在地・連絡先
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                <span className="text-xs text-gray-400 block mb-1">住所</span>
                <p className="text-gray-700 dark:text-gray-300 font-bold">
                  〒343-0041 埼玉県越谷市千間台西2-4-12エフローレせんげん台スタシオン906
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                <span className="text-xs text-gray-400 block mb-1">電話番号</span>
                <p className="text-gray-700 dark:text-gray-300 font-bold">
                  080-3211-0949
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl md:col-span-2">
                <span className="text-xs text-gray-400 block mb-1">メールアドレス</span>
                <p className="text-gray-700 dark:text-gray-300 font-bold">
                  haruya906@gmail.com
                </p>
              </div>
            </div>
          </section>

          {/* 販売条件 */}
          <section className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                販売価格
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                表示された金額（税込）に基づきます。
                別途通信料等が発生する場合があります。
              </p>
            </div>
            <div>
              <h3 className="font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                代金の支払時期
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                クレジット決済確認後、直ちに処理されます。<br/>
                継続課金は各月の更新日に行われます。
              </p>
            </div>
          </section>

          {/* 提供時期と返品 */}
          <section className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                商品の引渡時期
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                お支払い完了後、直ちにアカウントが有効化され、各種機能がご利用いただけます。
              </p>
            </div>
            <div>
              <h3 className="font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2" >
                <Undo2 size={18} className="text-blue-600" />
                返品・キャンセル
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                サービスの性質上、決済完了後の返金は受け付けておりません。<br/>
                次月以降の継続課金は、いつでも設定画面より停止可能です。
              </p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400">
            Study Master - 学習を次の次元へ
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalNoticePage;
