// src/components/editor/ImageUploadSection.jsx
import React, { useRef, useState } from 'react';
import { ImageIcon, X, Upload, Loader, Link as LinkIcon } from 'lucide-react';

/**
 * 画像アップロードセクション
 * @param {Object} props
 * @param {string|null} props.image - 画像URL
 * @param {boolean} props.isUploading - アップロード中フラグ
 * @param {string|null} props.error - エラーメッセージ
 * @param {Function} props.onFileSelect - ファイル選択時のコールバック
 * @param {Function} props.onUrlInput - URL入力時のコールバック
 * @param {Function} props.onClear - クリア時のコールバック
 */
export function ImageUploadSection({ image, isUploading, error, onFileSelect, onUrlInput, onClear }) {
  const fileInputRef = useRef(null);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'
  const [urlValue, setUrlValue] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = ''; // リセット
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim() && onUrlInput) {
      onUrlInput(urlValue.trim());
      setUrlValue('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        添付画像（任意）
      </label>
      
      {image ? (
        <div className="relative inline-block">
          <img 
            src={image} 
            alt="Preview" 
            className="max-h-40 rounded-lg border border-gray-300 dark:border-gray-600 object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div>
          {/* タブ切り替え */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                inputMode === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Upload size={16} className="inline mr-1" />
              ファイル
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                inputMode === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <LinkIcon size={16} className="inline mr-1" />
              URL
            </button>
          </div>

          {inputMode === 'file' ? (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isUploading
                  ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-wait'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader size={32} className="mx-auto mb-2 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">アップロード中...</p>
                </>
              ) : (
                <>
                  <ImageIcon size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    クリックして画像を選択
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    最大500KB、800x600に自動リサイズ
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/image.png"
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlValue.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                追加
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <X size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
