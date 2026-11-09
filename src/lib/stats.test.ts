import { describe, expect, it } from 'vitest';
import { dateKey } from './dates';
import { countDoneInMonth, countInMonth, currentStreak, monthProgress } from './stats';
import type { WorkoutPlan } from '../types';

const entry = (done: boolean) => ({ type: 'strength' as const, minutes: 45, note: '', done });

const plan: WorkoutPlan = {
  [dateKey(2026, 10, 2)]: entry(true),
  [dateKey(2026, 10, 3)]: entry(true),
  [dateKey(2026, 10, 5)]: entry(false),
  [dateKey(2026, 10, 6)]: entry(false),
  [dateKey(2026, 10, 9)]: entry(false),
  [dateKey(2026, 10, 12)]: entry(true),
  [dateKey(2026, 10, 13)]: entry(true),
  [dateKey(2026, 10, 14)]: entry(true),
};

describe('countInMonth', () => {
  it('рахує лише дні цього місяця', () => {
    expect(countInMonth(plan, 2026, 10)).toBe(8);
    expect(countInMonth(plan, 2026, 9)).toBe(0);
  });
});

describe('countDoneInMonth', () => {
  it('рахує лише виконані тренування', () => {
    expect(countDoneInMonth(plan, 2026, 10)).toBe(5);
    expect(countDoneInMonth(plan, 2026, 9)).toBe(0);
  });
});

describe('currentStreak', () => {
  it('рахує серію виконаних днів назад від сьогодні', () => {
    expect(currentStreak(plan, new Date(2026, 10, 14))).toBe(3); // 14, 13, 12
  });

  it('не обриває серію, якщо сьогодні ще не позначено', () => {
    expect(currentStreak(plan, new Date(2026, 10, 15))).toBe(3);
  });

  it('не дозволяє два пропуски поспіль', () => {
    expect(currentStreak(plan, new Date(2026, 10, 16))).toBe(0);
  });

  it('ігнорує заплановані, але не виконані дні', () => {
    expect(currentStreak(plan, new Date(2026, 10, 9))).toBe(0);
  });

  it('не обмежує серію одним роком', () => {
    const longPlan: WorkoutPlan = {};
    const today = new Date(2026, 10, 14);
    for (let i = 0; i < 400; i++) {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      longPlan[dateKey(day.getFullYear(), day.getMonth(), day.getDate())] = entry(true);
    }

    expect(currentStreak(longPlan, today)).toBe(400);
  });
});

describe('monthProgress', () => {
  it('обчислює відсоток виконаних від цілі', () => {
    expect(monthProgress(plan, 2026, 10, 12)).toBe(Math.round((5 / 12) * 100));
  });

  it('рахує прогрес саме для переданого місяця', () => {
    expect(monthProgress(plan, 2026, 9, 12)).toBe(0);
  });

  it('повертає 0 для недодатної цілі', () => {
    expect(monthProgress(plan, 2026, 10, 0)).toBe(0);
  });

  it('не перевищує 100%', () => {
    const full: WorkoutPlan = {};
    for (let d = 1; d <= 30; d++) full[dateKey(2026, 10, d)] = entry(true);

    expect(monthProgress(full, 2026, 10, 12)).toBe(100);
  });
});
