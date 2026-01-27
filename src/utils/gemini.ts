// src/utils/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 安全のため、APIキーは環境変数から読み込むか、ユーザーに入力させる
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export const generateQuizWithAI = async (text: string, questionCount = 5, customApiKey: string | null = null): Promise<any> => {
  const key = customApiKey || API_KEY;
  if (!key) {
    throw new Error("APIキーが設定されていません。");
  }

  const genAI = new GoogleGenerativeAI(key);
  
  // ★ ここを修正！ 最新の 2.5-flash に変更
  // もしもっと賢いモデルを使いたい場合は "gemini-2.5-pro" にしてもOKです
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    あなたは学習アプリのクイズ作成アシスタントです。
    以下のテキストの内容に基づいて、${questionCount}問の4択クイズを作成してください。
    
    【テキスト】
    ${text}

    【出力フォーマット】
    必ず以下のJSON形式のみを出力してください。Markdownのコードブロックや余計な説明は不要です。
    
    {
      "title": "生成されたクイズのタイトル",
      "description": "クイズの簡単な説明",
      "questions": [
        {
          "id": "q1",
          "text": "問題文",
          "type": "multiple",
          "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
          "correctAnswer": "正解の選択肢（文字列）"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON部分だけを抽出する（Markdown記法 ```json ... ``` を除去）
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("クイズの生成に失敗しました。APIキーが正しいか、モデルが利用可能か確認してください。");
  }
};
