import { describe, it, expect } from 'vitest';
import { checkAchievements } from './achievementSystem';
import { UserStats, Course } from '../types';

describe('Achievement System (checkAchievements)', () => {
  const mockStats: UserStats = {
    level: 1,
    totalXp: 0,
    streak: 0,
    lastLogin: '',
  };

  const mockCourses: Course[] = [];

  it('条件を満たしていない場合は何も解除されないこと', () => {
    const newlyUnlocked = checkAchievements({
      stats: mockStats,
      courses: mockCourses,
      existingAchievementIds: []
    });
    expect(newlyUnlocked).toHaveLength(0);
  });

  it('XP が閾値を超えた時に実績が解除されること', () => {
    const stats = { ...mockStats, totalXp: 1000 };
    const newlyUnlocked = checkAchievements({
      stats,
      courses: mockCourses,
      existingAchievementIds: []
    });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('xp_beginner');
  });

  it('ストリークが閾値を超えた時に実績が解除されること', () => {
    const stats = { ...mockStats, streak: 3 };
    const newlyUnlocked = checkAchievements({
      stats,
      courses: mockCourses,
      existingAchievementIds: []
    });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('streak_3');
  });

  it('コース作成数が閾値を超えた時に実績が解除されること', () => {
    const courses: Course[] = [
        { id: 'c1', title: 'T1', quizzes: [] }
    ];
    const newlyUnlocked = checkAchievements({
      stats: mockStats,
      courses,
      existingAchievementIds: []
    });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('course_creator');
  });

  it('既に解除済みの実績は重複して解除されないこと', () => {
    const stats = { ...mockStats, totalXp: 1000 };
    const newlyUnlocked = checkAchievements({
      stats,
      courses: mockCourses,
      existingAchievementIds: ['xp_beginner']
    });
    expect(newlyUnlocked).toHaveLength(0);
  });

  it('複数の実績を同時に解除できること', () => {
    const stats = { ...mockStats, totalXp: 1000, streak: 3 };
    const newlyUnlocked = checkAchievements({
      stats,
      courses: mockCourses,
      existingAchievementIds: []
    });
    expect(newlyUnlocked).toHaveLength(2);
    const ids = newlyUnlocked.map(a => a.id);
    expect(ids).toContain('xp_beginner');
    expect(ids).toContain('streak_3');
  });

  it('公開設定のコースがある場合にソーシャル実績が解除されること', () => {
    const courses: Course[] = [
        { id: 'c1', title: 'T1', quizzes: [], visibility: 'public' }
    ];
    const newlyUnlocked = checkAchievements({
      stats: mockStats,
      courses,
      existingAchievementIds: []
    });
    const ids = newlyUnlocked.map(a => a.id);
    expect(ids).toContain('social_publish');
  });
});
