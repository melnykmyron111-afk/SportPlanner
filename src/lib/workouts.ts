import type { Workout, WorkoutType } from '../types';

export const workoutTypeLabels: Record<WorkoutType, string> = {
  strength: 'Силове',
  cardio: 'Кардіо',
  stretch: 'Розтяжка',
  run: 'Біг',
  other: 'Інше',
};

export const workoutTypes: WorkoutType[] = ['strength', 'cardio', 'stretch', 'run', 'other'];

export const durationOptions = [15, 30, 45, 60];

export const DEFAULT_MINUTES = 30;
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 240;
export const MAX_NOTE_LENGTH = 120;

export const defaultWorkout: Workout = {
  type: 'strength',
  minutes: DEFAULT_MINUTES,
  note: '',
  done: false,
};

export const isWorkoutType = (value: unknown): value is WorkoutType =>
  typeof value === 'string' && workoutTypes.includes(value as WorkoutType);

/**
 * Приводить довільне значення до коректного тренування.
 * Повертає `null`, якщо це не обʼєкт (такі записи відкидаються під час читання).
 * Невідомі поля замінюються безпечними значеннями, щоб старі дані не ламали застосунок.
 */
export const normalizeWorkout = (value: unknown): Workout | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;

  const candidate = value as Record<string, unknown>;

  const type = isWorkoutType(candidate.type) ? candidate.type : 'other';

  const rawMinutes =
    typeof candidate.minutes === 'number' && Number.isFinite(candidate.minutes)
      ? candidate.minutes
      : DEFAULT_MINUTES;
  const minutes = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(rawMinutes)));

  const note =
    typeof candidate.note === 'string' ? candidate.note.trim().slice(0, MAX_NOTE_LENGTH) : '';

  const done = candidate.done === true;

  return { type, minutes, note, done };
};

export const describeWorkout = (workout: Workout) =>
  `${workoutTypeLabels[workout.type]} · ${workout.minutes} хв`;
