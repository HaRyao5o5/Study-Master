// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { resizeImage, getBase64Size } from '../utils/imageUtils';

export function useImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ファイル選択時のハンドラー
   */
  const handleFileSelect = useCallback(async (file: File | undefined): Promise<string | null> => {
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
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError(err.message || '画像のアップロードに失敗しました');
      setIsUploading(false);
      return null;
    }
  }, []);

  /**
   * URL入力時のハンドラー
   */
  const handleUrlInput = useCallback((url: string) => {
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
