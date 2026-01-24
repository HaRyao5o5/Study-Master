// src/utils/fileIO.js
import { generateId } from './helpers';

// ■ エクスポート（保存）機能
export const exportToFile = (data, type, fileNamePrefix) => {
  const exportObject = {
    meta: {
      type: type, // 'backup' | 'course' | 'quiz'
      version: '2.7.0',
      createdAt: new Date().toISOString()
    },
    data: data
  };

  const dataStr = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${fileNamePrefix}-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

// ■ インポート（読込）機能
export const importFromFile = (file, expectedType, callback) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);

      // 1. ファイル形式チェック
      if (!json.meta || !json.data) {
        // 旧バックアップ形式の救済措置
        if (expectedType === 'backup' && Array.isArray(json)) {
          if (confirm("古い形式のバックアップファイルです。読み込みますか?")) {
            return callback(json);
            return;
          }
        }

        // ★ 新規追加: courseやquizの旧形式も救済
        if (expectedType === 'course' || expectedType === 'quiz') {
          // metaとdataがない場合、jsonそのものがデータと仮定
          if (expectedType === 'course' && json.title && json.quizzes !== undefined) {
            // courseっぽいデータ構造
            if (confirm("古い形式のコースファイルです。読み込みますか？")) {
              // ID振り直し処理
              const processedData = {
                ...json,
                id: `course-${generateId()}`,
                quizzes: (json.quizzes || []).map(q => ({
                  ...q,
                  id: `quiz-${generateId()}`
                }))
              };
              callback(processedData);
              return;
            } else {
              return;
            }
          } else if (expectedType === 'quiz' && json.title && json.questions !== undefined) {
            // quizっぽいデータ構造
            if (confirm("古い形式のクイズファイルです。読み込みますか？")) {
              const processedData = {
                ...json,
                id: `quiz-${generateId()}`
              };
              callback(processedData);
              return;
            } else {
              return;
            }
          }
        }

        throw new Error("このファイルはStudy Masterの有効なデータファイルではありません。");
      }

      // 2. タイプ一致チェック
      if (json.meta.type !== expectedType) {
        alert(`エラー: このファイルは「${json.meta.type}」用です。\nここでは「${expectedType}」のみ読み込めます。`);
        return;
      }

      // 3. ID振り直し（重複防止）
      let processedData = json.data;
      if (expectedType === 'course') {
        processedData = {
          ...processedData,
          id: `course-${generateId()}`,
          quizzes: (processedData.quizzes || []).map(q => ({
            ...q,
            id: `quiz-${generateId()}`
          }))
        };
      } else if (expectedType === 'quiz') {
        processedData = {
          ...processedData,
          id: `quiz-${generateId()}`
        };
      }

      // 成功したらデータを渡す
      callback(processedData);

    } catch (err) {
      console.error(err);
      alert("ファイルの読み込みに失敗しました。\n" + err.message);
    }
  };
  reader.readAsText(file);
};