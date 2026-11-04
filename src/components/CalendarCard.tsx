import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, monthNames, monthNamesGenitive, weekdays } from '../lib/dates';
import { workoutTypeLabels } from '../lib/workouts';
import type { WorkoutPlan } from '../types';

type CalendarCardProps = {
  year: number;
  month: number;
  days: Array<number | null>;
  plan: WorkoutPlan;
  selectedDay: number | null;
  onChangeMonth: (direction: number) => void;
  onSelectDay: (day: number) => void;
};

const CalendarCard = ({
  year,
  month,
  days,
  plan,
  selectedDay,
  onChangeMonth,
  onSelectDay,
}: CalendarCardProps) => (
  <div className="calendar-card">
    <div className="calendar-card-header">
      <div>
        <span className="card-label">КАЛЕНДАР</span>
        <h2>{monthNames[month]} <span>{year}</span></h2>
      </div>
      <div className="month-controls">
        <button onClick={() => onChangeMonth(-1)} aria-label="Попередній місяць"><ChevronLeft size={20} /></button>
        <button onClick={() => onChangeMonth(1)} aria-label="Наступний місяць"><ChevronRight size={20} /></button>
      </div>
    </div>

    <div className="weekdays">
      {weekdays.map((day) => <span key={day}>{day}</span>)}
    </div>
    <div className="calendar-grid">
      {days.map((day, index) => {
        const workout = day ? plan[dateKey(year, month, day)] : undefined;

        return day ? (
          <button
            className={`day ${workout ? 'planned' : ''} ${selectedDay === day ? 'selected' : ''}`}
            key={`${year}-${month}-${day}`}
            onClick={() => onSelectDay(day)}
            aria-label={
              workout
                ? `${day} ${monthNamesGenitive[month]} — ${workoutTypeLabels[workout.type]}, ${workout.minutes} хв`
                : `${day} ${monthNamesGenitive[month]}`
            }
            aria-pressed={selectedDay === day}
          >
            {day}
            {workout && <span className={`day-dot type-${workout.type}`} />}
          </button>
        ) : <span className="day empty" key={`empty-${index}`} />;
      })}
    </div>

    <div className="calendar-legend">
      <span><i className="legend-dot planned-dot" /> Заплановано</span>
      <span><i className="legend-dot selected-dot" /> Обрано</span>
    </div>
  </div>
);

export default CalendarCard;
