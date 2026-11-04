import { dateKey, daysInMonth } from './dates';
import type { WorkoutPlan } from '../types';

/** Кількість тренувань у місяці. */
export const countInMonth = (plan: WorkoutPlan, year: number, month: number): number => {
  let count = 0;
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    if (plan[dateKey(year, month, d)] !== undefined) count += 1;
  }
  return count;
};

/** Серія з _запланованих_ днів, що йдуть поспіль, з урахуванням прогалин (до `maxGap` днів пропуску). */
export const currentStreak = (
  plan: WorkoutPlan,
  today: Date,
  maxGap = 1,
): number => {
  let streak = 0;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let i = 0; i < 60; i++) {
    const key = dateKey(t.getFullYear(), t.getMonth(), t.getDate());
    if (plan[key] !== undefined) {
      streak += 1;
      t.setDate(t.getDate() - 1);
    } else if (i < maxGap && streak > 0) {
      // дозволяємо 1 пропуск у серії
      t.setDate(t.getDate() - 1);
      // не рахувати пропуск як частину серії
    } else {
      break;
    }
  }
  return streak;
};

/** Прогрес до місячної цілі (за замовчуванням 12). */
export const monthProgress = (plan: WorkoutPlan, now: Date, goal = 12): number => {
  return Math.min(100, Math.round((countInMonth(plan, now.getFullYear(), now.getMonth()) / goal) * 100));
};
