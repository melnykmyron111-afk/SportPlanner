export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

/**
 * Пора року за індексом місяця (0–11, як у `Date`).
 * Використовується для сезонного акценту інтерфейсу.
 */
export const seasonForMonth = (month: number): Season => {
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
};
