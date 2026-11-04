import { useCallback, useEffect, useState } from 'react';
import { loadPlan, readPlan, savePlan, STORAGE_KEY } from '../lib/storage';
import type { Workout, WorkoutPlan } from '../types';

const isSameWorkout = (left: Workout, right: Workout) =>
  left.type === right.type && left.minutes === right.minutes && left.note === right.note;

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

  useEffect(() => {
    savePlan(plan);
  }, [plan]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;

      setPlan((current) => {
        const next = readPlan(event.newValue, now);
        return isSamePlan(current, next) ? current : next;
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [now]);

  const saveWorkout = useCallback((key: string, workout: Workout) => {
    setPlan((current) => ({
      ...current,
      [key]: {
        type: workout.type,
        minutes: workout.minutes,
        note: workout.note.trim(),
      },
    }));
  }, []);

  const removeWorkout = useCallback((key: string) => {
    setPlan((current) => {
      if (!(key in current)) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  return { plan, saveWorkout, removeWorkout };
};
