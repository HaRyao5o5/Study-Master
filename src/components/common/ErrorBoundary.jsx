// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 次のレンダリングでフォールバックUIを表示するように状態を更新
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // ここでエラーログ記録サービスに送信することも可能
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // 必要ならここで window.location.reload() してもいい
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              予期せぬエラーが発生しました
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              申し訳ありません。何らかの問題でアプリが停止しました。<br/>
              再読み込みを試してください。
            </p>
            
            {/* デバッグ用に詳細を表示（本番では隠してもいい） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 text-left bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs font-mono text-red-500 overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
            >
              <RotateCcw className="mr-2" size={20} />
              アプリを再起動
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;