// src/utils/gemini.ts
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// 安全のため、APIキーは環境変数から読み込むか、ユーザーに入力させる
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export const generateQuizWithAI = async (text: string, count = 5, images: string[] = [], customApiKey: string | null = null): Promise<any> => {
  const key = customApiKey || API_KEY;
  if (!key) {
    throw new Error("APIキーが設定されていません。");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    あなたは最強のクイズ作成アシスタントです。
    ユーザーから提供された資料${images.length > 0 ? '（テキストと画像）' : '（テキスト）'}に基づいて、${count}問の学習用クイズを作成してください。
    
    【クイズ作成のガイドライン】
    1. **具体的かつ明快**: 問題文は簡潔で、迷いがないようにしてください。
    2. **効果的な解説**: なぜその答えが正しいのかだけでなく、覚え方のコツや周辺知識を1〜2文で添えてください。
    3. **実用性**: 学習者が実際にテストや日常で役立てられるような問いを優先してください。
    
    【対象テキスト/トピック】
    ${text}

    【出力フォーマット】
    JSONのみを返してください。Markdownの装飾は一切不要です。
    
    {
      "title": "資料に基づいた最適なタイトル",
      "description": "学習のポイントをまとめた簡潔な説明",
      "questions": [
        {
          "text": "問題文",
          "type": "select",
          "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
          "correctAnswer": "正解の文字列（必ずoptions内の1つと一致させること）",
          "explanation": "プロフェッショナルな解説文"
        }
      ]
    }
  `;

  try {
    const inputParts: Array<string | Part> = [prompt];
    
    if (images.length > 0) {
        images.forEach(dataUrl => {
            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                inputParts.push({
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                    }
                });
            }
        });
    }

    const result = await model.generateContent(inputParts);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("クイズの生成に失敗しました。制限（画像サイズやトークン数）に抵触したか、APIキーが正しくありません。");
  }
};

/**
 * トピックからコース全体（タイトル、説明、アイコン案、初期クイズ）を生成する
 */
export const generateFullCourseWithAI = async (topic: string, customApiKey: string | null = null): Promise<any> => {
    const key = customApiKey || API_KEY;
    if (!key) throw new Error("APIキーが必要です。");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    あなたは学習設計のエキスパートです。
    ユーザーが指定したトピック「${topic}」について、包括的な学習コースを設計してください。

    【生成内容】
    1. コース全体のタイトルと説明。
    2. コースにふさわしい色（Hex）と絵文字アイコン。
    3. 最初に取り組むべき導入クイズ（5〜8問程度）。

    【出力フォーマット】
    JSONのみ。
    {
      "title": "コース名",
      "description": "学習の目標",
      "color": "#HEXCODE",
      "icon": "Emoji",
      "initialQuiz": {
        "title": "導入テスト/第1章",
        "description": "基礎知識の確認",
        "questions": [
          {
            "text": "問題文",
            "type": "select",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "正解",
            "explanation": "解説"
          }
        ]
      }
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini Course Gen Error:", error);
        throw new Error("コースの自動設計に失敗しました。");
    }
};

/**
 * 継続的な対話を行うチャット機能
 * @param message ユーザーの最新のメッセージ
 * @param history 過去の履歴 [{ role: 'user' | 'model', parts: [{ text: string }] }]
 * @param context 学習環境の情報（現在のコース、問題など）
 */
export const chatWithAI = async (
  message: string, 
  history: any[] = [], 
  context: { courseTitle?: string; description?: string; currentQuestion?: string } = {},
  customApiKey: string | null = null
): Promise<string> => {
  const key = customApiKey || API_KEY;
  if (!key) throw new Error("APIキーが必要です。");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: `
      あなたは「Study Master」の専属AI学習アドバイザーです。
      学習者がクイズや科目について質問した際、親切かつ情熱的にサポートしてください。

      【あなたの性格】
      - 励まし上手で、学習者のモチベーションを高める。
      - 解説は論理的で分かりやすく、例え話なども交える。
      - 分からないことを恥ずかしいと思わせない温かいトーン。

      【現在の学習状況】
      ${context.courseTitle ? `- 学習中のコース: ${context.courseTitle}` : ""}
      ${context.description ? `- コースの説明: ${context.description}` : ""}
      ${context.currentQuestion ? `- 今見ている問題: ${context.currentQuestion}` : ""}

      【ルール】
      - 答えを教えるだけでなく、考え方のプロセスを提示してください。
      - 学習に関係のない質問には、優しく断った上で学習を促してください。
    `
  });

  const chat = model.startChat({
    history: history,
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("AIとの通信に失敗しました。時間をおいて再度お試しください。");
  }
};

/**
 * 特定の問題の誤答や疑問を深掘り解析する
 */
export const analyzeMistakeWithAI = async (
  question: string,
  correctAnswer: string,
  userAnswer?: string,
  context: string = "",
  customApiKey: string | null = null
): Promise<string> => {
  const key = customApiKey || API_KEY;
  if (!key) throw new Error("APIキーが必要です。");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    あなたは超一流の教育コンサルタント兼メンターです。
    学習者がクイズで間違えた（または詳しく知りたい）問題について、徹底的な解剖とアドバイスを行ってください。

    【問題の内容】
    問題: ${question}
    正解: ${correctAnswer}
    ${userAnswer ? `学習者の回答: ${userAnswer}` : "（学習者は正解を確認した上での詳細解説を求めています）"}
    ${context ? `補足コンテキスト: ${context}` : ""}

    【回答の構成】
    以下の4つのセクションで、親しみやすく、かつ知的なトーンで回答してください：

    1. **本質の解説**: 
       その問題が「結局何を問うているのか」を、一歩引いた視点で分かりやすく解説してください。
    2. **なぜ間違えやすいのか（またはなぜ正しいのか）**:
       ${userAnswer ? "学習者の誤答を踏まえ、なぜその選択肢を選んでしまいがちなのか、陥りやすい罠を分析してください。" : "多くの学習者がつまずきやすいポイントを指摘してください。"}
    3. **黄金の記憶術**:
       その概念を一生忘れないための、語呂合わせ、例え話、またはビジュアライゼーションの方法を1つ提案してください。
    4. **ステップアップの一歩**:
       関連する周辺知識や、次に覚えておくべきポイントを簡潔に紹介してください。

    【出力ルール】
    - Markdown 形式で出力してください（太字、リスト、引用など）。
    - 専門用語は噛み砕いて説明してください。
    - 1文字たりとも「JSON」や「プログラムコード」のような出力はしないでください。
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Mistake Analysis Error:", error);
    throw new Error("AIによる解析に失敗しました。時間をおいて再度お試しください。");
  }
};
