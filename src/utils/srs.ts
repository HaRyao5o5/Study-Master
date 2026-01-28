/**
 * Spaced Repetition System (SRS) Utilities
 * Based on SuperMemo-2 (SM-2) Algorithm
 */

import { ReviewItem } from '../types';

// Initial values
export const INITIAL_EASE_FACTOR = 2.5;
export const INITIAL_INTERVAL = 0; // 0 days (immediate/next day depending on logic)

/**
 * Calculate next review schedule based on performance
 * @param currentItem Current review state (or null if new)
 * @param quality Quality of recall (0-5). 
 *                5: perfect response
 *                4: correct response after hesitation
 *                3: correct response recalled with serious difficulty
 *                2: incorrect response; where the correct one seemed easy to recall
 *                1: incorrect response; the correct one remembered
 *                0: complete blackout.
 *                
 *                For simple Correct/Incorrect app:
 *                Correct -> 4
 *                Incorrect -> 1
 */
export const calculateNextReview = (
  currentItem: ReviewItem | null | undefined,
  isCorrect: boolean,
  allowLevelUp: boolean = true
): { interval: number; easeFactor: number; nextReview: number; streak: number } => {
  const now = Date.now();
  const quality = isCorrect ? 4 : 1;
  const isEarly = currentItem && currentItem.nextReview > now;
  
  let interval = 0;
  let easeFactor = currentItem?.easeFactor || INITIAL_EASE_FACTOR;
  let streak = currentItem?.streak || 0;

  if (isCorrect) {
    // Maintenance Mode if:
    // 1. Item exists AND is Early (Review ahead)
    // 2. Item exists AND Level Up is NOT allowed (Normal mode/Review mode)
    // Note: If item is null (New), we always execute ELSE (Init 0 -> 1), satisfying "Add to list" requirement.
    if (currentItem && (isEarly || !allowLevelUp)) {
        // Early Review (Correct): Just reset the timer, don't increase difficulty/streak
        // This allows users to "practice" without messing up the long-term schedule too much
        interval = currentItem.interval;
        streak = currentItem.streak;
        // Keep existing Ease Factor
        easeFactor = currentItem.easeFactor;
    } else {
        // Normal Due Review (or New Item)
        if (streak === 0) {
          interval = 1;
        } else if (streak === 1) {
          interval = 6;
        } else {
          interval = Math.round((currentItem?.interval || 1) * easeFactor);
        }
        streak++;
        
        // Update Ease Factor only on actual spaced reviews
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
    }
  } else {
    // Incorrect response: Always reset
    streak = 0;
    interval = 1; 

    // Penalize Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3; 
  }

  // Calculate Next Review Date
  const oneDay = 24 * 60 * 60 * 1000;
  const nextReview = now + (interval * oneDay);

  return { interval, easeFactor, nextReview, streak };
};

/**
 * Check if an item is due for review
 */
export const isDue = (item: ReviewItem): boolean => {
  return item.nextReview <= Date.now();
};
