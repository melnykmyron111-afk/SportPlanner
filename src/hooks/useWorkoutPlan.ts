import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPlan, readPlan, savePlan, STORAGE_KEY } from '../lib/storage';
import { normalizeWorkout } from '../lib/workouts';
import type { Workout, WorkoutPlan } from '../types';

const isSameWorkout = (left: Workout, right: Workout) =>
  left.type === right.type &&
  left.minutes === right.minutes &&
  left.note === right.note &&
  left.done === right.done;

const isSamePlan = (left: WorkoutPlan, right: WorkoutPlan) => {
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== Object.keys(right).length) return false;

  return leftKeys.every((key) => {
    const rightWorkout = right[key];
    return rightWorkout !== undefined && isSameWorkout(left[key], rightWorkout);
  });
};

/**
 * Тримає план тренувань, зберігає його в localStorage
 * і синхронізує зміни між відкритими вкладками через подію `storage`.
 */
export const useWorkoutPlan = (now: Date) => {
  const [plan, setPlan] = useState<WorkoutPlan>(() => loadPlan(now));
  const initialPlan = useRef(plan);

  useEffect(() => {
    // Не перезаписуємо сховище одразу після відкриття: інакше можна
    // затерти свіжіші зміни, які інша вкладка зробила під час завантаження.
    if (plan === initialPlan.current) return;

    savePlan(plan);
  }, [plan]);

  useEffect(() => {
    const sync = (raw: string | null) => {
      setPlan((current) => {
        const next = readPlan(raw, now);
        return isSamePlan(current, next) ? current : next;
      });
    };

    // Наздоганяємо зміни, які інша вкладка могла зробити до підписки.
    try {
      sync(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Сховище недоступне — працюємо з поточним станом у памʼяті.
    }

    const handleStorage = (event: StorageEvent) => {
      // `key === null` — у іншій вкладці очистили все сховище.
      if (event.key !== null && event.key !== STORAGE_KEY) return;

      sync(event.newValue);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [now]);

  const saveWorkout = useCallback((key: string, workout: Workout) => {
    const normalized = normalizeWorkout(workout);
    if (!normalized) return;

    setPlan((current) => ({
      ...current,
      [key]: normalized,
    }));
  }, []);

  const toggleWorkoutDone = useCallback((key: string) => {
    setPlan((current) => {
      const workout = current[key];
      if (!workout) return current;

      return {
        ...current,
        [key]: { ...workout, done: !workout.done },
      };
    });
  }, []);

  const removeWorkout = useCallback((key: string) => {
    setPlan((current) => {
      if (!(key in current)) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  return { plan, saveWorkout, toggleWorkoutDone, removeWorkout };
};
