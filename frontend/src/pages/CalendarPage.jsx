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
import { DetailGrid, Input, Select, Textarea } from '../components/common.jsx';
import { GoalSelect, RatingPicker } from '../components/habitControls.jsx';
import { TransactionRow } from '../components/charts.jsx';

function CalendarPage({
  eventForm,
  setEventForm,
  taskForm,
  setTaskForm,
  submitTask,
  events,
  tasks,
  dailyLogs,
  researchLogs,
  expenses,
  rewardRedemptions,
  goals,
  run,
}) {
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [calendarEditor, setCalendarEditor] = useState('event');
  const [visibleLayers, setVisibleLayers] = useState({
    tasks: true,
    mood: true,
    exercise: true,
    research: true,
    money: true,
    rewards: true,
    events: true,
  });
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  function dateKey(date) {
    return localDateKey(date);
  }

  function itemsFor(date) {
    const key = dateKey(date);
    const dayTasks = tasks.filter((task) => task.deadline === key);
    const dayLog = dailyLogs.find((log) => log.logDate === key);
    const dayResearch = researchLogs.filter((log) => log.logDate === key);
    const dayExpenses = expenses.filter((expense) => expense.expenseDate === key);
    const dayRewards = rewardRedemptions.filter((redemption) => redemption.redeemedDate === key);
    const dayEvents = events.filter((event) => eventOccursOn(event, key));
    return { dayTasks, dayLog, dayResearch, dayExpenses, dayRewards, dayEvents };
  }

  function moveMonth(delta) {
    setMonthCursor(new Date(year, month + delta, 1));
  }

  function toggleLayer(layer) {
    setVisibleLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  return (
    <section className="calendar-layout">
      <section className="panel calendar-panel">
        <div className="calendar-head">
          <div className="panel-heading">
            <CalendarDays size={18} />
            <h2>{monthCursor.toLocaleString('en', { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div className="row-actions">
            <button className="secondary-button" onClick={() => moveMonth(-1)}>
              Prev
            </button>
            <button className="secondary-button" onClick={() => setMonthCursor(new Date())}>
              Today
            </button>
            <button className="secondary-button" onClick={() => moveMonth(1)}>
              Next
            </button>
          </div>
        </div>
        <div className="calendar-filters">
          <LayerToggle
            checked={visibleLayers.tasks}
            onChange={() => toggleLayer('tasks')}
            label="Deadlines"
            tone="task"
          />
          <LayerToggle checked={visibleLayers.mood} onChange={() => toggleLayer('mood')} label="Mood" tone="mood" />
          <LayerToggle
            checked={visibleLayers.exercise}
            onChange={() => toggleLayer('exercise')}
            label="Exercise"
            tone="exercise"
          />
          <LayerToggle
            checked={visibleLayers.research}
            onChange={() => toggleLayer('research')}
            label="Research"
            tone="research"
          />
          <LayerToggle checked={visibleLayers.money} onChange={() => toggleLayer('money')} label="Money" tone="money" />
          <LayerToggle
            checked={visibleLayers.rewards}
            onChange={() => toggleLayer('rewards')}
            label="Rewards"
            tone="reward"
          />
          <LayerToggle
            checked={visibleLayers.events}
            onChange={() => toggleLayer('events')}
            label="Events"
            tone="event"
          />
        </div>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="month-grid">
          {cells.map((date, index) => {
            if (!date) return <div className="calendar-cell empty-cell" key={`empty-${index}`} />;
            const key = dateKey(date);
            const isToday = key === today;
            const { dayTasks, dayLog, dayResearch, dayExpenses, dayRewards, dayEvents } = itemsFor(date);
            const dayExpenseItems = dayExpenses.filter((expense) => expense.type !== 'INCOME');
            const dayIncomeItems = dayExpenses.filter((expense) => expense.type === 'INCOME');
            return (
              <article className={`calendar-cell ${isToday ? 'today-cell' : ''}`} key={key}>
                <div className="calendar-date-line">
                  <div className="date-number">{date.getDate()}</div>
                  {dayLog && visibleLayers.mood && (
                    <CalendarChip
                      tone="mood"
                      onClick={() => setSelectedDetail({ type: 'daily', item: dayLog })}
                    >
                      {moodOptions.find((mood) => mood.value === dayLog.mood)?.face ?? ':|'}
                    </CalendarChip>
                  )}
                </div>
                <div className="calendar-item-row">
                  {visibleLayers.exercise && dayLog?.exercised && (
                    <CalendarChip
                      tone="exercise"
                      onClick={() => setSelectedDetail({ type: 'daily', item: dayLog })}
                    >
                      🏃
                    </CalendarChip>
                  )}
                  {visibleLayers.money && dayExpenseItems.length > 0 && (
                    <CalendarChip
                      tone="money"
                      title={`${dayExpenseItems.length} expense record(s)`}
                      onClick={() => setSelectedDetail({ type: 'expense-group', item: dayExpenseItems })}
                    >
                      💸
                    </CalendarChip>
                  )}
                  {visibleLayers.money && dayIncomeItems.length > 0 && (
                    <CalendarChip
                      tone="money"
                      title={`${dayIncomeItems.length} income record(s)`}
                      onClick={() => setSelectedDetail({ type: 'expense-group', item: dayIncomeItems })}
                    >
                      🪙
                    </CalendarChip>
                  )}
                  {visibleLayers.rewards &&
                    dayRewards.map((redemption) => (
                      <CalendarChip
                        tone="reward"
                        key={`reward-${redemption.id}`}
                        title={`${redemption.name} · ${redemption.pointCost} pts`}
                        onClick={() => setSelectedDetail({ type: 'reward', item: redemption })}
                      >
                        {redemption.icon || '🎁'}
                      </CalendarChip>
                    ))}
                  {visibleLayers.tasks &&
                    dayTasks.map((task) => (
                      <CalendarChip
                        tone="task"
                        className={task.status === 'DONE' ? 'completed-calendar-task' : ''}
                        key={`task-${task.id}`}
                        onClick={() => setSelectedDetail({ type: 'task', item: task })}
                      >
                        DL {task.name}
                      </CalendarChip>
                    ))}
                  {visibleLayers.events &&
                    dayEvents.map((event) => (
                      <CalendarChip
                        tone="event"
                        key={`event-${event.id}`}
                        title={`${event.title}\n${formatEventRange(event)}${event.note ? `\n${event.note}` : ''}`}
                        onClick={() => setSelectedDetail({ type: 'event', item: event })}
                      >
                        {event.startTime ? `${event.startTime.slice(0, 5)} ` : ''}
                        {event.title}
                      </CalendarChip>
                    ))}
                  {visibleLayers.research &&
                    dayResearch.map((log) => (
                      <CalendarChip
                        tone="research"
                        key={`research-${log.id}`}
                        onClick={() => setSelectedDetail({ type: 'research', item: log })}
                      >
                        Research {Number(log.hours || 0)}h
                      </CalendarChip>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="calendar-side">
        <section className="panel calendar-editor-panel">
          <div className="task-section-head">
            <div className="panel-heading">
              <CalendarDays size={18} />
              <h2>Add to Calendar</h2>
            </div>
            <div className="segmented">
              <button
                type="button"
                className={calendarEditor === 'event' ? 'active' : ''}
                onClick={() => setCalendarEditor('event')}
              >
                Event
              </button>
              <button
                type="button"
                className={calendarEditor === 'task' ? 'active' : ''}
                onClick={() => setCalendarEditor('task')}
              >
                Task
              </button>
            </div>
          </div>
          {calendarEditor === 'event' ? (
            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                run(
                  () =>
                    api.gradflow.createCalendarEvent({
                      ...eventForm,
                      eventDate: eventForm.startDate,
                      endDate: eventForm.endDate || eventForm.startDate,
                      startTime: eventForm.startTime || null,
                      endTime: eventForm.endTime || null,
                    }),
                  'Event added.',
                ).then(() => setEventForm(emptyEvent));
              }}
            >
              <Input
                label="Title"
                value={eventForm.title}
                onChange={(title) => setEventForm({ ...eventForm, title })}
                placeholder="Advisor meeting"
                required
              />
              <div className="two-col">
                <Input
                  label="Start date"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(startDate) =>
                    setEventForm({ ...eventForm, startDate, endDate: eventForm.endDate || startDate })
                  }
                />
                <Input
                  label="End date"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(endDate) => setEventForm({ ...eventForm, endDate })}
                />
              </div>
              <div className="two-col">
                <Input
                  label="Start"
                  type="time"
                  value={eventForm.startTime}
                  onChange={(startTime) => setEventForm({ ...eventForm, startTime })}
                />
                <Input
                  label="End"
                  type="time"
                  value={eventForm.endTime}
                  onChange={(endTime) => setEventForm({ ...eventForm, endTime })}
                />
              </div>
              <Textarea
                label="Note"
                value={eventForm.note}
                onChange={(note) => setEventForm({ ...eventForm, note })}
                placeholder="Location, agenda, or reminder"
              />
              <button className="primary-button">
                <Plus size={16} />
                Add Event
              </button>
            </form>
          ) : (
            <form className="form-grid" onSubmit={submitTask}>
              <Input
                label="Task"
                value={taskForm.name}
                onChange={(name) => setTaskForm({ ...taskForm, name })}
                placeholder="Read two papers"
                required
              />
              <Select
                label="Category"
                value={taskForm.category}
                onChange={(category) => setTaskForm({ ...taskForm, category })}
                options={taskCategories}
              />
              <GoalSelect
                label="Link to goal"
                value={taskForm.goalId}
                onChange={(goalId) => setTaskForm({ ...taskForm, goalId })}
                goals={goals}
              />
              <div className="task-field-grid">
                <RatingPicker
                  label="Priority"
                  value={Number(taskForm.priority)}
                  onChange={(priority) => setTaskForm({ ...taskForm, priority })}
                  icon="☆"
                  activeIcon="★"
                  helper="How important is it?"
                />
                <RatingPicker
                  label="Effort"
                  value={Number(taskForm.effort)}
                  onChange={(effort) => setTaskForm({ ...taskForm, effort })}
                  icon="○"
                  activeIcon="●"
                  helper="How hard is it to start?"
                />
                <Input
                  label="Deadline"
                  type="date"
                  value={taskForm.deadline}
                  onChange={(deadline) => setTaskForm({ ...taskForm, deadline })}
                />
              </div>
              <button className="primary-button">
                <Plus size={16} />
                Add Task
              </button>
            </form>
          )}
        </section>
        <section className="panel event-detail">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Calendar Detail</h2>
          </div>
          {selectedDetail ? (
            <CalendarDetail detail={selectedDetail} run={run} clear={() => setSelectedDetail(null)} />
          ) : (
            <p className="muted">Click any calendar chip to see details.</p>
          )}
        </section>
      </section>
    </section>
  );
}

function LayerToggle({ checked, onChange, label, tone }) {
  return (
    <label className={`layer-toggle ${tone}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function CalendarChip({ tone, onClick, children, title, className = '' }) {
  return (
    <button
      type="button"
      className={`calendar-chip ${tone}-chip calendar-chip-button ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function CalendarDetail({ detail, run, clear }) {
  const { type, item } = detail;
  if (type === 'event') {
    return (
      <div className="detail-stack">
        <strong>{item.title}</strong>
        <span>Event · {formatEventRange(item)}</span>
        <p>{item.note || 'No note.'}</p>
        <button
          className="danger-button"
          onClick={() => run(() => api.gradflow.deleteCalendarEvent(item.id), 'Event deleted.').then(clear)}
        >
          <Trash2 size={16} />
          Delete Event
        </button>
      </div>
    );
  }

  if (type === 'task') {
    return (
      <div className="detail-stack">
        <strong>{item.name}</strong>
        <span>Task deadline · {formatDate(item.deadline)}</span>
        <DetailGrid
          rows={[
            ['Category', item.category || '-'],
            ['Priority', item.priority],
            ['Effort', item.effort],
            ['Status', item.status],
          ]}
        />
      </div>
    );
  }

  if (type === 'expense') {
    const isIncome = item.type === 'INCOME';
    return (
      <div className="detail-stack">
        <strong>{item.description || item.category}</strong>
        <span>
          {isIncome ? 'Income' : 'Expense'} · {formatDate(item.expenseDate)}
        </span>
        <DetailGrid
          rows={[
            ['Category', item.category],
            ['Amount', `${isIncome ? '+' : '-'}${formatMoney(item.amount)}`],
            ['Description', item.description || '-'],
          ]}
        />
      </div>
    );
  }

  if (type === 'expense-group') {
    const isIncome = item[0]?.type === 'INCOME';
    const total = item.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return (
      <div className="detail-stack">
        <strong>{isIncome ? 'Income Records' : 'Expense Records'}</strong>
        <span>
          {item.length} record(s) · {isIncome ? '+' : '-'}
          {formatMoney(total)}
        </span>
        <div className="transaction-list">
          {item.map((expense) => (
            <TransactionRow key={expense.id} expense={expense} onDelete={() => {}} compact />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'daily') {
    return (
      <div className="detail-stack">
        <strong>{formatDate(item.logDate)} Daily Check-in</strong>
        <span>
          {moodOptions.find((mood) => mood.value === item.mood)?.face ?? '😐'} mood ·{' '}
          {stressOptions.find((stress) => stress.value === item.stress)?.face ?? '🙂'} stress
        </span>
        <DetailGrid
          rows={[
            ['Sleep', `${item.sleepStart || '--:--'} to ${item.wakeTime || '--:--'} (${item.sleepHours}h)`],
            ['Water', `${item.waterMl || item.waterCups * 250 || 0} ml`],
            ['Exercise', item.exercised ? `${item.exerciseType} ${item.exerciseMinutes}m` : 'No exercise'],
          ]}
        />
        <p>{item.note || 'No journal note for this day.'}</p>
      </div>
    );
  }

  if (type === 'research') {
    return (
      <div className="detail-stack">
        <strong>{item.topic}</strong>
        <span>
          Research · {formatDate(item.logDate)} · {item.hours}h
        </span>
        <DetailGrid
          rows={[
            ['Progress', item.progress || '-'],
            ['Next step', item.nextStep || '-'],
            ['Blockers', item.blockers || '-'],
          ]}
        />
      </div>
    );
  }

  if (type === 'reward') {
    return (
      <div className="detail-stack">
        <strong>
          {item.icon || '✨'} {item.name}
        </strong>
        <span>Reward redeemed · {formatDate(item.redeemedDate)}</span>
        <DetailGrid
          rows={[
            ['Points spent', `${item.pointCost} pts`],
            ['Reward ID', item.rewardId],
          ]}
        />
      </div>
    );
  }

  return <p className="muted">No detail available.</p>;
}

export {
  CalendarPage,
  LayerToggle,
  CalendarChip,
  CalendarDetail,
};
