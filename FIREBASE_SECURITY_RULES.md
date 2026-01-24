# Firebaseセキュリティルール設定ガイド

Study Masterアプリケーションが正常に動作するために必要なFirestoreセキュリティルールです。

## 📋 設定手順

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「study-master-72997」を選択
3. 左メニューから「Firestore Database」をクリック
4. 「ルール」タブをクリック
5. 以下のルールをコピーして貼り付け
6. 「公開」ボタンをクリック

---

## 🔒 完全なセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // ユーザーコレクション（ランキング用）
    // ========================================
    match /users/{userId} {
      // 読み取り: 誰でも可能（ランキング機能のため）
      allow read: if true;
      
      // 書き込み: 本人のみ可能
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ========================================
    // 共有コースコレクション
    // ========================================
    match /courses/{courseId} {
      // 読み取り: 誰でも可能（共有リンクでアクセス可能にするため）
      allow read: if true;
      
      // 作成: ログインユーザーのみ
      allow create: if request.auth != null
                    && request.resource.data.createdBy == request.auth.uid;
      
      // 更新: 作成者本人のみ
      allow update: if request.auth != null 
                    && request.auth.uid == resource.data.createdBy;
      
      // 削除: 作成者本人のみ
      allow delete: if request.auth != null 
                    && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## 📝 ルールの説明

### usersコレクション
- **目的**: ユーザー情報とランキングデータの保存
- **読み取り**: 公開（ランキング表示のため必要）
- **書き込み**: 本人のみ（セキュリティ保護）
- **データ構造**:
  ```javascript
  {
    uid: "ユーザーID",
    email: "メールアドレス",
    displayName: "表示名",
    photoURL: "プロフィール画像URL",
    userStats: {
      totalXp: 1000,
      level: 5,
      streak: 7,
      lastLogin: "2026-01-24"
    }
  }
  ```

### coursesコレクション
- **目的**: コースの共有機能
- **読み取り**: 公開（リンクを持っている人がアクセス可能）
- **作成**: 認証済みユーザーのみ
- **更新/削除**: 作成者のみ
- **セキュリティ**: `createdBy`フィールドで所有者を特定
- **データ構造**:
  ```javascript
  {
    title: "コース名",
    description: "説明",
    visibility: "public" | "unlisted" | "private",
    createdBy: "作成者のUID",
    createdAt: "作成日時",
    quizzes: [ /* クイズデータ */ ]
  }
  ```

---

## ⚠️ セキュリティ注意事項

### 1. テストモードは使用禁止
以下のような「すべて許可」ルールは**本番環境では絶対に使用しないでください**：

```javascript
// ❌ 危険！本番環境で使用禁止
allow read, write: if true;
```

### 2. createdByフィールドの重要性
共有コースを作成する際は、必ず`createdBy`フィールドを設定してください：

```javascript
await setDoc(doc(db, "courses", courseId), {
  ...courseData,
  createdBy: auth.currentUser.uid  // 必須！
});
```

### 3. プライベートコースの扱い
`visibility: "private"`のコースは、Firestoreには保存せず、ローカルストレージに保存することを推奨します。

---

## 🧪 ルールのテスト

Firebase Consoleの「ルール」タブには「ルールのシミュレータ」があります。
以下のシナリオでテストしてください：

### テスト1: ユーザー情報の読み取り
```
コレクション: users
ドキュメント: any-user-id
操作: get
認証: なし
期待結果: ✅ 許可
```

### テスト2: 他人のユーザー情報の書き込み
```
コレクション: users
ドキュメント: other-user-id
操作: update
認証: あり（別のユーザー）
期待結果: ❌ 拒否
```

### テスト3: コースの読み取り
```
コレクション: courses  
ドキュメント: any-course-id
操作: get
認証: なし
期待結果: ✅ 許可
```

### テスト4: コースの作成
```
コレクション: courses
ドキュメント: new-course-id
操作: create
認証: あり
データ: { createdBy: <認証ユーザーのUID> }
期待結果: ✅ 許可
```

### テスト5: 他人のコースの削除
```
コレクション: courses
ドキュメント: other-course-id
操作: delete
認証: あり（作成者ではない）
期待結果: ❌ 拒否
```

---

## 🔧 トラブルシューティング

### エラー: "Missing or insufficient permissions"
- **原因**: セキュリティルールが設定されていないか、条件を満たしていない
- **対策**: このガイドのルールを正確に設定

### エラー: "PERMISSION_DENIED"
- **原因**: ログインしていない状態で書き込もうとしている
- **対策**: `auth.currentUser`を確認してからFirestore操作を実行

### 共有コースが保存できない
- **原因**: `createdBy`フィールドがない
- **対策**: `cloudSync.js`のshareCourse関数を確認

---

## 📅 定期メンテナンス

- **月1回**: ルールの動作を確認
- **四半期ごと**: セキュリティ監査
- **機能追加時**: ルールの更新が必要か確認

---

**作成日**: 2026-01-24  
**最終更新**: 2026-01-24  
**次回確認日**: 2026-02-24
