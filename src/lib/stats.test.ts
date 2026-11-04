import { describe, expect, it } from 'vitest';
import { dateKey } from './dates';
import { countInMonth, currentStreak, monthProgress } from './stats';
import type { WorkoutPlan } from '../types';

const plan: WorkoutPlan = {
  [dateKey(2026, 10, 2)]: { type: 'strength', minutes: 45, note: '' },
  [dateKey(2026, 10, 3)]: { type: 'cardio', minutes: 30, note: '' },
  [dateKey(2026, 10, 5)]: { type: 'stretch', minutes: 20, note: '' },
  [dateKey(2026, 10, 6)]: { type: 'run', minutes: 40, note: '' },
  [dateKey(2026, 10, 9)]: { type: 'other', minutes: 30, note: '' },
  [dateKey(2026, 10, 12)]: { type: 'other', minutes: 30, note: '' },
  [dateKey(2026, 10, 13)]: { type: 'other', minutes: 30, note: '' },
  [dateKey(2026, 10, 14)]: { type: 'other', minutes: 30, note: '' },
};

describe('countInMonth', () => {
  it('рахує лише дні цього місяця', () => {
    expect(countInMonth(plan, 2026, 10)).toBe(8);
    expect(countInMonth(plan, 2026, 9)).toBe(0);
  });
});

describe('currentStreak', () => {
  it('рахує серію назад від сьогодні', () => {
    const today = new Date(2026, 10, 14);
    // 14 і 13 заплановано — серія 2
    expect(currentStreak(plan, today, 0)).toBe(3); // 14,13,12
  });

  it('дозволяє 1 пропуск', () => {
    const today = new Date(2026, 10, 14);
    // серія 14 → 13 → 12 → 9 (пропуск 11, 10) — не рахується як безперервна через 2 пропуски
    expect(currentStreak(plan, today, 1)).toBe(3);
  });
});

describe('monthProgress', () => {
  it('обчислює відсоток від цілі', () => {
    expect(monthProgress(plan, new Date(2026, 10, 15), 12)).toBe(Math.round((8 / 12) * 100));
  });

  it('не перевищує 100%', () => {
    const full = (() => {
      const p: WorkoutPlan = {};
      for (let d = 1; d <= 30; d++) p[dateKey(2026, 10, d)] = { type: 'other', minutes: 30, note: '' };
      return p;
    })();
    expect(monthProgress(full, new Date(2026, 10, 15), 12)).toBe(100);
  });
});
