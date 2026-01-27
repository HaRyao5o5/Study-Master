import React, { useEffect, useState } from 'react';
import { Flame, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface StreakCelebrationOverlayProps {
  streak: number;
  onDismiss: () => void;
}

const StreakCelebrationOverlay: React.FC<StreakCelebrationOverlayProps> = ({ streak, onDismiss }) => {
  const { width, height } = useWindowSize();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm animate-fade-in">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
        colors={['#f97316', '#fbbf24', '#ef4444', '#ffffff']}
      />
      
      <div className={`flex flex-col items-center justify-center transition-all duration-700 transform ${showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'}`}>
        
        {/* Animated Flame Icon */}
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-orange-400 to-red-600 p-8 rounded-full shadow-2xl animate-bounce-subtle border-4 border-orange-200">
                <Flame size={80} className="text-white fill-current animate-pulse" />
            </div>
            {/* Sparkles */}
            <Star size={24} className="absolute -top-4 -right-4 text-yellow-300 animate-spin-slow fill-current" />
            <Star size={16} className="absolute bottom-0 -left-6 text-yellow-300 animate-ping fill-current" />
        </div>

        {/* Text Content */}
        <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-wider text-center drop-shadow-lg">
            {streak}日連続！
        </h2>
        <p className="text-xl text-orange-100 mb-10 font-bold tracking-wide">
            学習記録を更新しました🔥
        </p>

        {/* Continue Button */}
        <button
            onClick={onDismiss}
            className="group relative px-10 py-4 bg-white text-orange-600 font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transform transition-all hover:scale-105 active:scale-95"
        >
            <span className="relative z-10">続ける</span>
            <div className="absolute inset-0 h-full w-full rounded-2xl bg-orange-100 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

      </div>
    </div>
  );
};

export default StreakCelebrationOverlay;
