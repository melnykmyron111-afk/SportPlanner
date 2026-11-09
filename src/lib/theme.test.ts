import { describe, expect, it } from 'vitest';
import { seasonForMonth } from './theme';

describe('seasonForMonth', () => {
  it('визначає зиму для грудня, січня і лютого', () => {
    expect(seasonForMonth(11)).toBe('winter');
    expect(seasonForMonth(0)).toBe('winter');
    expect(seasonForMonth(1)).toBe('winter');
  });

  it('визначає весну для березня, квітня і травня', () => {
    expect(seasonForMonth(2)).toBe('spring');
    expect(seasonForMonth(3)).toBe('spring');
    expect(seasonForMonth(4)).toBe('spring');
  });

  it('визначає літо для червня, липня і серпня', () => {
    expect(seasonForMonth(5)).toBe('summer');
    expect(seasonForMonth(6)).toBe('summer');
    expect(seasonForMonth(7)).toBe('summer');
  });

  it('визначає осінь для вересня, жовтня і листопада', () => {
    expect(seasonForMonth(8)).toBe('autumn');
    expect(seasonForMonth(9)).toBe('autumn');
    expect(seasonForMonth(10)).toBe('autumn');
  });
});
