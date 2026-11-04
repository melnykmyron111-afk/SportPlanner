import { describe, expect, it } from 'vitest';
import {
  dateKey,
  daysInMonth,
  getCalendarDays,
  isValidDateKey,
  monthNames,
  monthNamesGenitive,
  parseLegacyDateKey,
  weekdays,
} from './dates';

describe('dateKey', () => {
  it('доповнює місяць і день нулями та рахує місяць з нуля', () => {
    expect(dateKey(2026, 0, 4)).toBe('2026-01-04');
    expect(dateKey(2026, 10, 30)).toBe('2026-11-30');
    expect(dateKey(2024, 11, 31)).toBe('2024-12-31');
  });

  it('сортується лексикографічно за хронологією', () => {
    const keys = [dateKey(2026, 11, 1), dateKey(2026, 1, 9), dateKey(2026, 1, 10)].sort();
    expect(keys).toEqual(['2026-02-09', '2026-02-10', '2026-12-01']);
  });
});

describe('isValidDateKey', () => {
  it('приймає наявні ISO-дати', () => {
    expect(isValidDateKey('2026-11-30')).toBe(true);
    expect(isValidDateKey('2024-02-29')).toBe(true);
    expect(isValidDateKey('2026-01-01')).toBe(true);
  });

  it('відхиляє неіснуючі дати та неправильний формат', () => {
    expect(isValidDateKey('2026-02-29')).toBe(false);
    expect(isValidDateKey('2026-04-31')).toBe(false);
    expect(isValidDateKey('2026-13-01')).toBe(false);
    expect(isValidDateKey('2026-00-10')).toBe(false);
    expect(isValidDateKey('2026-1-1')).toBe(false);
    expect(isValidDateKey('2026-11-30T00:00:00')).toBe(false);
    expect(isValidDateKey('')).toBe(false);
  });
});

describe('parseLegacyDateKey', () => {
  it('трактує місяць як індекс з нуля (v1)', () => {
    expect(parseLegacyDateKey('2025-4-2')).toBe('2025-05-02');
    // Старий ключ «2025-11-30» означав 30 грудня, а не 30 листопада.
    expect(parseLegacyDateKey('2025-11-30')).toBe('2025-12-30');
    expect(parseLegacyDateKey('2026-0-4')).toBe('2026-01-04');
  });

  it('повертає null для некоректних старих ключів', () => {
    expect(parseLegacyDateKey('2025-12-1')).toBeNull();
    expect(parseLegacyDateKey('2025-3-31')).toBeNull();
    expect(parseLegacyDateKey('2025-1-30')).toBeNull();
    expect(parseLegacyDateKey('not-a-date')).toBeNull();
  });
});

describe('daysInMonth', () => {
  it('враховує високосні роки та довжину місяців', () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2025, 1)).toBe(28);
    expect(daysInMonth(2026, 10)).toBe(30);
    expect(daysInMonth(2026, 11)).toBe(31);
    expect(daysInMonth(2100, 1)).toBe(28);
  });
});

describe('getCalendarDays', () => {
  it('додає порожні клітинки до першого числа (тиждень з понеділка)', () => {
    // 1 листопада 2026 — неділя, тому 6 порожніх клітинок.
    const november = getCalendarDays(2026, 10);
    expect(november.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(november[6]).toBe(1);
    expect(november).toHaveLength(36);
    expect(november[november.length - 1]).toBe(30);
  });

  it('коректно працює з лютим у високосний рік', () => {
    // 1 лютого 2024 — четвер, тому 3 порожні клітинки.
    const february = getCalendarDays(2024, 1);
    expect(february.slice(0, 3)).toEqual([null, null, null]);
    expect(february[3]).toBe(1);
    expect(february).toHaveLength(32);
  });

  it('не додає порожніх клітинок, якщо місяць починається з понеділка', () => {
    // 1 червня 2026 — понеділок.
    const june = getCalendarDays(2026, 5);
    expect(june[0]).toBe(1);
    expect(june).toHaveLength(30);
  });
});

describe('підписи', () => {
  it('містить 12 місяців у називному та родовому відмінках', () => {
    expect(monthNames).toHaveLength(12);
    expect(monthNamesGenitive).toHaveLength(12);
    expect(monthNamesGenitive[10]).toBe('листопада');
    expect(monthNames[10]).toBe('Листопад');
  });

  it('тиждень починається з понеділка', () => {
    expect(weekdays).toEqual(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']);
  });
});
