import { useMemo, useState } from 'react';
import { Check, Footprints, Sparkles } from 'lucide-react';
import ActionCard from './components/ActionCard';
import CalendarCard from './components/CalendarCard';
import Topbar from './components/Topbar';
import { useWorkoutPlan } from './hooks/useWorkoutPlan';
import { useToday } from './hooks/useToday';
import { dateKey, getCalendarDays } from './lib/dates';
import { countDoneInMonth, countInMonth, currentStreak, monthProgress } from './lib/stats';
import { seasonForMonth } from './lib/theme';
import type { Notice, Workout } from './types';

// Фіксуємо дату відкриття застосунку, щоб місяць, рік і демо-набір були узгоджені.
const appStart = new Date();

function App() {
  const [month, setMonth] = useState(() => appStart.getMonth());
  const [year, setYear] = useState(() => appStart.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>('idle');
  const { plan, saveWorkout, toggleWorkoutDone, removeWorkout } = useWorkoutPlan(appStart);
  const today = useToday();

  const days = useMemo(() => getCalendarDays(year, month), [month, year]);

  const selectedKey = selectedDay === null ? null : dateKey(year, month, selectedDay);
  const selectedWorkout = selectedKey === null ? undefined : plan[selectedKey];

  const changeMonth = (direction: number) => {
    const nextDate = new Date(year, month + direction, 1);
    setMonth(nextDate.getMonth());
    setYear(nextDate.getFullYear());
    setSelectedDay(null);
    setNotice('idle');
  };

  const selectDay = (day: number) => {
    setSelectedDay(day);
    setNotice('idle');
  };

  const saveSelectedWorkout = (workout: Workout) => {
    if (!selectedKey) return;

    const existed = selectedKey in plan;
    saveWorkout(selectedKey, workout);
    setNotice(existed ? 'updated' : 'inserted');
  };

  const removeSelectedWorkout = () => {
    if (!selectedKey) return;

    removeWorkout(selectedKey);
    setNotice('removed');
  };

  const toggleSelectedDone = () => {
    if (!selectedKey || !selectedWorkout) return;

    toggleWorkoutDone(selectedKey);
    setNotice(selectedWorkout.done ? 'undone' : 'done');
  };

  const plannedCount = countInMonth(plan, year, month);
  const doneCount = countDoneInMonth(plan, year, month);
  const streak = currentStreak(plan, today);
  const progress = monthProgress(plan, year, month);

  return (
    <main className="app-shell" data-season={seasonForMonth(month)}>
      <div className="ambient-shape ambient-shape-one" />
      <div className="ambient-shape ambient-shape-two" />

      <Topbar />

      <section className="planner-section" id="top">
        <div className="intro-block">
          <div className="eyebrow"><Sparkles size={15} /> Твій особистий ритм</div>
          <div className="headline-row">
            <div>
              <h1>Твій план<br /><em>тренувань</em></h1>
              <p>Маленькі кроки сьогодні —<br />велика сила завтра.</p>
            </div>
            <div className="shoe-illustration" aria-hidden="true"><Footprints size={62} strokeWidth={1.35} /></div>
          </div>
        </div>

        <div className="planner-grid" id="planner">
          <CalendarCard
            year={year}
            month={month}
            days={days}
            plan={plan}
            selectedDay={selectedDay}
            onChangeMonth={changeMonth}
            onSelectDay={selectDay}
          />

          <ActionCard
            selectedDay={selectedDay}
            month={month}
            workout={selectedWorkout}
            notice={notice}
            onSave={saveSelectedWorkout}
            onToggleDone={toggleSelectedDone}
            onRemove={removeSelectedWorkout}
          />
        </div>

        <div className="stats-bar" aria-label="Статистика тренувань">
          <div className="stat"><span className="stat-value">{doneCount}</span><span className="stat-label">з {plannedCount} запланованих</span></div>
          <div className="stat"><span className="stat-value">{streak}</span><span className="stat-label">серія днів</span></div>
          <div className="stat"><span className="stat-value">{progress}%</span><span className="stat-label">до цілі</span></div>
        </div>

        <div className="bottom-note" id="tips">
          <span className="note-check"><Check size={14} /></span>
          <span><strong>Порада для початку</strong> — обери 2–3 дні на тиждень, не більше.</span>
        </div>
      </section>
    </main>
  );
}

export default App;
