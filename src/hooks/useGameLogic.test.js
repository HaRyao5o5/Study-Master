import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from './useGameLogic';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockShowSuccess = vi.fn();
const mockShowConfirm = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showConfirm: mockShowConfirm
  })
}));

describe('useGameLogic', () => {
  const mockSetCourses = vi.fn();
  const mockSetUserStats = vi.fn();
  const mockSetWrongHistory = vi.fn();
  const mockSetMasteredQuestions = vi.fn();
  const mockSetGoals = vi.fn();
  const mockSaveData = vi.fn();

  const mockCourses = [
    {
      id: 'course-1',
      title: 'Test Course',
      quizzes: [
        {
          id: 'quiz-1',
          title: 'Test Quiz',
          questions: [
            { id: 'q1', type: 'multiple', question: 'Q1', correctAnswer: 'A1', options: ['A1', 'B1'] },
            { id: 'q2', type: 'multiple', question: 'Q2', correctAnswer: 'A2', options: ['A2', 'B2'] }
          ]
        }
      ]
    }
  ];

  const initialProps = {
    courses: mockCourses,
    setCourses: mockSetCourses,
    userStats: { totalXp: 0, level: 1, streak: 0 },
    setUserStats: mockSetUserStats,
    wrongHistory: [],
    setWrongHistory: mockSetWrongHistory,
    masteredQuestions: {},
    setMasteredQuestions: mockSetMasteredQuestions,
    goals: { dailyXpGoal: 100, dailyProgress: 0, weeklyXpGoal: 700, weeklyProgress: 0 },
    setGoals: mockSetGoals,
    saveData: mockSaveData
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleCreateQuiz navigates to create page', () => {
    const { result } = renderHook(() => useGameLogic(initialProps));
    
    act(() => {
      result.current.handleCreateQuiz('course-1');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/course/course-1/create-quiz');
  });

  it('finishQuiz calculates score and updates stats (Perfect Score)', () => {
    const { result } = renderHook(() => useGameLogic(initialProps));
    
    const userAnswers = {
      'q1': 'A1',
      'q2': 'A2'
    };

    act(() => {
      result.current.finishQuiz(userAnswers, 100, 'course-1', 'quiz-1');
    });

    // Score: 2/2 = 100%
    // Base XP: 2 * 10 = 20
    // Bonus XP: 20 * 0.5 = 10
    // Total XP: 30
    
    // Verify State Updates
    expect(mockSaveData).toHaveBeenCalled();
    const updates = mockSaveData.mock.calls[0][0];
    expect(updates.userStats.totalXp).toBe(30);
    expect(updates.goals.dailyProgress).toBe(30);
    
    // Verify Navigation
    expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-1/quiz/quiz-1/result', 
        expect.objectContaining({ 
            state: expect.objectContaining({ 
                resultData: expect.objectContaining({ score: 2, percentage: 100, xpGained: 30 }) 
            }) 
        })
    );
  });

  it('finishQuiz adds wrong answers to history', () => {
    const { result } = renderHook(() => useGameLogic(initialProps));
    
    const userAnswers = {
      'q1': 'A1', // Correct
      'q2': 'Wrong' // Incorrect
    };

    act(() => {
      result.current.finishQuiz(userAnswers, 100, 'course-1', 'quiz-1');
    });

    expect(mockSaveData).toHaveBeenCalled();
    const updates = mockSaveData.mock.calls[0][0];
    expect(updates.wrongHistory).toContain('q2');
  });

  it('handleDeleteQuiz requests confirmation and deletes', async () => {
    mockShowConfirm.mockResolvedValue(true);
    const { result } = renderHook(() => useGameLogic(initialProps));

    await act(async () => {
      await result.current.handleDeleteQuiz('quiz-1', 'course-1');
    });

    expect(mockShowConfirm).toHaveBeenCalled();
    expect(mockSaveData).toHaveBeenCalled();
    
    const updates = mockSaveData.mock.calls[0][0];
    expect(updates.courses[0].quizzes).toHaveLength(0);
  });

  it('handleDeleteQuiz does nothing if not confirmed', async () => {
    mockShowConfirm.mockResolvedValue(false);
    const { result } = renderHook(() => useGameLogic(initialProps));

    await act(async () => {
      await result.current.handleDeleteQuiz('quiz-1', 'course-1');
    });

    expect(mockShowConfirm).toHaveBeenCalled();
    expect(mockSaveData).not.toHaveBeenCalled();
  });
});
