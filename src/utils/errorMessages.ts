// src/utils/errorMessages.ts

/**
 * Firebase Authenticationのエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getAuthErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    const authErrors: Record<string, string> = {
        'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
        'auth/user-disabled': 'このアカウントは無効化されています。',
        'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません。',
        'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません。',
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
        'auth/weak-password': 'パスワードは6文字以上で設定してください。',
        'auth/operation-not-allowed': 'この操作は許可されていません。',
        'auth/invalid-api-key': 'Firebase APIキーが無効です。設定を確認してください。',
        'auth/network-request-failed': 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        'auth/too-many-requests': '短時間に多くのリクエストが送信されました。しばらく待ってから再度お試しください。',
        'auth/popup-blocked': 'ポップアップがブロックされました。ブラウザの設定を確認してください。',
        'auth/cancelled-popup-request': 'ログインがキャンセルされました。',
        'auth/popup-closed-by-user': 'ログインウィンドウが閉じられました。',
    };

    return authErrors[errorCode] || 'ログインに失敗しました。もう一度お試しください。';
};

/**
 * Firebase Firestoreのエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getFirestoreErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    const firestoreErrors: Record<string, string> = {
        'permission-denied': 'この操作を実行する権限がありません。',
        'not-found': 'データが見つかりませんでした。',
        'already-exists': 'このデータは既に存在しています。',
        'failed-precondition': '操作の前提条件が満たされていません。',
        'aborted': '処理が中断されました。もう一度お試しください。',
        'out-of-range': '指定された範囲が無効です。',
        'unimplemented': 'この機能はまだ実装されていません。',
        'internal': 'サーバー内部でエラーが発生しました。',
        'unavailable': 'サービスが一時的に利用できません。しばらく待ってから再度お試しください。',
        'data-loss': 'データの損失が検出されました。',
        'unauthenticated': 'ログインが必要です。',
        'invalid-argument': '入力データが正しくありません。',
        'deadline-exceeded': '処理がタイムアウトしました。',
        'resource-exhausted': 'リソースの制限に達しました。',
    };

    return firestoreErrors[errorCode] || 'データの処理中にエラーが発生しました。';
};

/**
 * Firebase Storageのエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getStorageErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    const storageErrors: Record<string, string> = {
        'storage/unknown': 'ファイルのアップロード中に不明なエラーが発生しました。',
        'storage/object-not-found': 'ファイルが見つかりませんでした。',
        'storage/bucket-not-found': 'ストレージが設定されていません。',
        'storage/project-not-found': 'プロジェクトが見つかりません。',
        'storage/quota-exceeded': 'ストレージの容量制限を超えています。',
        'storage/unauthenticated': 'ファイルをアップロードするにはログインが必要です。',
        'storage/unauthorized': 'ファイルをアップロードする権限がありません。',
        'storage/retry-limit-exceeded': 'アップロードが何度も失敗しました。時間をおいて再度お試しください。',
        'storage/invalid-checksum': 'ファイルが破損している可能性があります。',
        'storage/canceled': 'アップロードがキャンセルされました。',
        'storage/invalid-event-name': '無効な操作です。',
        'storage/invalid-url': 'ファイルのURLが無効です。',
        'storage/invalid-argument': 'アップロード設定が正しくありません。',
        'storage/no-default-bucket': 'ストレージバケットが設定されていません。',
        'storage/cannot-slice-blob': 'ファイルの読み込みに失敗しました。',
        'storage/server-file-wrong-size': 'ファイルサイズが一致しません。',
    };

    return storageErrors[errorCode] || 'ファイルの処理中にエラーが発生しました。';
};

/**
 * Gemini AIのエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getAIErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';

    if (errorMessage.includes('API key')) {
        return 'APIキーが無効です。設定を確認してください。';
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return 'API使用制限に達しました。しばらく待ってから再度お試しください。';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }
    if (errorMessage.includes('timeout')) {
        return 'AIの応答がタイムアウトしました。もう一度お試しください。';
    }

    return 'AIクイズの生成に失敗しました。入力内容を確認して再度お試しください。';
};

/**
 * 一般的なエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getErrorMessage = (error: any): string => {
    if (!error) return '不明なエラーが発生しました。';

    // Firebaseエラーの判定
    if (error.code) {
        if (error.code.startsWith('auth/')) {
            return getAuthErrorMessage(error);
        }
        if (error.code.startsWith('storage/')) {
            return getStorageErrorMessage(error);
        }
        // Firestoreエラー（codeのみ）
        return getFirestoreErrorMessage(error);
    }

    // AIエラーの判定
    if (error.message && (
        error.message.includes('Gemini') ||
        error.message.includes('API') ||
        error.message.includes('generation')
    )) {
        return getAIErrorMessage(error);
    }

    // デフォルトメッセージ
    return error.message || '予期しないエラーが発生しました。もう一度お試しください。';
};

/**
 * エラーをコンソールに記録し、ユーザーフレンドリーなメッセージを返す
 */
export const handleError = (error: any, context = ''): string => {
    // 開発環境では詳細なエラーをコンソールに出力
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]`, error);
    }

    // 本番環境ではエラーメッセージのみ記録
    console.error(`Error in ${context}:`, error.message || error);

    // ユーザーフレンドリーなメッセージを返す
    return getErrorMessage(error);
};

// ========================================
// 成功・確認・警告メッセージ（Phase 1で追加）
// ========================================

/**
 * 成功メッセージ
 */
export const SUCCESS = {
  FOLDER_CREATED: (name: string) => `科目フォルダ「${name}」を追加しました！`,
  QUIZ_CREATED: (title: string) => `AIがクイズ「${title}」を作成しました！`,
  PROFILE_UPDATED: 'プロフィール名を変更しました！',
  LOGOUT_SUCCESS: 'ログアウトしました。',
  IMPORT_SUCCESS: 'インポートが完了しました！',
  DEBUG_DATE_UPDATED: '最終ログイン日を昨日に変更しました！',
  COURSE_SAVED: 'コースを保存しました',
  QUIZ_SAVED: 'クイズを保存しました',
  STATS_RESET: 'ステータスをリセットしました。',
};

/**
 * エラーメッセージ（alert用）
 */
export const ERROR = {
  PROFILE_UPDATE_FAILED: '変更に失敗しました。',
  FILE_LOAD_FAILED: (message: string) => `ファイルの読み込みに失敗しました。\n${message}`,
  FILE_TYPE_MISMATCH: (actual: string, expected: string) => 
    `エラー: このファイルは「${actual}」用です。\nここでは「${expected}」のみ読み込めます。`,
  IMAGE_TOO_LARGE: '画像サイズが大きすぎます。読み込みが遅くなる可能性があります。',
  MIN_OPTIONS_REQUIRED: '選択肢は最低2つ必要です',
  SAVE_FAILED: 'データの保存に失敗しました',
  SAVE_RETRY_FAILED: '保存に失敗しました。インターネット接続を確認してください。',
  OFFLINE_MODE: 'オフラインです。オンライン復帰時に自動保存されます。',
  SAVE_RETRYING: (attempt: number) => `保存を再試行中... (${attempt}回目)`,
};

/**
 * 確認メッセージ（confirm用）
 */
export const CONFIRM = {
  DELETE_FOLDER: 'このフォルダを削除しますか？中の問題もすべて消えます。',
  DELETE_QUESTION: 'この問題を削除しますか？',
  LOGOUT: 'ログアウトしますか？',
  DEBUG_YESTERDAY: '【デバッグ用】最終ログイン日を「昨日」に設定しますか？\n(streakも1に戻ります)',
  IMPORT_COURSE: (title: string) => `「${title}」をあなたのライブラリに追加しますか？`,
  LOAD_OLD_BACKUP: '古い形式のバックアップファイルです。読み込みますか?',
  LOAD_OLD_COURSE: '古い形式のコースファイルです。読み込みますか？',
  LOAD_OLD_QUIZ: '古い形式のクイズファイルです。読み込みますか？',
  RESET_STATS: 'ステータスをリセットしますか？',
  CLEAR_HISTORY: '復習リストをリセットしますか？',
};
