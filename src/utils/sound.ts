// src/utils/sound.ts

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0, vol = 0.1) => {
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime + delay);
    oscillator.stop(audioCtx.currentTime + delay + duration);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export type SoundType = 'correct' | 'wrong' | 'select' | 'levelUp' | 'clear';

export const playSound = (type: SoundType): void => {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    switch (type) {
      case 'correct':
        // 正解: ピンポン！
        playTone(880, 'sine', 0.1, 0, 0.1);
        playTone(1760, 'sine', 0.3, 0.1, 0.1);
        break;
      case 'wrong':
        // 不正解: ブブー
        playTone(150, 'sawtooth', 0.3, 0, 0.1);
        playTone(130, 'sawtooth', 0.3, 0.1, 0.1);
        break;
      case 'select':
        // ★ 追加: 選択音（カッ）- 結果がわからない短い音
        playTone(440, 'sine', 0.05, 0, 0.05);
        break;
      case 'levelUp':
        // レベルアップ: ファンファーレ
        playTone(523.25, 'triangle', 0.1, 0, 0.1);
        playTone(659.25, 'triangle', 0.1, 0.1, 0.1);
        playTone(783.99, 'triangle', 0.1, 0.2, 0.1);
        playTone(1046.50, 'square', 0.4, 0.3, 0.1);
        break;
      case 'clear':
        // クリア音
        playTone(523.25, 'sine', 0.5, 0, 0.05);
        playTone(783.99, 'sine', 0.5, 0.1, 0.05);
        break;
      default:
        break;
    }
  } catch (e) {
    console.warn("Sound effect error:", e);
  }
};

// --- 言語判定ロジック ---
const detectLanguage = (text: string): string => {
  if (!text) return 'en-US';
  const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
  if (hasKorean) return 'ko-KR';
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  if (hasJapanese) return 'ja-JP';
  return 'en-US';
};

export const speakText = (text: string): void => {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLanguage(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("TTS error:", e);
  }
};
