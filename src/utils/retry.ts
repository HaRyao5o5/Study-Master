// src/utils/retry.ts

/**
 * 再試行ユーティリティ
 * 失敗した非同期操作を自動的に再試行する
 */

export interface RetryOptions {
  /** 最大再試行回数（デフォルト: 3） */
  maxRetries: number;
  /** 再試行間隔（ミリ秒、デフォルト: 1000） */
  delayMs: number;
  /** 指数バックオフを使用（デフォルト: true） */
  backoff: boolean;
  /** 再試行時のコールバック */
  onRetry?: (attempt: number, error: Error) => void;
  /** 再試行すべきかを判定する関数（デフォルト: 常にtrue） */
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  delayMs: 1000,
  backoff: true,
  shouldRetry: () => true,
};

/**
 * 指定された関数を再試行付きで実行
 * 
 * @param fn 実行する非同期関数
 * @param options 再試行オプション
 * @returns 関数の戻り値
 * @throws 最大再試行回数を超えた場合のエラー
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => saveToCloud(uid, data),
 *   { maxRetries: 3, onRetry: (n) => console.log(`再試行 ${n}回目`) }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 最後の試行なら再試行しない
      if (attempt >= opts.maxRetries) {
        break;
      }

      // 再試行すべきかチェック
      if (opts.shouldRetry && !opts.shouldRetry(lastError)) {
        break;
      }

      // コールバック呼び出し
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError);
      }

      // 遅延（指数バックオフ）
      const delay = opts.backoff 
        ? opts.delayMs * Math.pow(2, attempt) 
        : opts.delayMs;
      
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 指定ミリ秒待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ネットワークエラーかどうかを判定
 * （再試行すべきエラーの判定に使用）
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'network',
    'timeout',
    'unavailable',
    'connection',
    'offline',
    'fetch',
  ];

  const message = error.message.toLowerCase();
  return networkErrorMessages.some(keyword => message.includes(keyword));
}

/**
 * Firestoreの一時的なエラーかどうかを判定
 */
export function isRetryableFirestoreError(error: any): boolean {
  const retryableCodes = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
  ];

  if (error?.code && retryableCodes.includes(error.code)) {
    return true;
  }

  return isNetworkError(error);
}
