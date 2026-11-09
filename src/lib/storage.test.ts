import { beforeEach, describe, expect, it } from 'vitest';
import type { Workout } from '../types';
import { dateKey, demoDayNumbers } from './dates';
import {
  createSeedPlan,
  LEGACY_V1_KEY,
  LEGACY_V2_KEY,
  loadPlan,
  readPlan,
  savePlan,
  STORAGE_KEY,
} from './storage';

const now = new Date(2026, 10, 15);

const workout = (
  type: Workout['type'] = 'strength',
  minutes = 45,
  note = '',
  done = false,
): Workout => ({
  type,
  minutes,
  note,
  done,
});

// Ключ у форматі v1: місяць — індекс з нуля, без доповнення нулями.
const legacyKey = (year: number, month: number, day: number) => `${year}-${month}-${day}`;

const legacyDemoSeed = () => demoDayNumbers.map((day) => legacyKey(2025, 4, day));

const storedV3 = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as unknown;

beforeEach(() => {
  localStorage.clear();
});

describe('createSeedPlan', () => {
  it('переносить демо-дні на поточний місяць із різними типами', () => {
    const seed = createSeedPlan(now);

    expect(Object.keys(seed)).toHaveLength(demoDayNumbers.length);
    expect(seed[dateKey(2026, 10, 2)]).toEqual(workout('strength', 45));
    expect(seed[dateKey(2026, 10, 3)]).toEqual(workout('cardio', 30));
    expect(seed[dateKey(2026, 10, 5)]).toEqual(workout('stretch', 20));
    expect(seed[dateKey(2026, 10, 6)]).toEqual(workout('run', 40));
    expect(seed[dateKey(2026, 9, 2)]).toBeUndefined();
  });

  it('відсікає дні, яких немає в короткому місяці', () => {
    const seed = createSeedPlan(new Date(2026, 1, 1));

    expect(seed[dateKey(2026, 1, 30)]).toBeUndefined();
    expect(Object.keys(seed)).toHaveLength(demoDayNumbers.filter((day) => day <= 28).length);
  });
});

describe('loadPlan', () => {
  it('повертає демо-план, якщо сховище порожнє', () => {
    expect(loadPlan(now)).toEqual(createSeedPlan(now));
  });

  it('читає збережений план v3', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ '2026-11-04': workout('cardio', 30, 'Інтервали') }),
    );

    expect(loadPlan(now)).toEqual({ '2026-11-04': workout('cardio', 30, 'Інтервали') });
  });

  it('зберігає явно порожній план і не підставляє демо-дані', () => {
    localStorage.setItem(STORAGE_KEY, '{}');

    expect(loadPlan(now)).toEqual({});
  });

  it('відкидає некоректні записи, але лишає валідні', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        '2026-11-04': { type: 'run', minutes: 40, note: 'Парк' },
        '2026-02-30': workout(),
        'not-a-date': workout(),
        '2026-11-20': 'garbage',
        '2026-11-21': null,
        '2026-11-22': [1, 2],
        '2026-11-23': { type: 'nonsense', minutes: 999 },
      }),
    );

    expect(loadPlan(now)).toEqual({
      '2026-11-04': workout('run', 40, 'Парк'),
      '2026-11-23': workout('other', 240),
    });
  });

  it('падає назад у демо-план, якщо JSON пошкоджений або це не обʼєкт', () => {
    localStorage.setItem(STORAGE_KEY, '{oops');
    expect(loadPlan(now)).toEqual(createSeedPlan(now));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(['2026-11-04']));
    expect(loadPlan(now)).toEqual(createSeedPlan(now));
  });

  it('мігрує масив v2 у тренування типу «інше»', () => {
    localStorage.setItem(LEGACY_V2_KEY, JSON.stringify(['2026-11-04', '2026-11-20']));

    expect(loadPlan(now)).toEqual({
      '2026-11-04': workout('other', 30),
      '2026-11-20': workout('other', 30),
    });
  });

  it('зберігає явно порожній масив v2', () => {
    localStorage.setItem(LEGACY_V2_KEY, '[]');

    expect(loadPlan(now)).toEqual({});
  });

  it('надає перевагу v3 над v2 і v1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ '2026-11-04': workout('run', 15) }));
    localStorage.setItem(LEGACY_V2_KEY, JSON.stringify(['2026-11-05']));
    localStorage.setItem(LEGACY_V1_KEY, JSON.stringify(legacyDemoSeed()));

    expect(loadPlan(now)).toEqual({ '2026-11-04': workout('run', 15) });
  });

  it('надає перевагу v2 над v1', () => {
    localStorage.setItem(LEGACY_V2_KEY, JSON.stringify(['2026-11-04']));
    localStorage.setItem(LEGACY_V1_KEY, JSON.stringify(legacyDemoSeed()));

    expect(loadPlan(now)).toEqual({ '2026-11-04': workout('other', 30) });
  });

  it('мігрує недоторканий демо-набір v1 у поточний місяць', () => {
    localStorage.setItem(LEGACY_V1_KEY, JSON.stringify(legacyDemoSeed()));

    expect(loadPlan(now)).toEqual(createSeedPlan(now));
  });

  it('зберігає відредаговані користувачем дані v1, конвертуючи ключі в ISO', () => {
    localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([legacyKey(2025, 4, 2), legacyKey(2025, 11, 30)]),
    );

    expect(loadPlan(now)).toEqual({
      '2025-05-02': workout('other', 30),
      '2025-12-30': workout('other', 30),
    });
  });

  it('ігнорує пошкоджені дані v1', () => {
    localStorage.setItem(LEGACY_V1_KEY, '{"broken"');

    expect(loadPlan(now)).toEqual(createSeedPlan(now));
  });
});

describe('savePlan', () => {
  it('зберігає план із відсортованими ключами та прибирає застарілі ключі', () => {
    localStorage.setItem(LEGACY_V2_KEY, JSON.stringify(['2026-11-05']));
    localStorage.setItem(LEGACY_V1_KEY, JSON.stringify(legacyDemoSeed()));

    savePlan({
      '2026-11-20': workout('run', 40),
      '2026-11-04': workout('strength', 45, 'Ноги'),
      '2026-11-11': workout('stretch', 20),
    });

    expect(Object.keys(storedV3() as Record<string, Workout>)).toEqual([
      '2026-11-04',
      '2026-11-11',
      '2026-11-20',
    ]);
    expect(localStorage.getItem(LEGACY_V2_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_V1_KEY)).toBeNull();
  });

  it('зберігає порожній план як порожній обʼєкт', () => {
    savePlan({});

    expect(storedV3()).toEqual({});
  });

  it('після збереження дані читаються без змін', () => {
    const plan = {
      '2026-11-04': workout('strength', 45, 'Ноги', true),
      '2026-11-20': workout('cardio', 30),
    };
    savePlan(plan);

    expect(loadPlan(now)).toEqual(plan);
  });

  it('зберігає позначку виконання', () => {
    savePlan({ '2026-11-04': workout('run', 40, '', true) });

    expect((storedV3() as Record<string, Workout>)['2026-11-04'].done).toBe(true);
    expect(loadPlan(now)['2026-11-04'].done).toBe(true);
  });
});

describe('readPlan', () => {
  it('розбирає значення з події storage', () => {
    expect(readPlan(JSON.stringify({ '2026-11-04': workout('run', 40) }), now)).toEqual({
      '2026-11-04': workout('run', 40),
    });
  });

  it('перечитує сховище, якщо ключ видалили', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ '2026-11-04': workout('run', 40) }));

    expect(readPlan(null, now)).toEqual({ '2026-11-04': workout('run', 40) });
  });

  it('падає назад у сховище для пошкодженого значення', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ '2026-11-04': workout('run', 40) }));

    expect(readPlan('{oops', now)).toEqual({ '2026-11-04': workout('run', 40) });
  });
});
