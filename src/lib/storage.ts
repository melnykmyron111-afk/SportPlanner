import type { Workout, WorkoutPlan } from '../types';
import { dateKey, daysInMonth, demoDayNumbers, isValidDateKey, parseLegacyDateKey } from './dates';
import { DEFAULT_MINUTES, normalizeWorkout } from './workouts';

export const STORAGE_KEY = 'sportplanner.workouts.v3';
export const LEGACY_V2_KEY = 'sportplanner.workouts.v2';
export const LEGACY_V1_KEY = 'sportplanner.workouts.v1';

// Демо-набір показує різні типи тренувань, щоб одразу було видно кольори крапок.
const DEMO_WORKOUTS: Workout[] = [
  { type: 'strength', minutes: 45, note: '', done: false },
  { type: 'cardio', minutes: 30, note: '', done: false },
  { type: 'stretch', minutes: 20, note: '', done: false },
  { type: 'run', minutes: 40, note: '', done: false },
];

// Тренування, у яке перетворюються позначки зі старих версій (там був лише факт «заплановано»).
const MIGRATED_WORKOUT: Workout = { type: 'other', minutes: DEFAULT_MINUTES, note: '', done: false };

/** Демо-набір для місяця, у якому відкрито застосунок (зайві числа коротких місяців відсікаються). */
export const createSeedPlan = (now: Date): WorkoutPlan => {
  const year = now.getFullYear();
  const month = now.getMonth();
  const limit = daysInMonth(year, month);

  const plan: WorkoutPlan = {};
  demoDayNumbers
    .filter((day) => day <= limit)
    .forEach((day, index) => {
      plan[dateKey(year, month, day)] = { ...DEMO_WORKOUTS[index % DEMO_WORKOUTS.length] };
    });

  return plan;
};

// Недоторканий демо-набір, який версії v1 і v2 зберігали для травня 2025.
// Порівнюємо вже в ISO-форматі, бо ключі v1 під час читання конвертуються.
const LEGACY_DEMO_SEED = new Set(demoDayNumbers.map((day) => dateKey(2025, 4, day)));

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parsePlan = (raw: string): WorkoutPlan | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!isPlainObject(parsed)) return null;

  const entries = Object.entries(parsed);
  const plan: WorkoutPlan = {};
  for (const [key, value] of entries) {
    if (!isValidDateKey(key)) continue;
    const workout = normalizeWorkout(value);
    if (workout) plan[key] = workout;
  }

  // Порожній обʼєкт — це свідомо очищений план. А от непорожній обʼєкт
  // без жодного валідного ключа вважаємо пошкодженим, щоб не втратити дані.
  if (entries.length > 0 && Object.keys(plan).length === 0) return null;

  return plan;
};

type KeyParser = (key: string) => string | null;

const parseKeyList = (raw: string, parseKey: KeyParser): Set<string> | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;

  const keys = new Set<string>();
  for (const item of parsed) {
    if (typeof item !== 'string') continue;
    const key = parseKey(item);
    if (key) keys.add(key);
  }

  return keys;
};

const planFromKeys = (keys: Set<string>): WorkoutPlan => {
  const plan: WorkoutPlan = {};
  for (const key of keys) plan[key] = { ...MIGRATED_WORKOUT };
  return plan;
};

const hasSameKeys = (plan: WorkoutPlan, keys: Set<string>) => {
  const planKeys = Object.keys(plan);
  return planKeys.length === keys.size && planKeys.every((key) => keys.has(key));
};

const parseIsoKey: KeyParser = (key) => (isValidDateKey(key) ? key : null);

/**
 * Читає план із localStorage, за потреби мігруючи дані з v2 (масив ISO-дат)
 * або v1 (масив ключів, де місяць — індекс з нуля).
 */
export const loadPlan = (now: Date): WorkoutPlan => {
  const seed = () => createSeedPlan(now);

  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      const parsed = parsePlan(current);
      if (parsed) return parsed;
      // Пошкоджений v3 не має губити дані: пробуємо відновитися зі старих форматів.
    }

    const legacyV2 = localStorage.getItem(LEGACY_V2_KEY);
    if (legacyV2 !== null) {
      const keys = parseKeyList(legacyV2, parseIsoKey);
      return keys ? planFromKeys(keys) : seed();
    }

    const legacyV1 = localStorage.getItem(LEGACY_V1_KEY);
    if (legacyV1 === null) return seed();

    const keys = parseKeyList(legacyV1, parseLegacyDateKey);
    if (!keys) return seed();

    // Одноразова міграція: недоторканий старий демо-набір переносимо в поточний місяць.
    const migrated = planFromKeys(keys);
    return hasSameKeys(migrated, LEGACY_DEMO_SEED) ? seed() : migrated;
  } catch {
    return seed();
  }
};

/**
 * Розбирає значення з події `storage` (інша вкладка).
 * `null` означає, що ключ видалили, — тоді перечитуємо сховище повністю.
 */
export const readPlan = (raw: string | null, now: Date): WorkoutPlan => {
  if (raw === null) return loadPlan(now);

  return parsePlan(raw) ?? loadPlan(now);
};

/** Зберігає план із відсортованими ключами та прибирає застарілі ключі v1 і v2. */
export const savePlan = (plan: WorkoutPlan): void => {
  try {
    const sorted: WorkoutPlan = {};
    for (const key of Object.keys(plan).sort()) sorted[key] = plan[key];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    localStorage.removeItem(LEGACY_V2_KEY);
    localStorage.removeItem(LEGACY_V1_KEY);
  } catch {
    // Приватний режим або переповнене сховище — застосунок продовжує працювати без збереження.
  }
};
