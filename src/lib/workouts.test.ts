import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MINUTES,
  MAX_MINUTES,
  MAX_NOTE_LENGTH,
  MIN_MINUTES,
  describeWorkout,
  normalizeWorkout,
} from './workouts';

describe('normalizeWorkout', () => {
  it('лишає коректне тренування без змін', () => {
    expect(normalizeWorkout({ type: 'cardio', minutes: 30, note: 'Інтервали' })).toEqual({
      type: 'cardio',
      minutes: 30,
      note: 'Інтервали',
    });
  });

  it('підставляє безпечні значення для порожнього обʼєкта', () => {
    expect(normalizeWorkout({})).toEqual({
      type: 'other',
      minutes: DEFAULT_MINUTES,
      note: '',
    });
  });

  it('замінює невідомий тип на «інше»', () => {
    expect(normalizeWorkout({ type: 'yoga', minutes: 30 })?.type).toBe('other');
  });

  it('обрізає тривалість до допустимого діапазону та округлює', () => {
    expect(normalizeWorkout({ type: 'run', minutes: -20 })?.minutes).toBe(MIN_MINUTES);
    expect(normalizeWorkout({ type: 'run', minutes: 10_000 })?.minutes).toBe(MAX_MINUTES);
    expect(normalizeWorkout({ type: 'run', minutes: 44.6 })?.minutes).toBe(45);
    expect(normalizeWorkout({ type: 'run', minutes: Number.NaN })?.minutes).toBe(DEFAULT_MINUTES);
  });

  it('обрізає нотатку до максимальної довжини', () => {
    const note = 'а'.repeat(MAX_NOTE_LENGTH + 40);

    expect(normalizeWorkout({ type: 'stretch', minutes: 20, note })?.note).toHaveLength(
      MAX_NOTE_LENGTH,
    );
  });

  it('прибирає зайві пробіли в нотатці', () => {
    expect(normalizeWorkout({ type: 'stretch', minutes: 20, note: '  прес  ' })?.note).toBe('прес');
  });

  it('відкидає значення, які не є обʼєктом', () => {
    expect(normalizeWorkout(null)).toBeNull();
    expect(normalizeWorkout('strength')).toBeNull();
    expect(normalizeWorkout([1, 2])).toBeNull();
    expect(normalizeWorkout(undefined)).toBeNull();
  });
});

describe('describeWorkout', () => {
  it('описує тип і тривалість для скрінрідера', () => {
    expect(describeWorkout({ type: 'run', minutes: 40, note: '' })).toBe('Біг · 40 хв');
  });
});
