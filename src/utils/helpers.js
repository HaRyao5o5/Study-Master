// src/utils/helpers.js

export const generateId = () => Math.random().toString(36).substr(2, 9);

// 画像をリサイズ・圧縮してBase64に変換する関数
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // リサイズ設定 (最大幅/高さを800pxに制限)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG形式で圧縮 (品質 0.6 = 60%)
        // これで数MBの画像が数十KB〜100KB程度になる
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };

      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

export const normalizeData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];
  
  return rawData.map(course => ({
    ...course,
    quizzes: (course.quizzes || []).map(quiz => ({
      ...quiz,
      questions: (quiz.questions || []).map(q => {
        let type = q.type || 'multiple';
        let options = [];
        let correctAnswer = [];

        if (Array.isArray(q.options)) {
          options = q.options;
        } else if (typeof q.options === 'object' && q.options !== null) {
           const keys = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'];
           options = keys.filter(k => q.options[k]).map(k => q.options[k]);
        }

        if (Array.isArray(q.correctAnswer)) {
          correctAnswer = q.correctAnswer;
        } else {
          if (typeof q.options === 'object' && !Array.isArray(q.options) && q.options !== null) {
             correctAnswer = [q.options[q.correctAnswer] || q.correctAnswer];
          } else {
             correctAnswer = [q.correctAnswer];
          }
        }

        return {
          ...q,
          type,
          correctAnswer: correctAnswer,
          options: options,
          image: q.image || null,
          tableData: q.tableData || q.table_data || null,
          explanation: q.explanation || ''
        };
      })
    }))
  }));
};