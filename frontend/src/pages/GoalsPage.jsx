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
import { CategoryDialog, Input, QuickForm } from '../components/common.jsx';

function GoalsPage({ goalForm, setGoalForm, goalCategories, setGoalCategories, goals, run }) {
  const [newCategory, setNewCategory] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  function addGoalCategory() {
    const category = newCategory.trim();
    if (!category) return false;
    const nextCategories = uniqueList([...goalCategories, category]);
    setGoalCategories(nextCategories);
    localStorage.setItem('gradflow.goalCategories', JSON.stringify(nextCategories));
    setGoalForm({ ...goalForm, category });
    setNewCategory('');
    setCategoryDialogOpen(false);
    return true;
  }

  return (
    <section className="dashboard-grid">
      <QuickForm
        icon={<Flag size={18} />}
        title="Goal"
        button="Add Goal"
        onSubmit={() =>
          run(
            () =>
              api.gradflow.createGoal({
                ...goalForm,
                progress: Number(goalForm.progress),
                targetDate: goalForm.targetDate || null,
              }),
            'Goal added.',
          ).then(() => setGoalForm(emptyGoal))
        }
      >
        <Input
          label="Title"
          value={goalForm.title}
          onChange={(title) => setGoalForm({ ...goalForm, title })}
          placeholder="Submit thesis proposal"
          required
        />
        <label>
          Category
          <select
            value={goalForm.category}
            onChange={(event) => {
              if (event.target.value === '__add_goal_category__') {
                setCategoryDialogOpen(true);
                return;
              }
              setGoalForm({ ...goalForm, category: event.target.value });
            }}
          >
            {goalCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="__add_goal_category__">+ Add category...</option>
          </select>
        </label>
        <Input
          label="Target date"
          type="date"
          value={goalForm.targetDate}
          onChange={(targetDate) => setGoalForm({ ...goalForm, targetDate })}
        />
        <Input
          label="Progress"
          type="number"
          min="0"
          max="100"
          value={goalForm.progress}
          onChange={(progress) => setGoalForm({ ...goalForm, progress })}
        />
      </QuickForm>
      {categoryDialogOpen && (
        <CategoryDialog
          value={newCategory}
          onChange={setNewCategory}
          onCancel={() => {
            setCategoryDialogOpen(false);
            setNewCategory('');
          }}
          onConfirm={addGoalCategory}
        />
      )}
      <section className="panel span-2">
        <div className="panel-heading">
          <Flag size={18} />
          <h2>Goal Board</h2>
        </div>
        <div className="goal-board-list">
          {goals.map((goal) => (
            <article className="goal-board-card" key={goal.id}>
              <div>
                <strong>{goal.title}</strong>
                <span>
                  {goal.category} {goal.targetDate ? `· by ${formatDate(goal.targetDate)}` : ''}
                </span>
                <small>
                  {goal.autoProgress
                    ? `${goal.doneTasks}/${goal.linkedTasks} tasks · ${goal.linkedHabits} habits linked`
                    : 'Manual progress'}
                </small>
              </div>
              <div className="goal-progress-wrap">
                <b>{goal.progress}%</b>
                <div className="goal-progress-track">
                  <span style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
              <button
                className="icon-button danger goal-delete"
                onClick={() => run(() => api.gradflow.deleteGoal(goal.id), 'Goal deleted.')}
                title="Delete goal"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
          {!goals.length && <p className="empty">No goals yet.</p>}
        </div>
      </section>
    </section>
  );
}

export {
  GoalsPage,
};
