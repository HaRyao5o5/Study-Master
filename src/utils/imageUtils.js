// src/utils/imageUtils.js
/**
 * 画像をリサイズしてBase64文字列を返す
 * @param {File} file - 画像ファイル
 * @param {number} maxWidth - 最大幅
 * @param {number} maxHeight - 最大高さ
 * @returns {Promise<string>} Base64形式の画像データ
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 元のアスペクト比を維持しながらリサイズ
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Canvasでリサイズ
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64に変換（品質90%のJPEG）
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(resizedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Base64画像のサイズを取得（KB単位）
 * @param {string} base64String - Base64形式の画像
 * @returns {number} サイズ（KB）
 */
export const getBase64Size = (base64String) => {
  const stringLength = base64String.length - 'data:image/jpeg;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return sizeInBytes / 1024; // KB
};
