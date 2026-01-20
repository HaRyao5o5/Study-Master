export const generateId = () => Math.random().toString(36).substr(2, 9);

export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
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
          tableData: q.tableData || q.table_data || null // Handle snake_case from old data
        };
      })
    }))
  }));
};