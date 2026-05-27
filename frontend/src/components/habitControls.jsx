import React, { useMemo, useRef, useState } from 'react';
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Flag,
  Gift,
  GraduationCap,
  Moon,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react';
import {
  buildCategoryBreakdown,
  buildFinanceTrend,
  buildPieGradient,
  defaultTodaySettings,
  emptyDaily,
  emptyEvent,
  emptyExpense,
  emptyGoal,
  emptyHabit,
  emptyResearch,
  emptyReward,
  estimateSleepHours,
  eventOccursOn,
  exerciseTypes,
  expenseCategories,
  formatDate,
  formatEventRange,
  formatMoney,
  getMoneyAdvice,
  getMoneyMeta,
  habitIcons,
  incomeCategories,
  isInMoneyDateRange,
  localDateKey,
  monthStartKey,
  moodOptions,
  rewardIcons,
  stressOptions,
  taskCategories,
  themeOptions,
  today,
  uniqueList,
} from '../appData.jsx';
import { api } from '../api.js';
import { Input, InsightNote, Metric, Select } from './common.jsx';

function HabitStatsDialog({ stats, onClose }) {
  const rate = Math.round((stats.completionRate ?? 0) * 100);
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="habit-stats-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${stats.name} habit statistics`}
      >
        <div className="overview-card-head">
          <div className="panel-heading">
            <BarChart3 size={18} />
            <h2>
              {stats.icon || '✨'} {stats.name}
            </h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        <section className="habit-stat-metrics">
          <Metric label="Current Streak" value={`${stats.currentStreak}d`} tone="green" />
          <Metric label="Best Streak" value={`${stats.bestStreak}d`} tone="purple" />
          <Metric label="This Week" value={`${stats.thisWeekCompleted}/${stats.thisWeekTotal}`} tone="blue" />
          <Metric label="14-Day Rate" value={`${rate}%`} tone="orange" />
        </section>
        <section className="habit-stat-section">
          <h3>Last 14 Days</h3>
          <div className="habit-day-grid">
            {stats.last14Days.map((day) => (
              <span
                className={day.completed ? 'completed' : ''}
                key={day.date}
                title={`${formatDate(day.date)} ${day.completed ? 'completed' : 'missed'}`}
              />
            ))}
          </div>
        </section>
        <section className="habit-stat-section">
          <h3>Weekly Trend</h3>
          <div className="habit-week-list">
            {stats.weeklyTrend.map((week) => (
              <article key={week.weekStart}>
                <span>{formatDate(week.weekStart)}</span>
                <div>
                  <b style={{ width: `${(week.completed / week.total) * 100}%` }} />
                </div>
                <strong>
                  {week.completed}/{week.total}
                </strong>
              </article>
            ))}
          </div>
        </section>
        <InsightNote text={stats.suggestion} />
      </section>
    </div>
  );
}

function DefaultHabitStatsDialog({ stats, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="habit-stats-dialog" role="dialog" aria-modal="true" aria-label={`${stats.title} statistics`}>
        <div className="overview-card-head">
          <div className="panel-heading">
            <BarChart3 size={18} />
            <h2>{stats.title}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        <section className="habit-stat-metrics">
          {stats.metrics.map(([label, value, tone]) => (
            <Metric key={label} label={label} value={value} tone={tone} />
          ))}
        </section>
        <section className="habit-stat-section">
          <h3>Last 14 Days</h3>
          <div className="habit-day-grid">
            {stats.days.map((day) => (
              <span
                className={day.completed ? 'completed' : ''}
                key={day.date}
                title={`${formatDate(day.date)} ${day.completed ? 'target reached' : 'below target'}`}
              />
            ))}
          </div>
        </section>
        <section className="habit-stat-section">
          <h3>Daily Trend</h3>
          <div className="habit-week-list default-trend-list">
            {stats.bars.map((bar) => (
              <article key={bar.label}>
                <span>{bar.label}</span>
                <div>
                  <b style={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%` }} />
                </div>
                <strong>{bar.value}</strong>
              </article>
            ))}
          </div>
        </section>
        <InsightNote text={stats.suggestion} />
      </section>
    </div>
  );
}

function WaterControl({ value, onChange }) {
  const [isPouring, setIsPouring] = useState(false);
  const pct = Math.min(100, Math.round((value / 2500) * 100));
  return (
    <section className={`water-card ${isPouring ? 'pouring' : ''}`}>
      <div>
        <strong>Water</strong>
        <span>{value} ml today</span>
      </div>
      <div className="water-bottle">
        <div className="water-fill" style={{ height: `${pct}%` }} />
      </div>
      <input
        type="range"
        min="0"
        max="3500"
        step="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onMouseDown={() => setIsPouring(true)}
        onMouseUp={() => setIsPouring(false)}
        onMouseLeave={() => setIsPouring(false)}
        onTouchStart={() => setIsPouring(true)}
        onTouchEnd={() => setIsPouring(false)}
      />
    </section>
  );
}

function ExerciseToggle({ value, onChange }) {
  return (
    <button type="button" className={`exercise-card ${value ? 'selected' : ''}`} onClick={() => onChange(!value)}>
      <Dumbbell size={22} />
      <span>{value ? 'Moved today' : 'No exercise yet'}</span>
    </button>
  );
}

function ExerciseControl({ form, setForm }) {
  return (
    <section className="exercise-panel">
      <ExerciseToggle value={form.exercised} onChange={(exercised) => setForm({ ...form, exercised })} />
      {form.exercised && (
        <div className="two-col">
          <Select
            label="Exercise"
            value={form.exerciseType}
            onChange={(exerciseType) => setForm({ ...form, exerciseType })}
            options={exerciseTypes}
          />
          <Input
            label="Minutes"
            type="number"
            min="1"
            value={form.exerciseMinutes}
            onChange={(exerciseMinutes) => setForm({ ...form, exerciseMinutes })}
          />
        </div>
      )}
    </section>
  );
}

function IconPicker({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="icon-picker">
      <span>{label}</span>
      <button
        type="button"
        className="icon-upload-trigger"
        onClick={() => setOpen(true)}
        aria-label="Choose habit icon"
      >
        {value ? <span>{value}</span> : <Plus size={22} />}
      </button>
      {open && (
        <div className="icon-popover" role="dialog" aria-label="Choose icon">
          <div className="icon-popover-card">
            <div className="icon-popover-head">
              <strong>Choose Icon</strong>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} title="Close">
                ×
              </button>
            </div>
            <div className="icon-grid">
              {options.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  className={value === icon ? 'selected' : ''}
                  onClick={() => {
                    onChange(icon);
                    setOpen(false);
                  }}
                  aria-label={`Icon ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HabitCheck({ habit, recordDate = today, run, compact = false }) {
  const checked = habit.todayCount >= habit.targetCount;
  return (
    <button
      type="button"
      className={`habit-check ${compact ? 'compact' : ''} ${checked ? 'checked' : ''}`}
      onClick={() =>
        run(
          () =>
            api.gradflow.saveHabitRecord({
              habitId: habit.id,
              recordDate,
              count: checked ? 0 : habit.targetCount,
            }),
          checked ? 'Habit unchecked.' : 'Habit checked.',
        )
      }
      title={habit.name}
    >
      <span className="habit-check-box">{checked ? <Check size={16} /> : null}</span>
      <span className="habit-check-icon">{habit.icon || '✨'}</span>
      <strong>{habit.name}</strong>
    </button>
  );
}

function RatingPicker({ label, value, onChange, icon, activeIcon, helper }) {
  return (
    <section className="rating-field">
      <span>{label}</span>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            type="button"
            key={level}
            className={level <= value ? 'active' : ''}
            onClick={() => onChange(level)}
            aria-label={`${label} ${level}`}
          >
            {level <= value ? activeIcon : icon}
          </button>
        ))}
      </div>
      {helper && <small className="field-help">{helper}</small>}
    </section>
  );
}

function goalTitle(goals, goalId) {
  if (!goalId) return 'No linked goal';
  return goals.find((goal) => Number(goal.id) === Number(goalId))?.title ?? 'Linked goal';
}

function buildDefaultHabitStats(type, dailyLogs, todaySettings) {
  const logs = [...dailyLogs].sort((a, b) => new Date(a.logDate) - new Date(b.logDate));
  const last14Dates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(`${today}T00:00:00`);
    date.setDate(date.getDate() - (13 - index));
    return localDateKey(date);
  });
  const logByDate = new Map(logs.map((log) => [log.logDate, log]));

  if (type === 'default-water') {
    const target = Number(todaySettings.defaultWaterMl || 0);
    const waterValues = last14Dates.map((date) => Number(logByDate.get(date)?.waterMl || 0));
    const achievedDays = waterValues.filter((value) => target > 0 && value >= target).length;
    const average = Math.round(waterValues.reduce((sum, value) => sum + value, 0) / waterValues.length);
    return {
      title: '💧 Water',
      metrics: [
        ['Average', `${average} ml`, 'blue'],
        ['Target Days', `${achievedDays}/14`, 'green'],
        ['Target', `${target} ml`, 'purple'],
        ['Best Day', `${Math.max(...waterValues)} ml`, 'orange'],
      ],
      days: last14Dates.map((date) => ({
        date,
        completed: target > 0 && Number(logByDate.get(date)?.waterMl || 0) >= target,
      })),
      bars: last14Dates.map((date) => ({
        label: formatDate(date),
        value: Number(logByDate.get(date)?.waterMl || 0),
        max: Math.max(target, 1),
      })),
      suggestion:
        achievedDays >= 10
          ? 'Water is steady. Keep the same default target for now.'
          : 'Try linking water to meals or study sessions so it happens without extra planning.',
    };
  }

  const exerciseLogs = last14Dates.map((date) => logByDate.get(date)).filter(Boolean);
  const activeLogs = exerciseLogs.filter((log) => log.exercised);
  const totalMinutes = activeLogs.reduce((sum, log) => sum + Number(log.exerciseMinutes || 0), 0);
  const typeCounts = activeLogs.reduce((counts, log) => {
    const key = log.exerciseType || 'Exercise';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  return {
    title: '🏃 Exercise',
    metrics: [
      ['Active Days', `${activeLogs.length}/14`, 'green'],
      ['Total Minutes', `${totalMinutes}m`, 'blue'],
      ['Avg Minutes', `${activeLogs.length ? Math.round(totalMinutes / activeLogs.length) : 0}m`, 'orange'],
      ['Top Type', favoriteType, 'purple'],
    ],
    days: last14Dates.map((date) => ({ date, completed: Boolean(logByDate.get(date)?.exercised) })),
    bars: last14Dates.map((date) => ({
      label: formatDate(date),
      value: Number(logByDate.get(date)?.exerciseMinutes || 0),
      max: Math.max(todaySettings.defaultExerciseMinutes, 1),
    })),
    suggestion:
      activeLogs.length >= 6
        ? 'Exercise is showing up often. Keep the default short enough that busy days still count.'
        : 'A small default like walking 10 minutes can make the exercise habit easier to keep alive.',
  };
}

function GoalSelect({ label, value, onChange, goals }) {
  return (
    <label>
      {label}
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">No linked goal</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function VisibilityToggle({ label, checked, onChange }) {
  return (
    <label className="visibility-row">
      <span>{label}</span>
      <button type="button" className={checked ? 'visible' : ''} onClick={() => onChange(!checked)}>
        {checked ? 'Visible' : 'Invisible'}
      </button>
    </label>
  );
}

export {
  HabitStatsDialog,
  DefaultHabitStatsDialog,
  WaterControl,
  ExerciseToggle,
  ExerciseControl,
  IconPicker,
  HabitCheck,
  RatingPicker,
  goalTitle,
  buildDefaultHabitStats,
  GoalSelect,
  VisibilityToggle,
};
