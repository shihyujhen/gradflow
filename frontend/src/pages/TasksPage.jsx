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
import { Input, TaskTable } from '../components/common.jsx';

function TasksPage({
  top,
  setTop,
  run,
  tasks,
  archivedTasks,
  suggestions,
  setSuggestions,
  doneTasks,
  taskView,
  setTaskView,
}) {
  const [recentlyDoneIds, setRecentlyDoneIds] = useState([]);
  const activeTasks = tasks.filter((task) => task.status !== 'DONE' || recentlyDoneIds.includes(task.id));

  async function markDoneWithPause(id) {
    await run(() => api.markDone(id), 'Task marked done.');
    setRecentlyDoneIds((current) => [...new Set([...current, id])]);
    window.setTimeout(() => {
      setRecentlyDoneIds((current) => current.filter((taskId) => taskId !== id));
    }, 5000);
  }

  return (
    <>
      <section className="panel task-section">
        <div className="panel-heading">
          <Sparkles size={18} />
          <h2>Recommendation</h2>
        </div>
        <div className="inline-controls">
          <Input label="Top N" type="number" min="1" max="10" value={top} onChange={setTop} />
          <button
            type="button"
            className="secondary-button"
            onClick={() => run(() => api.suggestions(Number(top)).then(setSuggestions), 'Suggestions updated.')}
          >
            Rank
          </button>
        </div>
        <div className="suggestion-list">
          {suggestions.length ? (
            suggestions.map((item, index) => (
              <article className="suggestion-item" key={item.task.id}>
                <div className="rank">{index + 1}</div>
                <div>
                  <strong>{item.task.name}</strong>
                  <span>{item.reason}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No pending tasks available.</p>
          )}
        </div>
      </section>
      <section className="panel task-section">
        <div className="task-section-head">
          <div className="panel-heading">
            <GraduationCap size={18} />
            <h2>Task Workspace</h2>
          </div>
          <div className="segmented">
            <button className={taskView === 'active' ? 'active' : ''} onClick={() => setTaskView('active')}>
              Active
            </button>
            <button className={taskView === 'completed' ? 'active' : ''} onClick={() => setTaskView('completed')}>
              Completed
            </button>
            <button className={taskView === 'archived' ? 'active' : ''} onClick={() => setTaskView('archived')}>
              Archived
            </button>
          </div>
        </div>
        {taskView === 'active' ? (
          <>
            <TaskTable
              tasks={activeTasks}
              onDone={markDoneWithPause}
              onDelete={(id) => run(() => api.deleteTask(id), 'Task deleted.')}
            />
            <div className="table-actions">
              <button className="secondary-button" onClick={() => run(api.archive)} disabled={doneTasks.length === 0}>
                <Archive size={16} />
                Archive Done
              </button>
              <button
                className="danger-button"
                onClick={() => run(api.reset, 'Active tasks cleared.')}
                disabled={tasks.length === 0}
              >
                <Trash2 size={16} />
                Reset Active
              </button>
            </div>
          </>
        ) : taskView === 'completed' ? (
          <>
            <TaskTable tasks={doneTasks} onDelete={(id) => run(() => api.deleteTask(id), 'Task deleted.')} completed />
            <div className="table-actions">
              <button className="secondary-button" onClick={() => run(api.archive)} disabled={doneTasks.length === 0}>
                <Archive size={16} />
                Archive Done
              </button>
            </div>
          </>
        ) : (
          <TaskTable tasks={archivedTasks} archived />
        )}
      </section>
    </>
  );
}

export {
  TasksPage,
};
