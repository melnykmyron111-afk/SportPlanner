import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Check, ChevronRight, CircleMinus, Pencil, Plus, RotateCcw } from 'lucide-react';
import { monthNamesGenitive } from '../lib/dates';
import {
  defaultWorkout,
  durationOptions,
  MAX_NOTE_LENGTH,
  workoutTypeLabels,
  workoutTypes,
} from '../lib/workouts';
import type { Notice, Workout } from '../types';

type ActionCardProps = {
  selectedDay: number | null;
  month: number;
  workout?: Workout;
  notice: Notice;
  onSave: (workout: Workout) => void;
  onToggleDone: () => void;
  onRemove: () => void;
};

const ActionCard = ({
  selectedDay,
  month,
  workout,
  notice,
  onSave,
  onToggleDone,
  onRemove,
}: ActionCardProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Workout>(workout ?? defaultWorkout);

  // Новий день або зміна плану з іншої вкладки — скидаємо чернетку й режим редагування.
  useEffect(() => {
    setEditing(false);
    setDraft(workout ?? defaultWorkout);
  }, [selectedDay, month, workout]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ ...draft, note: draft.note.trim() });
    setEditing(false);
  };

  const startEditing = () => {
    if (!workout) return;
    setDraft(workout);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(workout ?? defaultWorkout);
    setEditing(false);
  };

  const noticeContent =
    notice === 'inserted' ? (
      <div className="notice success"><Check size={17} /> Тренування додано</div>
    ) : notice === 'updated' ? (
      <div className="notice success"><Check size={17} /> Тренування оновлено</div>
    ) : notice === 'done' ? (
      <div className="notice success"><Check size={17} /> Тренування виконано</div>
    ) : notice === 'undone' ? (
      <div className="notice removed"><RotateCcw size={16} /> Позначку виконання знято</div>
    ) : notice === 'removed' ? (
      <div className="notice removed"><CircleMinus size={17} /> Тренування прибрано</div>
    ) : null;

  return (
    <aside className="action-card" aria-live="polite">
      <div className="action-icon"><Plus size={21} /></div>
      <span className="card-label">НОВЕ ЗАНЯТТЯ</span>
      <h2>{selectedDay ? `${selectedDay} ${monthNamesGenitive[month]}` : 'Обери свій день'}</h2>
      <p>
        {selectedDay === null
          ? 'Натисни на будь-яке число в календарі, щоб запланувати тренування.'
          : workout && !editing
            ? workout.done
              ? 'Тренування виконано — так тримати! Можна змінити деталі або прибрати його.'
              : 'Твоє тренування на цей день. Познач виконання, коли завершиш.'
            : 'Обери тип і тривалість — додай нотатку, якщо потрібно.'}
      </p>

      {selectedDay === null ? (
        <div className="hint"><CalendarDays size={17} /> Вибір дати займає секунду</div>
      ) : workout && !editing ? (
        <div className={`workout-summary ${workout.done ? 'is-done' : ''}`}>
          <div className="workout-summary-head">
            <span className={`workout-badge type-${workout.type}`}>
              <i className="chip-dot" aria-hidden="true" />
              {workoutTypeLabels[workout.type]}
            </span>
            <span className="workout-duration">{workout.minutes} хв</span>
            {workout.done && (
              <span className="done-badge"><Check size={13} /> Виконано</span>
            )}
          </div>
          {workout.note && <p className="workout-note">{workout.note}</p>}

          <div className="action-footer">
            <button
              className={workout.done ? 'remove-button done-toggle' : 'insert-button done-toggle'}
              aria-pressed={workout.done}
              onClick={onToggleDone}
            >
              {workout.done ? (
                <><RotateCcw size={16} /> Скасувати виконання</>
              ) : (
                <><Check size={17} /> Позначити виконаним</>
              )}
            </button>

            <div className="secondary-actions">
              <button className="ghost-button" onClick={startEditing}>
                <Pencil size={15} /> Редагувати
              </button>
              <button className="ghost-button danger" onClick={onRemove}>
                <CircleMinus size={15} /> Вичеркнути
              </button>
            </div>

            {noticeContent}
          </div>
        </div>
      ) : (
        <form className="workout-form" onSubmit={submit}>
          <div className="field">
            <span className="field-label" id="workout-type-label">Тип тренування</span>
            <div className="chips" role="group" aria-labelledby="workout-type-label">
              {workoutTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`type-chip type-${type} ${draft.type === type ? 'active' : ''}`}
                  aria-pressed={draft.type === type}
                  onClick={() => setDraft((current) => ({ ...current, type }))}
                >
                  <i className="chip-dot" aria-hidden="true" />
                  {workoutTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label" id="workout-duration-label">Тривалість</span>
            <div className="chips" role="group" aria-labelledby="workout-duration-label">
              {durationOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`duration-chip ${draft.minutes === minutes ? 'active' : ''}`}
                  aria-pressed={draft.minutes === minutes}
                  onClick={() => setDraft((current) => ({ ...current, minutes }))}
                >
                  {minutes} хв
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">Нотатка</span>
            <input
              className="note-input"
              type="text"
              value={draft.note}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="Наприклад, ноги + прес"
              onChange={(event) =>
                setDraft((current) => ({ ...current, note: event.target.value }))
              }
            />
          </label>

          <div className="action-footer">
            <button className="insert-button" type="submit">
              {workout ? 'Зберегти' : 'Вставити'} <ChevronRight size={18} />
            </button>
            {workout && (
              <button className="remove-button" type="button" onClick={cancelEditing}>
                Скасувати
              </button>
            )}
            {noticeContent}
          </div>
        </form>
      )}
    </aside>
  );
};

export default ActionCard;
