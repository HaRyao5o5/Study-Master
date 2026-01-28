import { UserAchievement, UserStats, Course } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

interface CheckContext {
  stats: UserStats;
  courses: Course[];
  existingAchievementIds: string[];
}

/**
 * Checks if any new achievements have been unlocked based on current state.
 * Returns an array of newly unlocked achievement objects.
 */
export const checkAchievements = (context: CheckContext): UserAchievement[] => {
  const { stats, courses, existingAchievementIds } = context;
  const newlyUnlocked: UserAchievement[] = [];
  const now = Date.now();

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (existingAchievementIds.includes(achievement.id)) return;

    let isMet = false;

    switch (achievement.category) {
      case 'xp':
        isMet = stats.totalXp >= achievement.requirement;
        break;
      case 'streak':
        isMet = stats.streak >= achievement.requirement;
        break;
      case 'course':
        isMet = courses.length >= achievement.requirement;
        break;
      case 'social':
        if (achievement.id === 'social_publish') {
          isMet = courses.some(c => c.isPublic || c.visibility === 'public');
        }
        // 'social_download' is harder to check retrospectively without a download history, 
        // handle it directly in the import function for now.
        break;
    }

    if (isMet) {
      newlyUnlocked.push({
        id: achievement.id,
        unlockedAt: now
      });
    }
  });

  return newlyUnlocked;
};
