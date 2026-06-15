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
import { FacePicker, Input, LogList, Textarea } from '../components/common.jsx';
import { ExerciseControl, HabitCheck, RatingPicker, WaterControl } from '../components/habitControls.jsx';

function TodayPage({ dailyForm, setDailyForm, submitDaily, loading, dailyLogs, habits, todaySettings, run }) {
  const [recentSort, setRecentSort] = useState('updated');
  const sortedLogs = [...dailyLogs].sort((a, b) => {
    const left = recentSort === 'updated' ? a.updatedAt || `${a.logDate}T00:00:00` : `${a.logDate}T00:00:00`;
    const right = recentSort === 'updated' ? b.updatedAt || `${b.logDate}T00:00:00` : `${b.logDate}T00:00:00`;
    return new Date(right) - new Date(left);
  });

  function editDailyLog(log) {
    setDailyForm({
      logDate: log.logDate,
      sleepStart: log.sleepStart || '00:00',
      wakeTime: log.wakeTime || '07:30',
      sleepHours: log.sleepHours ?? estimateSleepHours(log.sleepStart, log.wakeTime),
      mood: log.mood || 3,
      stress: log.stress || 3,
      studyHours: log.studyHours || 0,
      waterCups: log.waterCups || Math.round((log.waterMl || 0) / 250),
      waterMl: log.waterMl || log.waterCups * 250 || 0,
      exercised: Boolean(log.exercised),
      exerciseType: log.exerciseType || 'Walk',
      exerciseMinutes: log.exerciseMinutes || 20,
      note: log.note || '',
    });
  }

  return (
    <section className="dashboard-grid">
      <form className="panel form-grid span-2" onSubmit={submitDaily}>
        <div className="panel-heading">
          <Moon size={18} />
          <h2>Daily Check-in</h2>
        </div>
        <div className="two-col">
          <Input
            label="Date"
            type="date"
            value={dailyForm.logDate}
            onChange={(logDate) => setDailyForm({ ...dailyForm, logDate })}
          />
          <Input
            label="Bedtime"
            type="time"
            value={dailyForm.sleepStart}
            onChange={(sleepStart) => setDailyForm({ ...dailyForm, sleepStart })}
          />
        </div>
        <div className="two-col">
          <Input
            label="Wake time"
            type="time"
            value={dailyForm.wakeTime}
            onChange={(wakeTime) => setDailyForm({ ...dailyForm, wakeTime })}
          />
          <label>
            Sleep estimate
            <div className="readonly-pill">
              {estimateSleepHours(dailyForm.sleepStart, dailyForm.wakeTime).toFixed(1)} hours
            </div>
          </label>
        </div>
        <FacePicker
          label="Mood"
          options={moodOptions}
          value={Number(dailyForm.mood)}
          onChange={(mood) => setDailyForm({ ...dailyForm, mood })}
        />
        <FacePicker
          label="Stress"
          options={stressOptions}
          value={Number(dailyForm.stress)}
          onChange={(stress) => setDailyForm({ ...dailyForm, stress })}
        />
        {todaySettings.waterVisible && (
          <WaterControl
            value={Number(dailyForm.waterMl)}
            onChange={(waterMl) => setDailyForm({ ...dailyForm, waterMl })}
          />
        )}
        {todaySettings.exerciseVisible && <ExerciseControl form={dailyForm} setForm={setDailyForm} />}
        <section className="picker-block">
          <span>Habits</span>
          <div className="today-habit-grid">
            {habits.length ? (
              habits.map((habit) => (
                <HabitCheck key={habit.id} habit={habit} recordDate={dailyForm.logDate} run={run} compact />
              ))
            ) : (
              <p className="muted">Add habits on the Habits page.</p>
            )}
          </div>
        </section>
        <Textarea
          label="Note"
          value={dailyForm.note}
          onChange={(note) => setDailyForm({ ...dailyForm, note })}
          placeholder="What affected your day?"
        />
        <button className="primary-button" disabled={loading}>
          <Check size={16} />
          Save Today
        </button>
      </form>
      <section className="panel">
        <div className="task-section-head">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Recent Days</h2>
          </div>
          <div className="segmented">
            <button
              type="button"
              className={recentSort === 'updated' ? 'active' : ''}
              onClick={() => setRecentSort('updated')}
            >
              Edited
            </button>
            <button
              type="button"
              className={recentSort === 'date' ? 'active' : ''}
              onClick={() => setRecentSort('date')}
            >
              Date
            </button>
          </div>
        </div>
        <div className="list-stack">
          {sortedLogs.slice(0, 8).map((log) => (
            <article className="mini-row daily-log-row" key={log.id} onClick={() => editDailyLog(log)}>
              <div>
                <strong>{formatDate(log.logDate)}</strong>
                <span>
                  {moodOptions.find((m) => m.value === log.mood)?.face ?? ':|'}{' '}
                  {`${log.sleepStart || '--:--'} -> ${log.wakeTime || '--:--'}`} ({log.sleepHours}h), water{' '}
                  {log.waterMl || log.waterCups * 250 || 0} ml{' '}
                  {log.exercised ? `, ${log.exerciseType} ${log.exerciseMinutes}m` : ''}
                </span>
              </div>
              <button
                className="icon-button danger"
                onClick={(event) => {
                  event.stopPropagation();
                  run(() => api.gradflow.deleteDailyLog(log.id), 'Daily log deleted.');
                }}
                title="Delete daily log"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
          {!dailyLogs.length && <p className="muted">No records yet.</p>}
        </div>
      </section>
    </section>
  );
}

export {
  TodayPage,
};
