import { dateKey, daysInMonth } from './dates';
import type { WorkoutPlan } from '../types';

/** Кількість запланованих тренувань у місяці. */
export const countInMonth = (plan: WorkoutPlan, year: number, month: number): number => {
  let count = 0;
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    if (plan[dateKey(year, month, d)] !== undefined) count += 1;
  }
  return count;
};

/** Кількість виконаних тренувань у місяці. */
export const countDoneInMonth = (plan: WorkoutPlan, year: number, month: number): number => {
  let count = 0;
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    if (plan[dateKey(year, month, d)]?.done) count += 1;
  }
  return count;
};

/**
 * Серія послідовних виконаних днів, що тягнеться назад від сьогодні.
 * `maxGap` дозволяє пропустити кілька днів (відпочинок), не обриваючи серію.
 */
export const currentStreak = (plan: WorkoutPlan, today: Date, maxGap = 1): number => {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let streak = 0;
  let gap = 0;

  for (let i = 0; i < 366; i++) {
    const done = plan[dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())]?.done;

    if (done) {
      streak += 1;
      gap = 0;
    } else {
      gap += 1;
      if (gap > maxGap) break;
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

/** Прогрес до місячної цілі за виконаними тренуваннями (за замовчуванням ціль — 12). */
export const monthProgress = (plan: WorkoutPlan, now: Date, goal = 12): number => {
  const done = countDoneInMonth(plan, now.getFullYear(), now.getMonth());
  return Math.min(100, Math.round((done / goal) * 100));
};
