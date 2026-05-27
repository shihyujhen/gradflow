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
import { Input, Select } from '../components/common.jsx';
import { DefaultHabitStatsDialog, GoalSelect, HabitStatsDialog, IconPicker, VisibilityToggle, buildDefaultHabitStats, goalTitle } from '../components/habitControls.jsx';

function HabitsPage({ habitForm, setHabitForm, habits, dailyLogs, goals, todaySettings, setTodaySettings, run }) {
  const [habitStats, setHabitStats] = useState(null);
  const [defaultStats, setDefaultStats] = useState(null);
  const defaultHabitCards = [
    {
      id: 'default-water',
      name: 'Water',
      icon: '💧',
      visible: todaySettings.waterVisible,
      meta: `${todaySettings.defaultWaterMl} ml default`,
      toggle: () => setTodaySettings({ ...todaySettings, waterVisible: !todaySettings.waterVisible }),
      controls: (
        <Input
          label="Default ml"
          type="number"
          min="0"
          step="100"
          value={todaySettings.defaultWaterMl}
          onChange={(defaultWaterMl) => setTodaySettings({ ...todaySettings, defaultWaterMl: Number(defaultWaterMl) })}
        />
      ),
    },
    {
      id: 'default-exercise',
      name: 'Exercise',
      icon: '🏃',
      visible: todaySettings.exerciseVisible,
      meta: `${todaySettings.defaultExerciseType} ${todaySettings.defaultExerciseMinutes}m default`,
      toggle: () => setTodaySettings({ ...todaySettings, exerciseVisible: !todaySettings.exerciseVisible }),
      controls: (
        <div className="two-col">
          <Select
            label="Default exercise"
            value={todaySettings.defaultExerciseType}
            onChange={(defaultExerciseType) => setTodaySettings({ ...todaySettings, defaultExerciseType })}
            options={exerciseTypes}
          />
          <Input
            label="Minutes"
            type="number"
            min="1"
            value={todaySettings.defaultExerciseMinutes}
            onChange={(defaultExerciseMinutes) =>
              setTodaySettings({ ...todaySettings, defaultExerciseMinutes: Number(defaultExerciseMinutes) })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <section className="dashboard-grid">
      <section className="panel span-2">
        <div className="panel-heading">
          <Droplets size={18} />
          <h2>Habit Library</h2>
        </div>
        <form
          className="habit-library-form"
          onSubmit={(event) => {
            event.preventDefault();
            run(
              () =>
                api.gradflow.createHabit({
                  ...habitForm,
                  targetCount: 1,
                  unit: 'check',
                  goalId: habitForm.goalId ? Number(habitForm.goalId) : null,
                }),
              'Habit added.',
            ).then(() => setHabitForm(emptyHabit));
          }}
        >
          <IconPicker
            label="Icon"
            value={habitForm.icon}
            onChange={(icon) => setHabitForm({ ...habitForm, icon })}
            options={habitIcons}
          />
          <div className="habit-library-fields">
            <Input
              label="Habit"
              value={habitForm.name}
              onChange={(name) => setHabitForm({ ...habitForm, name })}
              placeholder="Drink water"
              required
            />
            <GoalSelect
              label="Link to goal"
              value={habitForm.goalId}
              onChange={(goalId) => setHabitForm({ ...habitForm, goalId })}
              goals={goals}
            />
            <button className="secondary-button habit-add-button">
              <Plus size={16} />
              Add Habit
            </button>
          </div>
        </form>
      </section>
      <section className="panel span-2">
        <div className="panel-heading">
          <Sparkles size={18} />
          <h2>Your Habits</h2>
        </div>
        <div className="habit-grid">
          {defaultHabitCards.map((habit) => (
            <article className={`habit-card default-habit-card ${habit.visible ? '' : 'invisible'}`} key={habit.id}>
              <div className="habit-plant">{habit.icon}</div>
              <strong>
                {habit.name} <span className="default-badge">Default</span>
              </strong>
              <span>{habit.meta}</span>
              <button
                type="button"
                className="icon-button habit-stats-button"
                onClick={() => setDefaultStats(buildDefaultHabitStats(habit.id, dailyLogs, todaySettings))}
                title={`${habit.name} statistics`}
              >
                <BarChart3 size={16} />
              </button>
              <button
                type="button"
                className={`icon-button habit-visibility-button ${habit.visible ? 'visible' : ''}`}
                onClick={habit.toggle}
                title={habit.visible ? 'Hide from Today' : 'Show on Today'}
              >
                {habit.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <div className="default-habit-controls">{habit.controls}</div>
            </article>
          ))}
          {habits.map((habit) => (
            <article className="habit-card" key={habit.id}>
              <div className="habit-plant">{habit.icon || '✨'}</div>
              <strong>{habit.name}</strong>
              <span>{goalTitle(goals, habit.goalId)}</span>
              <button
                type="button"
                className="icon-button habit-stats-button"
                onClick={() => run(() => api.gradflow.habitStats(habit.id).then(setHabitStats), 'Habit stats loaded.')}
                title="Habit statistics"
              >
                <BarChart3 size={16} />
              </button>
              <button
                className="icon-button danger habit-delete"
                onClick={() => run(() => api.gradflow.deleteHabit(habit.id), 'Habit deleted.')}
                title="Delete habit"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>
      {habitStats && <HabitStatsDialog stats={habitStats} onClose={() => setHabitStats(null)} />}
      {defaultStats && <DefaultHabitStatsDialog stats={defaultStats} onClose={() => setDefaultStats(null)} />}
    </section>
  );
}

export {
  HabitsPage,
};
