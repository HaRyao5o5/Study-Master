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
  isCorrect: boolean
): { interval: number; easeFactor: number; nextReview: number } => {
  const now = Date.now();
  const quality = isCorrect ? 4 : 1;
  
  let interval = 0;
  let easeFactor = currentItem?.easeFactor || INITIAL_EASE_FACTOR;
  let streak = currentItem?.streak || 0;

  if (quality >= 3) {
    // Correct response
    if (streak === 0) {
      interval = 1;
    } else if (streak === 1) {
      interval = 6;
    } else {
      interval = Math.round((currentItem?.interval || 1) * easeFactor);
    }
    streak++;
  } else {
    // Incorrect response
    streak = 0;
    interval = 1; // Reset to 1 day
    // Keep ease factor same or slight penalty? SM-2 usually penalizes, but for simple app, keeping it is safer to avoid "hell".
    // SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // q=1 => (4) * (0.08 + 4*0.02) = 4 * 0.16 = 0.64. EF - 0.54. Penalize.
  }

  // Update Ease Factor (SM-2 standard formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // q=4 (Correct) => 0.1 - (1)*(0.1) = 0. No change.
  // q=5 (Perfect) => 0.1 - 0 = +0.1. Increase.
  // q=1 (Wrong)   => 0.1 - 4*(0.16) = -0.54. Decrease.
  
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3; // Minimum cap

  // Calculate Next Review Date
  // nextReview = now + interval * 24 * 60 * 60 * 1000
  const oneDay = 24 * 60 * 60 * 1000;
  const nextReview = now + (interval * oneDay);

  return { interval, easeFactor, nextReview };
};

/**
 * Check if an item is due for review
 */
export const isDue = (item: ReviewItem): boolean => {
  return item.nextReview <= Date.now();
};
