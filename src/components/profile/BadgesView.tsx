import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown, 
  Flame, 
  Timer, 
  BookOpen, 
  Library, 
  Globe, 
  Download,
  Lock,
  LucideIcon
} from 'lucide-react';
import { UserAchievement } from '../../types';
import { ACHIEVEMENTS } from '../../data/achievements';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Trophy,
  Crown,
  Flame,
  FlameKindle: Flame, // Fallback
  Timer,
  BookOpen,
  Library,
  Globe,
  Download
};

interface BadgesViewProps {
  unlockedBadges: UserAchievement[];
  showLocked?: boolean;
}

const BadgesView: React.FC<BadgesViewProps> = ({ unlockedBadges, showLocked = true }) => {
  const unlockedIds = unlockedBadges.map(b => b.id);
  
  const getRarityColor = (rarity: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'grayscale opacity-40 bg-gray-100 dark:bg-gray-800 text-gray-400';
    
    switch (rarity) {
      case 'common': return 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200';
      case 'rare': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200';
      case 'epic': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200';
      case 'legendary': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 border-2 border-dashed animate-pulse';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {ACHIEVEMENTS.map(achievement => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        if (!isUnlocked && !showLocked) return null;
        
        const Icon = iconMap[achievement.icon] || Trophy;
        const rarityStyle = getRarityColor(achievement.rarity, isUnlocked);
        
        return (
          <div 
            key={achievement.id}
            className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 ${rarityStyle} ${isUnlocked ? 'scale-100' : 'scale-95'}`}
            title={achievement.description}
          >
            <div className="mb-2 relative">
              {isUnlocked ? (
                <Icon size={32} />
              ) : (
                <Lock size={32} />
              )}
            </div>
            <span className="text-xs font-black text-center line-clamp-1">
              {achievement.name}
            </span>
            {isUnlocked && (
              <span className="text-[10px] opacity-70 mt-1">
                {new Date(unlockedBadges.find(b => b.id === achievement.id)!.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgesView;
