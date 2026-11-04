export type Notice = 'idle' | 'inserted' | 'updated' | 'removed';

export type WorkoutType = 'strength' | 'cardio' | 'stretch' | 'run' | 'other';

export type Workout = {
  type: WorkoutType;
  minutes: number;
  note: string;
};

/** План тренувань: ключ — ISO-дата (`YYYY-MM-DD`). */
export type WorkoutPlan = Record<string, Workout>;
