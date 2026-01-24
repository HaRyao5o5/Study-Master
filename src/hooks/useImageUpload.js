import { useState, useCallback } from 'react';
import { resizeImage, getBase64Size } from '../utils/imageUtils';

/**
 * 画像アップロード機能を提供するカスタムフック
 * @returns {Object} 画像の状態とハンドラー関数
 */
export function useImageUpload() {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * ファイル選択時のハンドラー
   */
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return null;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 画像をリサイズ（800x600）
      const resized = await resizeImage(file, 800, 600);
      const size = getBase64Size(resized);
      
      // サイズチェック（500KB以下）
      if (size > 500 * 1024) {
        setError('画像サイズが500KBを超えています');
        setIsUploading(false);
        return null;
      }
      
      setImage(resized);
      setIsUploading(false);
      return resized;
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || '画像のアップロードに失敗しました');
      setIsUploading(false);
      return null;
    }
  }, []);

  /**
   * URL入力時のハンドラー
   */
  const handleUrlInput = useCallback((url) => {
    if (url && url.trim()) {
      setImage(url);
      setError(null);
    }
  }, []);

  /**
   * 画像をクリア
   */
  const clearImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  return {
    image,
    isUploading,
    error,
    handleFileSelect,
    handleUrlInput,
    clearImage,
    setImage
  };
}
