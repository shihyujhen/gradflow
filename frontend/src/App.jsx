import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Flag,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ListChecks,
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
import { api } from './api.js';

const today = new Date().toISOString().slice(0, 10);

const emptyTask = { name: '', category: 'Research', priority: 3, effort: 2, deadline: '', goalId: '' };
const emptyDaily = {
  logDate: today,
  sleepStart: '00:00',
  wakeTime: '07:30',
  sleepHours: 7.5,
  mood: 3,
  stress: 3,
  studyHours: 0,
  waterCups: 8,
  waterMl: 2000,
  exercised: false,
  exerciseType: 'Walk',
  exerciseMinutes: 20,
  note: '',
};
const emptyHabit = { name: '', targetCount: 1, unit: 'check', icon: '💧', goalId: '' };
const emptyReward = { name: '', icon: '🍜', pointCost: 10 };
const emptyExpense = { expenseDate: today, category: 'Food', type: 'EXPENSE', amount: '', description: '' };
const emptyResearch = { logDate: today, topic: '', progress: '', blockers: '', nextStep: '', hours: 1 };
const emptyGoal = { title: '', category: 'Research', targetDate: '', progress: 0, completed: false };
const emptyEvent = {
  title: '',
  startDate: today,
  endDate: today,
  startTime: '',
  endTime: '',
  category: 'Study',
  note: '',
};

const taskCategories = ['Research', 'Course', 'Homework', 'Meeting', 'Admin', 'Health', 'Life'];
const defaultGoalCategories = ['Research', 'Course', 'Career', 'Health', 'Money', 'Life', 'Skill'];
const expenseCategories = [
  'Food',
  'Rent',
  'Transport',
  'Coffee',
  'Shopping',
  'Books',
  'Research',
  'Health',
  'Fun',
  'Other',
];
const incomeCategories = ['Scholarship', 'Salary', 'Family', 'Part-time', 'Reward', 'Other'];
const moneyMeta = {
  Food: { icon: '🍱', color: 'peach', hex: '#c8a48d' },
  Rent: { icon: '🏠', color: 'blue', hex: '#8fa4af' },
  Transport: { icon: '🚌', color: 'green', hex: '#8aa394' },
  Coffee: { icon: '☕', color: 'brown', hex: '#a58b75' },
  Shopping: { icon: '🛍️', color: 'pink', hex: '#b9959c' },
  Books: { icon: '📚', color: 'purple', hex: '#a39ab5' },
  Research: { icon: '🔬', color: 'yellow', hex: '#c9ba91' },
  Health: { icon: '💊', color: 'green', hex: '#9db8a5' },
  Fun: { icon: '🎮', color: 'pink', hex: '#c6a2a9' },
  Scholarship: { icon: '🎓', color: 'green', hex: '#91aa8b' },
  Salary: { icon: '💼', color: 'blue', hex: '#879baa' },
  Family: { icon: '🏡', color: 'peach', hex: '#cdb18f' },
  'Part-time': { icon: '🧾', color: 'yellow', hex: '#d1c09d' },
  Reward: { icon: '🎁', color: 'purple', hex: '#ad9bb8' },
  Other: { icon: '✨', color: 'gray', hex: '#a9ada7' },
};
const exerciseTypes = ['Walk', 'Run', 'Yoga', 'Gym', 'Bike', 'Stretching', 'Dance'];
const habitIcons = ['💧', '📚', '🏃', '🧘', '🥗', '☀️', '🌙', '📝', '🎧', '🧹', '💊', '✨'];
const rewardIcons = ['🍜', '🍰', '🧋', '🎬', '🎮', '📦', '🛍️', '☕', '🎧', '💐', '🧸', '✨'];
const defaultTodaySettings = {
  waterVisible: true,
  exerciseVisible: true,
  defaultWaterMl: 2000,
  defaultExerciseType: 'Walk',
  defaultExerciseMinutes: 20,
};
const themeOptions = [
  { id: 'green', label: 'Sage', color: '#7f958b' },
  { id: 'pink', label: 'Rose', color: '#b58b92' },
  { id: 'blue', label: 'Mist', color: '#7f96a6' },
  { id: 'purple', label: 'Mauve', color: '#9a8fa8' },
  { id: 'gray', label: 'Stone', color: '#858985' },
  { id: 'orange', label: 'Clay', color: '#b79a82' },
];

const moodOptions = [
  { value: 1, face: '😭', label: 'Drained' },
  { value: 2, face: '😕', label: 'Low' },
  { value: 3, face: '😐', label: 'Okay' },
  { value: 4, face: '😊', label: 'Good' },
  { value: 5, face: '🤩', label: 'Bright' },
];

const stressOptions = [
  { value: 1, face: '😌', label: 'Calm' },
  { value: 2, face: '🙂', label: 'Light' },
  { value: 3, face: '😵‍💫', label: 'Busy' },
  { value: 4, face: '😰', label: 'Tense' },
  { value: 5, face: '🤯', label: 'Overloaded' },
];
const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: Moon },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'habits', label: 'Habits', icon: Droplets },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'finance', label: 'Money', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Flag },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(
    value ?? 0,
  );
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function eventStartDate(event) {
  return event.startDate || event.eventDate;
}

function eventEndDate(event) {
  return event.endDate || event.startDate || event.eventDate;
}

function eventOccursOn(event, dateString) {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  return start <= dateString && dateString <= end;
}

function formatEventRange(event) {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  const datePart = start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`;
  const timePart = event.startTime
    ? `${event.startTime.slice(0, 5)}${event.endTime ? `-${event.endTime.slice(0, 5)}` : ''}`
    : '';
  return `${datePart}${timePart ? ` ${timePart}` : ''}`;
}

function estimateSleepHours(start, end) {
  if (!start || !end) return 0;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

function getMoneyMeta(category) {
  return moneyMeta[category] ?? moneyMeta.Other;
}

function buildCategoryBreakdown(transactions, mode = 'expense') {
  const scopedTransactions = transactions.filter((expense) => {
    if (mode === 'income') return expense.type === 'INCOME';
    if (mode === 'both') return true;
    return expense.type !== 'INCOME';
  });
  const totals = scopedTransactions.reduce((acc, expense) => {
      const type = expense.type === 'INCOME' ? 'income' : 'expense';
      const key = mode === 'both' ? `${type}:${expense.category}` : expense.category;
      acc[key] = acc[key] || { category: expense.category, type, amount: 0 };
      acc[key].amount += Number(expense.amount || 0);
      return acc;
    }, {});
  return Object.values(totals)
    .map((item, index) => ({
      ...item,
      meta:
        mode === 'both'
          ? {
              ...getMoneyMeta(item.category),
              hex: item.type === 'income' ? '#8fa987' : '#b98d8b',
            }
          : getMoneyMeta(item.category),
      key: `${item.type}-${item.category}-${index}`,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildPieGradient(items) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (!total) return '#edf2ef';
  let cursor = 0;
  const slices = items.map((item) => {
    const start = cursor;
    cursor += (item.amount / total) * 100;
    return `${item.meta.hex} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${slices.join(', ')})`;
}

function isInMoneyDateRange(dateString, start, end) {
  const date = new Date(`${dateString}T00:00:00`);
  const startDate = start ? new Date(`${start}T00:00:00`) : null;
  const endDate = end ? new Date(`${end}T23:59:59`) : null;
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
}

function monthStartKey() {
  const date = new Date();
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

function buildFinanceTrend(transactions, start, end) {
  const sorted = [...transactions].sort((a, b) => a.expenseDate.localeCompare(b.expenseDate));
  if (!sorted.length) return [];
  const firstDate = start || sorted[0].expenseDate;
  const lastDate = end || sorted[sorted.length - 1].expenseDate;
  const points = [];
  for (let cursor = new Date(`${firstDate}T00:00:00`); cursor <= new Date(`${lastDate}T00:00:00`); cursor.setDate(cursor.getDate() + 1)) {
    const key = localDateKey(cursor);
    const dayItems = sorted.filter((item) => item.expenseDate === key);
    points.push({
      date: key,
      income: dayItems.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + Number(item.amount || 0), 0),
      expense: dayItems.filter((item) => item.type !== 'INCOME').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    });
  }
  return points;
}

function getMoneyAdvice(income, spending, net) {
  if (income === 0 && spending === 0)
    return 'Start with one income or expense record, then this page can give a cleaner pattern.';
  if (income === 0)
    return 'No income recorded in this period yet. Add scholarship, salary, or part-time money so the net number makes sense.';
  if (net >= income * 0.25)
    return 'Nice buffer. You are keeping more than 25% of this period income, so this is a good time to move some money toward goals.';
  if (net >= 0)
    return 'You are positive, but the margin is thin. Watch repeat categories like coffee, shopping, and transport.';
  return 'This period is negative. Pick one flexible category to cap for the next few days and record income when it arrives.';
}

function uniqueList(items) {
  return [
    ...new Set(
      items
        .filter(Boolean)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function readTodaySettings() {
  try {
    return { ...defaultTodaySettings, ...JSON.parse(localStorage.getItem('gradflow.todaySettings') ?? '{}') };
  } catch {
    return defaultTodaySettings;
  }
}

function readProfileSettings() {
  try {
    return {
      displayName: 'Graduate Student',
      avatar: '',
      darkMode: false,
      theme: 'green',
      passwordUpdatedAt: '',
      ...JSON.parse(localStorage.getItem('gradflow.profileSettings') ?? '{}'),
    };
  } catch {
    return { displayName: 'Graduate Student', avatar: '', darkMode: false, theme: 'green', passwordUpdatedAt: '' };
  }
}

function readAuthSession() {
  try {
    return JSON.parse(localStorage.getItem('gradflow.authSession') ?? 'null');
  } catch {
    return null;
  }
}

function readAuthAccounts() {
  const demoAccount = {
    email: 'demo@gradflow.local',
    password: 'demo1234',
    createdAt: 'seed',
  };
  try {
    const accounts = JSON.parse(localStorage.getItem('gradflow.authAccounts') ?? '[]');
    if (accounts.some((account) => account.email === demoAccount.email)) {
      return accounts;
    }
    const nextAccounts = [demoAccount, ...accounts];
    localStorage.setItem('gradflow.authAccounts', JSON.stringify(nextAccounts));
    return nextAccounts;
  } catch {
    return [demoAccount];
  }
}

function App() {
  const [authSession, setAuthSession] = useState(readAuthSession);
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [habits, setHabits] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [rewardSummary, setRewardSummary] = useState({
    earnedPoints: 0,
    redeemedPoints: 0,
    currentPoints: 0,
    redemptions: [],
  });
  const [expenses, setExpenses] = useState([]);
  const [researchLogs, setResearchLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);

  const [taskForm, setTaskForm] = useState(emptyTask);
  const [todaySettings, setTodaySettings] = useState(readTodaySettings);
  const [profileSettings, setProfileSettings] = useState(readProfileSettings);
  const [dailyForm, setDailyForm] = useState(() => ({
    ...emptyDaily,
    waterMl: Number(readTodaySettings().defaultWaterMl),
    waterCups: Math.round(Number(readTodaySettings().defaultWaterMl) / 250),
    exercised: false,
    exerciseType: readTodaySettings().defaultExerciseType,
    exerciseMinutes: Number(readTodaySettings().defaultExerciseMinutes),
  }));
  const [habitForm, setHabitForm] = useState(emptyHabit);
  const [rewardForm, setRewardForm] = useState(emptyReward);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [researchForm, setResearchForm] = useState(emptyResearch);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [goalCategories, setGoalCategories] = useState(() => {
    try {
      return uniqueList([
        ...defaultGoalCategories,
        ...JSON.parse(localStorage.getItem('gradflow.goalCategories') ?? '[]'),
      ]);
    } catch {
      return defaultGoalCategories;
    }
  });
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [top, setTop] = useState(3);
  const [taskView, setTaskView] = useState('active');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingDailyUpdate, setPendingDailyUpdate] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const doneTasks = useMemo(() => tasks.filter((task) => task.status === 'DONE'), [tasks]);
  const activeNav = navItems.find((item) => item.id === activePage);

  async function loadAll() {
    const [
      nextTasks,
      nextArchived,
      nextStats,
      nextSuggestions,
      nextAnalytics,
      nextDailyLogs,
      nextHabits,
      nextRewards,
      nextRewardSummary,
      nextExpenses,
      nextResearchLogs,
      nextGoals,
      nextEvents,
    ] = await Promise.all([
      api.listTasks(),
      api.listArchived(),
      api.stats(),
      api.suggestions(top),
      api.gradflow.analytics(),
      api.gradflow.dailyLogs(),
      api.gradflow.habits(),
      api.gradflow.rewards(),
      api.gradflow.rewardSummary(),
      api.gradflow.expenses(),
      api.gradflow.researchLogs(),
      api.gradflow.goals(),
      api.gradflow.calendarEvents(),
    ]);

    setTasks(nextTasks);
    setArchivedTasks(nextArchived);
    setStats(nextStats);
    setSuggestions(nextSuggestions);
    setAnalytics(nextAnalytics);
    setDailyLogs(nextDailyLogs);
    setHabits(nextHabits);
    setRewards(nextRewards);
    setRewardSummary(nextRewardSummary);
    setExpenses(nextExpenses);
    setResearchLogs(nextResearchLogs);
    setGoals(nextGoals);
    setEvents(nextEvents);
  }

  async function run(action, successMessage) {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      await loadAll();
      setMessage(successMessage ?? result?.message ?? 'Saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.setGuestMode(authSession?.mode === 'guest');
    api.setCurrentUser(authSession?.email);
    if (authSession) run(loadAll, '');
  }, [authSession?.mode, authSession?.email]);

  useEffect(() => {
    if (!message && !error) return undefined;
    const timer = window.setTimeout(() => {
      setMessage('');
      setError('');
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [message, error]);

  useEffect(() => {
    const merged = uniqueList([...goalCategories, ...goals.map((goal) => goal.category)]);
    if (merged.length !== goalCategories.length) {
      setGoalCategories(merged);
    }
    localStorage.setItem('gradflow.goalCategories', JSON.stringify(merged));
  }, [goals, goalCategories]);

  useEffect(() => {
    localStorage.setItem('gradflow.todaySettings', JSON.stringify(todaySettings));
  }, [todaySettings]);

  function startSession(session) {
    setAuthSession(session);
    if (session.mode !== 'guest') {
      localStorage.setItem('gradflow.authSession', JSON.stringify(session));
      setProfileSettings((settings) => ({
        ...settings,
        displayName:
          settings.displayName === 'Graduate Student' ? session.email.split('@')[0] || settings.displayName : settings.displayName,
      }));
    } else {
      localStorage.removeItem('gradflow.authSession');
    }
  }

  function logout() {
    localStorage.removeItem('gradflow.authSession');
    setAuthSession(null);
  }

  async function submitDaily(event) {
    event.preventDefault();
    let payload = {
      ...dailyForm,
      sleepHours: estimateSleepHours(dailyForm.sleepStart, dailyForm.wakeTime),
      mood: Number(dailyForm.mood),
      stress: Number(dailyForm.stress),
      studyHours: Number(dailyForm.studyHours),
      waterMl: Number(dailyForm.waterMl),
      waterCups: Math.round(Number(dailyForm.waterMl) / 250),
      exercised: Boolean(dailyForm.exercised),
      exerciseType: dailyForm.exercised ? dailyForm.exerciseType : '',
      exerciseMinutes: dailyForm.exercised ? Number(dailyForm.exerciseMinutes) : 0,
    };

    const existingLog = dailyLogs.find((log) => log.logDate === payload.logDate);
    if (existingLog) {
      payload = {
        ...payload,
        waterMl: todaySettings.waterVisible ? payload.waterMl : existingLog.waterMl,
        waterCups: todaySettings.waterVisible ? payload.waterCups : existingLog.waterCups,
        exercised: todaySettings.exerciseVisible ? payload.exercised : existingLog.exercised,
        exerciseType: todaySettings.exerciseVisible ? payload.exerciseType : existingLog.exerciseType,
        exerciseMinutes: todaySettings.exerciseVisible ? payload.exerciseMinutes : existingLog.exerciseMinutes,
      };
    }
    if (existingLog) {
      setPendingDailyUpdate(payload);
      return;
    }

    await saveDailyPayload(payload, 'Daily check-in saved.');
  }

  async function saveDailyPayload(payload, successMessage) {
    await run(() => api.gradflow.saveDailyLog(payload), successMessage);
  }

  async function submitTask(event) {
    event.preventDefault();
    await run(
      () =>
        api.createTask({
          ...taskForm,
          priority: Number(taskForm.priority),
          effort: Number(taskForm.effort),
          deadline: taskForm.deadline || null,
          goalId: taskForm.goalId ? Number(taskForm.goalId) : null,
        }),
      'Task added.',
    );
    setTaskForm(emptyTask);
  }

  if (!authSession) {
    return <AuthPage onAuth={startSession} />;
  }

  const page = {
    overview: (
      <Overview
        analytics={analytics}
        dailyLogs={dailyLogs}
        habits={habits}
        goals={goals}
        tasks={tasks}
        events={events}
        todaySettings={todaySettings}
        setActivePage={setActivePage}
        run={run}
      />
    ),
    today: (
      <TodayPage
        dailyForm={dailyForm}
        setDailyForm={setDailyForm}
        submitDaily={submitDaily}
        loading={loading}
        dailyLogs={dailyLogs}
        habits={habits}
        todaySettings={todaySettings}
        run={run}
      />
    ),
    tasks: (
      <TasksPage
        top={top}
        setTop={setTop}
        run={run}
        tasks={tasks}
        archivedTasks={archivedTasks}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        doneTasks={doneTasks}
        taskView={taskView}
        setTaskView={setTaskView}
      />
    ),
    research: (
      <ResearchPage
        researchForm={researchForm}
        setResearchForm={setResearchForm}
        researchLogs={researchLogs}
        run={run}
      />
    ),
    habits: (
      <HabitsPage
        habitForm={habitForm}
        setHabitForm={setHabitForm}
        habits={habits}
        dailyLogs={dailyLogs}
        goals={goals}
        todaySettings={todaySettings}
        setTodaySettings={setTodaySettings}
        run={run}
      />
    ),
    rewards: (
      <RewardsPage
        rewardForm={rewardForm}
        setRewardForm={setRewardForm}
        rewards={rewards}
        rewardSummary={rewardSummary}
        run={run}
      />
    ),
    finance: (
      <FinancePage
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        expenses={expenses}
        run={run}
      />
    ),
    goals: (
      <GoalsPage
        goalForm={goalForm}
        setGoalForm={setGoalForm}
        goalCategories={goalCategories}
        setGoalCategories={setGoalCategories}
        goals={goals}
        run={run}
      />
    ),
    calendar: (
      <CalendarPage
        eventForm={eventForm}
        setEventForm={setEventForm}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        submitTask={submitTask}
        events={events}
        tasks={tasks}
        dailyLogs={dailyLogs}
        researchLogs={researchLogs}
        expenses={expenses}
        rewardRedemptions={rewardSummary.redemptions ?? []}
        goals={goals}
        run={run}
      />
    ),
  }[activePage];

  return (
    <div
      className={`app-frame ${sidebarOpen ? '' : 'sidebar-collapsed'} theme-${profileSettings.theme || 'green'} ${profileSettings.darkMode ? 'dark-mode' : ''}`}
    >
      <aside className="sidebar">
        <button
          className="brand-row brand-settings-button"
          type="button"
          onClick={() => setSettingsOpen(true)}
          title="Open profile settings"
        >
          <span
            className="brand-mark brand-avatar-upload"
            title="Open profile settings"
          >
            {profileSettings.avatar ? <img src={profileSettings.avatar} alt="" /> : 'GF'}
          </span>
          {sidebarOpen && (
            <div>
              <strong>{profileSettings.displayName || 'GradFlow'}</strong>
              <span>{authSession.mode === 'guest' ? 'Guest mode' : authSession.email}</span>
            </div>
          )}
        </button>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activePage === item.id ? 'active' : ''}
                onClick={() => setActivePage(item.id)}
                title={item.label}
              >
                <Icon size={19} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="app-shell">
        <header className="hero">
          <div>
            <p className="eyebrow">Graduate life analytics</p>
            <h1>{activeNav?.label ?? 'GradFlow'}</h1>
            <p className="hero-copy">A softer dashboard for research, energy, money, habits, and deadlines.</p>
          </div>
          <div className="hero-actions">
            <button className="icon-button" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle menu">
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <button className="icon-button" onClick={logout} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {authSession.mode === 'guest' && (
          <div className="notice guest-notice">Guest mode: your login choice is temporary. Use an account to keep a saved session.</div>
        )}
        {(message || error) && <div className={error ? 'notice error' : 'notice'}>{error || message}</div>}
        {pendingDailyUpdate && (
          <ConfirmDialog
            title="Update this day?"
            message={`${pendingDailyUpdate.logDate} already has a daily check-in. Updating will overwrite the visible daily fields and keep hidden water or exercise data unchanged.`}
            confirmLabel="Update"
            onCancel={() => setPendingDailyUpdate(null)}
            onConfirm={() => {
              const payload = pendingDailyUpdate;
              setPendingDailyUpdate(null);
              saveDailyPayload(payload, 'Daily check-in updated.');
            }}
          />
        )}
        {settingsOpen && (
          <SettingsPage
            profileSettings={profileSettings}
            setProfileSettings={setProfileSettings}
            setMessage={setMessage}
            onClose={() => setSettingsOpen(false)}
            authSession={authSession}
            reportData={{ dailyLogs, tasks, habits, expenses, goals, events, rewardSummary, analytics }}
          />
        )}
        {page}
      </main>
    </div>
  );
}

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [authError, setAuthError] = useState('');

  function submitAuth(event) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      setAuthError('Please enter email and password.');
      return;
    }
    const accounts = readAuthAccounts();
    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setAuthError('Password confirmation does not match.');
        return;
      }
      if (accounts.some((account) => account.email === email)) {
        setAuthError('This email is already registered.');
        return;
      }
      const nextAccounts = [...accounts, { email, password: form.password, createdAt: new Date().toISOString() }];
      localStorage.setItem('gradflow.authAccounts', JSON.stringify(nextAccounts));
      onAuth({ mode: 'account', email });
      return;
    }
    const account = accounts.find((item) => item.email === email && item.password === form.password);
    if (!account) {
      setAuthError('Email or password is incorrect.');
      return;
    }
    onAuth({ mode: 'account', email });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-mark">
          <User size={28} />
        </div>
        <p className="eyebrow">GradFlow</p>
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <form className="form-grid" onSubmit={submitAuth}>
          <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
          />
          {mode === 'register' && (
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={(confirm) => setForm({ ...form, confirm })}
            />
          )}
          {authError && <div className="notice error">{authError}</div>}
          <button className="primary-button">
            <Check size={16} />
            {mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>
        <div className="auth-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setAuthError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
          >
            {mode === 'login' ? 'Create an account' : 'Back to sign in'}
          </button>
          <button type="button" className="secondary-button" onClick={() => onAuth({ mode: 'guest', email: 'guest' })}>
            Continue as guest
          </button>
        </div>
        <p className="settings-note">Guest sessions do not keep a saved login after refresh.</p>
      </section>
    </main>
  );
}

function AvatarEditor({ profileSettings, setProfileSettings, setMessage, onClose, deferMessage = false }) {
  const [avatarDraft, setAvatarDraft] = useState(profileSettings.avatar);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarContrast, setAvatarContrast] = useState(100);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  function updateAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarDraft(reader.result);
    reader.readAsDataURL(file);
  }

  function saveAvatar() {
  if (!avatarDraft) {
    setProfileSettings({ ...profileSettings, avatar: '' });
    setMessage('Avatar removed.');
    onClose();
    return;
  }

  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');
  const image = new Image();

  image.onload = () => {
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const sourceSize = Math.min(image.width, image.height) / avatarZoom;
    const sx = (image.width - sourceSize) / 2;
    const sy = (image.height - sourceSize) / 2;

    context.clearRect(0, 0, size, size);
    context.filter = `contrast(${avatarContrast}%)`;
    context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMessage('Avatar upload failed.');
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, `avatar-${Date.now()}.png`);

      try {
        setAvatarUploading(true);

        const response = await fetch('/api/gradflow/upload', {
          method: 'POST',
          headers: {
            'X-User-Email': 'demo@gradflow.local',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Avatar upload failed.');
        }

        const s3Url = await response.text();

        setProfileSettings({ ...profileSettings, avatar: s3Url });
        if (!deferMessage) setMessage('Avatar uploaded to S3.');
        onClose();
      } catch (error) {
        console.error('Avatar upload failed:', error);
        setMessage('Avatar upload failed.');
      } finally {
        setAvatarUploading(false);
      }
    }, 'image/png');
  };

  image.src = avatarDraft;
}

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="avatar-dialog" role="dialog" aria-modal="true" aria-label="Upload avatar">
        <div className="overview-card-head">
          <div className="panel-heading">
            <Upload size={18} />
            <h2>Avatar</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        <button type="button" className="profile-avatar-preview avatar-click-target" onClick={() => fileInputRef.current?.click()}>
          {avatarDraft ? (
            <img
              src={avatarDraft}
              alt="Profile avatar draft"
              style={{ transform: `scale(${avatarZoom})`, filter: `contrast(${avatarContrast}%)` }}
            />
          ) : (
            <span>{profileSettings.displayName.slice(0, 2).toUpperCase()}</span>
          )}
        </button>
        <input ref={fileInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={updateAvatar} />
        <div className="two-col">
          <Input
            label="Crop zoom"
            type="range"
            min="1"
            max="2.4"
            step="0.1"
            value={avatarZoom}
            onChange={(value) => setAvatarZoom(Number(value))}
          />
          <Input
            label="Contrast"
            type="range"
            min="70"
            max="150"
            step="5"
            value={avatarContrast}
            onChange={(value) => setAvatarContrast(Number(value))}
          />
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={() => setAvatarDraft('')}>
            Remove
          </button>
          <button type="button" className="primary-button" onClick={saveAvatar} disabled={avatarUploading}>
            <Check size={16} />
            {avatarUploading ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
        <canvas ref={canvasRef} className="avatar-canvas" />
      </section>
    </div>
  );
}

function Overview({ analytics, dailyLogs, habits, goals, tasks, events, todaySettings, setActivePage, run }) {
  const todayLog = dailyLogs.find((log) => log.logDate === today);
  const pendingTasks = tasks
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => new Date(a.deadline || '2999-12-31') - new Date(b.deadline || '2999-12-31'));
  const todayEvents = events.filter((event) => eventOccursOn(event, today));
  const todayMood = moodOptions.find((mood) => mood.value === todayLog?.mood);
  const todayStress = stressOptions.find((stress) => stress.value === todayLog?.stress);
  const topGoals = [...goals]
    .sort((a, b) => Number(a.completed) - Number(b.completed) || Number(b.progress) - Number(a.progress))
    .slice(0, 3);
  const overdueTasks = pendingTasks.filter((task) => task.deadline && task.deadline < today);
  const dueTodayTasks = pendingTasks.filter((task) => task.deadline === today);
  const activeGoals = goals.filter((goal) => !goal.completed);
  const slowGoal = activeGoals.sort((a, b) => Number(a.progress) - Number(b.progress))[0];
  const stateInsight = !todayLog
    ? '先補今天的 check-in，首頁就能開始幫你抓狀態。'
    : Number(todayLog.stress) >= 4
      ? '壓力偏高，今天可以把任務切小一點，先做一個低阻力開場。'
      : Number(todayLog.sleepHours || 0) < 6.5
        ? '睡眠偏少，建議今天不要排太多高 effort 任務。'
        : todayLog.exercised
          ? '今天有活動身體，適合安排一段穩定輸出時間。'
          : '狀態看起來穩，可以挑一件最重要的小事先推進。';
  const taskInsight = overdueTasks.length
    ? `${overdueTasks.length} 個任務已過期，先處理最短的一個會比較不卡。`
    : dueTodayTasks.length
      ? `${dueTodayTasks.length} 個任務今天到期，建議先看 priority 最高的。`
      : pendingTasks.length
        ? '目前沒有今天到期的任務，可以整理下一個研究步驟。'
        : '任務清空時很適合新增一個明確的小目標。';
  const eventInsight = todayEvents.length
    ? '今天有行程，留一點緩衝時間給切換和整理筆記。'
    : '今天日曆是空的，可以安排一段深度工作或休息。';
  const goalInsight = slowGoal
    ? `${slowGoal.title} 目前 ${slowGoal.progress}%，可以綁一個 task 或 habit 讓進度自動往前。`
    : (analytics?.insights?.[0] ?? '還沒有 active goal，可以先建立一個本週想推進的方向。');

  return (
    <section className="overview-grid">
      <AiLogAssistant dailyLogs={dailyLogs} habits={habits} run={run} />
      <section className="panel overview-card today-state">
        <div className="overview-card-head">
          <div className="panel-heading">
            <Moon size={18} />
            <h2>Today State</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => setActivePage('today')}>
            前往更新
          </button>
        </div>
        {todayLog ? (
          <div className="today-state-stack">
            <div className="today-face-pair">
              <article>
                <strong>{todayMood?.face ?? ':|'}</strong>
                <span>{todayMood?.label ?? 'Mood'}</span>
              </article>
              <article>
                <strong>{todayStress?.face ?? ':)'}</strong>
                <span>{todayStress?.label ?? 'Stress'}</span>
              </article>
            </div>
            <div className="today-state-grid">
              <span>🌙 Sleep {Number(todayLog.sleepHours || 0).toFixed(1)}h</span>
              {todaySettings.waterVisible && <span>💧 Water {todayLog.waterMl || 0} ml</span>}
              {todaySettings.exerciseVisible && (
                <span>
                  {todayLog.exercised ? `🏃 ${todayLog.exerciseType} ${todayLog.exerciseMinutes}m` : '○ No exercise'}
                </span>
              )}
            </div>
            {todayLog.note && <p className="today-note-preview">{todayLog.note}</p>}
          </div>
        ) : (
          <p className="muted">No check-in for today yet.</p>
        )}
        <InsightNote text={stateInsight} />
      </section>

      <section className="panel overview-card">
        <div className="overview-card-head">
          <div className="panel-heading">
            <ListChecks size={18} />
            <h2>Today</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => setActivePage('tasks')}>
            前往任務
          </button>
        </div>
        <div className="overview-count">{pendingTasks.length} pending</div>
        <div className="overview-list">
          {pendingTasks.slice(0, 3).map((task) => (
            <article className="mini-row" key={task.id}>
              <strong>{task.deadline ? formatDate(task.deadline) : 'Anytime'}</strong>
              <span>{task.name}</span>
            </article>
          ))}
          {!pendingTasks.length && <p className="muted">No pending tasks.</p>}
        </div>
        <InsightNote text={taskInsight} />
      </section>

      <section className="panel overview-card">
        <div className="overview-card-head">
          <div className="panel-heading">
            <CalendarDays size={18} />
            <h2>Today Event</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => setActivePage('calendar')}>
            前往日曆
          </button>
        </div>
        <div className="overview-list">
          {todayEvents.slice(0, 3).map((event) => (
            <article className="mini-row" key={event.id}>
              <strong>{event.startTime?.slice(0, 5) || 'All day'}</strong>
              <span>{event.title}</span>
            </article>
          ))}
          {!todayEvents.length && <p className="muted">No events today.</p>}
        </div>
        <InsightNote text={eventInsight} />
      </section>

      <section className="panel overview-card">
        <div className="overview-card-head">
          <div className="panel-heading">
            <Flag size={18} />
            <h2>Goals</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => setActivePage('goals')}>
            前往目標
          </button>
        </div>
        <div className="goal-list">
          {topGoals.length ? (
            topGoals.map((goal) => (
              <article className="goal-row" key={goal.id}>
                <div>
                  <strong>{goal.title}</strong>
                  <span>
                    {goal.category} {goal.targetDate ? `by ${formatDate(goal.targetDate)}` : ''}
                  </span>
                </div>
                <b>{goal.progress}%</b>
              </article>
            ))
          ) : (
            <p className="muted">No goals yet.</p>
          )}
        </div>
        <InsightNote text={goalInsight} />
      </section>
    </section>
  );
}

function AiLogAssistant({ dailyLogs, habits, run }) {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState(null);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  function baseDailyPayload(date) {
    const existing = dailyLogs.find((log) => log.logDate === date);
    return {
      ...emptyDaily,
      ...(existing ?? {}),
      logDate: date,
      sleepStart: existing?.sleepStart?.slice(0, 5) ?? emptyDaily.sleepStart,
      wakeTime: existing?.wakeTime?.slice(0, 5) ?? emptyDaily.wakeTime,
      note: existing?.note ?? '',
    };
  }

  async function askGemini() {
    setBusy(true);
    setQuestion('');
    setDraft(null);
    try {
      const result = await api.gradflow.parseLog({
        text,
        today,
        habits: habits.map((habit) => ({ id: habit.id, name: habit.name, targetCount: habit.targetCount })),
      });
      if (result.status === 'clarify') {
        setQuestion(result.question || 'Can you add one more detail?');
      } else {
        setDraft(result);
      }
    } catch (err) {
      setQuestion(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function applyDraft() {
    const actions = draft?.actions ?? [];
    await run(async () => {
      const dailyByDate = new Map();
      for (const action of actions) {
        if (action.type === 'dailyLog') {
          const date = action.date || today;
          const payload = dailyByDate.get(date) ?? baseDailyPayload(date);
          Object.assign(payload, action.fields ?? {});
          if ('waterMl' in payload) payload.waterCups = Math.round(Number(payload.waterMl || 0) / 250);
          if (payload.exercised) {
            payload.exerciseMinutes = Number(payload.exerciseMinutes || 0);
            payload.exerciseType = payload.exerciseType || 'Gym';
          }
          payload.sleepHours = Number(payload.sleepHours || estimateSleepHours(payload.sleepStart, payload.wakeTime));
          payload.mood = Number(payload.mood || 3);
          payload.stress = Number(payload.stress || 3);
          payload.studyHours = Number(payload.studyHours || 0);
          dailyByDate.set(date, payload);
        }
        if (action.type === 'habitRecord') {
          const habit = habits.find((item) => item.name.toLowerCase() === String(action.habitName || '').toLowerCase());
          if (!habit) throw new Error(`Habit not found: ${action.habitName}`);
          await api.gradflow.saveHabitRecord({
            habitId: habit.id,
            recordDate: action.date || today,
            count: Number(action.count || habit.targetCount || 1),
          });
        }
      }
      for (const payload of dailyByDate.values()) {
        await api.gradflow.saveDailyLog(payload);
      }
    }, 'AI update saved.');
    setDraft(null);
    setText('');
  }

  function describeDraft() {
    const actions = draft?.actions ?? [];
    if (!actions.length) return draft?.summary || 'I found the note, but there is nothing to update yet.';
    const lines = actions.map((action) => {
      if (action.type === 'dailyLog') {
        const fields = Object.keys(action.fields ?? {});
        const fieldText = fields.length ? fields.join(', ') : 'daily check-in';
        return `Update ${action.date || today}: ${fieldText}.`;
      }
      if (action.type === 'habitRecord') {
        return `Mark ${action.habitName || 'a habit'} on ${action.date || today}.`;
      }
      return `Prepare one ${action.type} update.`;
    });
    return [draft?.summary, ...lines].filter(Boolean).join(' ');
  }

  return (
    <section className="panel overview-card ai-log-card span-2">
      <div className="overview-card-head">
        <div className="panel-heading">
          <Sparkles size={18} />
          <h2>AI Quick Log</h2>
        </div>
      </div>
      <div className="ai-log-compose">
        <Textarea
          label=""
          value={text}
          onChange={setText}
          placeholder="Tell GradFlow what happened, e.g. 今天運動 30min、喝水 1800ml、讀書 2 小時"
          aria-label="Tell GradFlow what happened"
        />
        <button
          type="button"
          className="primary-button icon-only-button ai-send-button"
          disabled={!text.trim() || busy}
          onClick={askGemini}
          title={busy ? 'Reading' : 'Parse with AI'}
          aria-label={busy ? 'Reading' : 'Parse with AI'}
        >
          {busy ? <Sparkles size={18} /> : <Send size={18} />}
        </button>
      </div>
      {question && <InsightNote text={question} />}
      {draft && (
        <div className="ai-confirm-box">
          <strong>{describeDraft()}</strong>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={() => setDraft(null)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={applyDraft}>
              <Check size={16} />
              Confirm update
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function InsightNote({ text }) {
  return (
    <p className="overview-insight">
      <Sparkles size={15} />
      {text}
    </p>
  );
}

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
              habits.map((habit) => <HabitCheck key={habit.id} habit={habit} run={run} compact />)
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

function ResearchPage({ researchForm, setResearchForm, researchLogs, run }) {
  const [showHoursChart, setShowHoursChart] = useState(false);
  const [hoursRange, setHoursRange] = useState(() => {
    const start = new Date(`${today}T00:00:00`);
    start.setDate(start.getDate() - 13);
    return { start: localDateKey(start), end: today };
  });
  const sortedLogs = [...researchLogs].sort((a, b) => new Date(b.logDate) - new Date(a.logDate));
  const weekStartDate = new Date(`${today}T00:00:00`);
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  const weekStartKey = localDateKey(weekStartDate);
  const weeklyLogs = researchLogs.filter((log) => log.logDate >= weekStartKey && log.logDate <= today);
  const weeklyHours = weeklyLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const blockerItems = sortedLogs.filter((log) => log.blockers);
  const nextStepItems = sortedLogs.filter((log) => log.nextStep);
  const openBlockers = blockerItems.filter((log) => !log.blockerSolved).length;

  return (
    <section className="research-layout">
      <section className="panel research-summary-strip">
        <div className="research-summary-item">
          <span>This Week Hours</span>
          <strong>{weeklyHours}h</strong>
          <button className="icon-button" type="button" onClick={() => setShowHoursChart((open) => !open)} title="View hours chart">
            <BarChart3 size={18} />
          </button>
        </div>
        <div className="research-summary-item">
          <span>Open Blocker</span>
          <strong>{openBlockers}</strong>
        </div>
      </section>
      {showHoursChart && (
        <div className="modal-backdrop research-chart-backdrop" onClick={() => setShowHoursChart(false)}>
          <section className="panel research-chart-panel" onClick={(event) => event.stopPropagation()}>
            <div className="research-chart-head">
              <div className="panel-heading">
                <BarChart3 size={18} />
                <h2>Research Hours</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowHoursChart(false)} title="Close chart">
                X
              </button>
            </div>
            <div className="research-chart-controls">
              <Input
                label="Start"
                type="date"
                value={hoursRange.start}
                onChange={(start) => setHoursRange({ ...hoursRange, start })}
              />
              <Input
                label="End"
                type="date"
                value={hoursRange.end}
                onChange={(end) => setHoursRange({ ...hoursRange, end })}
              />
            </div>
            <ResearchHoursChart logs={researchLogs} start={hoursRange.start} end={hoursRange.end} />
          </section>
        </div>
      )}
      <section className="research-main-grid">
        <QuickForm
          icon={<BookOpen size={18} />}
          title="Research Session"
          button="Add Research"
          onSubmit={() =>
            run(
              () => api.gradflow.createResearchLog({ ...researchForm, hours: Number(researchForm.hours) }),
              'Research log added.',
            ).then(() => setResearchForm(emptyResearch))
          }
        >
          <Input
            label="Date"
            type="date"
            value={researchForm.logDate}
            onChange={(logDate) => setResearchForm({ ...researchForm, logDate })}
          />
          <Input
            label="Topic"
            value={researchForm.topic}
            onChange={(topic) => setResearchForm({ ...researchForm, topic })}
            placeholder="Federated learning paper"
            required
          />
          <Input
            label="Hours"
            type="number"
            step="0.5"
            value={researchForm.hours}
            onChange={(hours) => setResearchForm({ ...researchForm, hours })}
          />
          <Textarea
            label="Progress"
            value={researchForm.progress}
            onChange={(progress) => setResearchForm({ ...researchForm, progress })}
            placeholder="What moved forward?"
          />
          <Textarea
            label="Blockers"
            value={researchForm.blockers}
            onChange={(blockers) => setResearchForm({ ...researchForm, blockers })}
            placeholder="What is stuck or unclear?"
          />
          <Textarea
            label="Next step"
            value={researchForm.nextStep}
            onChange={(nextStep) => setResearchForm({ ...researchForm, nextStep })}
            placeholder="Smallest useful next action"
          />
        </QuickForm>
        <section className="panel research-board">
          <div className="panel-heading">
            <GraduationCap size={18} />
            <h2>Research Timeline</h2>
          </div>
          <div className="research-log-stack">
            {sortedLogs.map((log) => (
              <article className="research-log-card" key={log.id}>
                <div>
                  <strong>{log.topic}</strong>
                  <span>{formatDate(log.logDate)} - {log.hours}h</span>
                </div>
                {log.progress && <p>{log.progress}</p>}
                {log.blockers && <p className={log.blockerSolved ? 'research-solved-text' : 'research-blocker'}>Blocked: {log.blockers}</p>}
                {log.nextStep && <b className={log.nextStepSolved ? 'research-solved-text' : ''}>Next: {log.nextStep}</b>}
                <button
                  className="icon-button danger research-delete-button"
                  type="button"
                  onClick={() => run(() => api.gradflow.deleteResearchLog(log.id), 'Research log deleted.')}
                  title="Delete research log"
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
            {!sortedLogs.length && <p className="muted">No research logs yet.</p>}
          </div>
        </section>
      </section>
      <section className="research-bottom-grid">
        <section className="panel research-queue-panel">
          <div className="panel-heading">
            <Flag size={18} />
            <h2>Blocker Board</h2>
          </div>
          <div className="research-queue-list">
            {blockerItems.map((log) => (
              <ResearchQueueItem
                key={`blocker-${log.id}`}
                title={log.blockers}
                meta={`${log.topic} - ${formatDate(log.logDate)}`}
                solved={log.blockerSolved}
                onSolve={() => run(() => api.gradflow.solveResearchItem(log.id, 'blocker'), 'Blocker solved.')}
              />
            ))}
            {!blockerItems.length && <p className="muted">No blockers right now.</p>}
          </div>
        </section>
        <section className="panel research-queue-panel">
          <div className="panel-heading">
            <ListChecks size={18} />
            <h2>Next Step Queue</h2>
          </div>
          <div className="research-queue-list">
            {nextStepItems.map((log) => (
              <ResearchQueueItem
                key={`next-${log.id}`}
                title={log.nextStep}
                meta={`${log.topic} - ${formatDate(log.logDate)}`}
                solved={log.nextStepSolved}
                onSolve={() => run(() => api.gradflow.solveResearchItem(log.id, 'next-step'), 'Next step solved.')}
              />
            ))}
            {!nextStepItems.length && <p className="muted">No next steps logged yet.</p>}
          </div>
        </section>
      </section>
    </section>
  );
}

function ResearchHoursChart({ logs, start, end }) {
  const points = buildResearchHourPoints(logs, start, end);
  if (!points.length) return <p className="muted">No research hours in this range.</p>;

  const width = 640;
  const height = 240;
  const left = 52;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const max = Math.max(...points.map((point) => point.hours), 1);
  const yTicks = [max, max / 2, 0];
  const xTicks = points.length <= 3
    ? points.map((point, index) => ({ point, index }))
    : [
        { point: points[0], index: 0 },
        { point: points[Math.floor((points.length - 1) / 2)], index: Math.floor((points.length - 1) / 2) },
        { point: points[points.length - 1], index: points.length - 1 },
      ];

  function xFor(index) {
    return points.length === 1 ? (left + width - right) / 2 : left + (index / (points.length - 1)) * (width - left - right);
  }

  function yFor(value) {
    return top + ((max - value) / max) * (height - top - bottom);
  }

  const line = points.map((point, index) => `${xFor(index)},${yFor(point.hours)}`).join(' ');

  return (
    <div className="research-hours-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Research hours line chart">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line className="trend-grid-line" x1={left} y1={yFor(tick)} x2={width - right} y2={yFor(tick)} />
            <text className="trend-y-label" x={left - 8} y={yFor(tick) + 4} textAnchor="end">
              {tick.toFixed(tick % 1 ? 1 : 0)}h
            </text>
          </g>
        ))}
        <line className="trend-axis" x1={left} y1={top} x2={left} y2={height - bottom} />
        <line className="trend-axis" x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} />
        {xTicks.map(({ point, index }) => (
          <text className="trend-x-label" key={`${point.date}-${index}`} x={xFor(index)} y={height - 16} textAnchor="middle">
            {point.date.slice(5)}
          </text>
        ))}
        <polyline className="research-hours-line" points={line} />
      </svg>
    </div>
  );
}

function buildResearchHourPoints(logs, start, end) {
  if (!start || !end || start > end) return [];
  const totals = logs.reduce((acc, log) => {
    if (log.logDate >= start && log.logDate <= end) {
      acc[log.logDate] = (acc[log.logDate] || 0) + Number(log.hours || 0);
    }
    return acc;
  }, {});
  const points = [];
  for (let cursor = new Date(`${start}T00:00:00`); cursor <= new Date(`${end}T00:00:00`); cursor.setDate(cursor.getDate() + 1)) {
    const key = localDateKey(cursor);
    points.push({ date: key, hours: totals[key] || 0 });
  }
  return points;
}

function ResearchQueueItem({ title, meta, solved, onSolve }) {
  return (
    <article className={`research-queue-item ${solved ? 'solved' : ''}`}>
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <button className="secondary-button compact-button" type="button" onClick={onSolve} disabled={solved}>
        <Check size={15} />
        {solved ? 'Solved' : 'Solve'}
      </button>
    </article>
  );
}
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

function RewardsPage({ rewardForm, setRewardForm, rewards, rewardSummary, run }) {
  return (
    <>
      <div className="reward-points-line">✨ Current Points: {rewardSummary?.currentPoints ?? 0}</div>
      <section className="reward-page-grid">
        <section className="panel reward-pool-panel">
          <div className="panel-heading">
            <Gift size={18} />
            <h2>Reward Pool</h2>
          </div>
          <form
            className="reward-pool-form"
            onSubmit={(event) => {
              event.preventDefault();
              run(
                () => api.gradflow.createReward({ ...rewardForm, pointCost: Number(rewardForm.pointCost) }),
                'Reward added.',
              ).then(() => setRewardForm(emptyReward));
            }}
          >
            <IconPicker
              label="Icon"
              value={rewardForm.icon}
              onChange={(icon) => setRewardForm({ ...rewardForm, icon })}
              options={rewardIcons}
            />
            <div className="reward-pool-fields">
              <Input
                label="Reward"
                value={rewardForm.name}
                onChange={(name) => setRewardForm({ ...rewardForm, name })}
                placeholder="Big dinner"
                required
              />
              <Input
                label="Points to redeem"
                type="number"
                min="1"
                value={rewardForm.pointCost}
                onChange={(pointCost) => setRewardForm({ ...rewardForm, pointCost })}
              />
            </div>
            <button className="secondary-button reward-add-button">
              <Plus size={16} />
              Add Reward
            </button>
          </form>
        </section>
        <section className="panel reward-column-panel">
          <div className="panel-heading">
            <Gift size={18} />
            <h2>Choose Reward</h2>
          </div>
          {rewards.length ? (
            <div className="reward-grid scroll-list">
              {rewards.map((reward) => {
                const canRedeem = (rewardSummary?.currentPoints ?? 0) >= reward.pointCost;
                return (
                  <article className={`reward-card ${canRedeem ? '' : 'locked'}`} key={reward.id}>
                    <div className="reward-icon">{reward.icon || '✨'}</div>
                    <div className="reward-copy">
                      <strong>{reward.name}</strong>
                      <span>{reward.pointCost} points</span>
                    </div>
                    <div className="reward-actions">
                      <button
                        className="secondary-button"
                        disabled={!canRedeem}
                        onClick={() =>
                          run(
                            () => api.gradflow.redeemReward({ rewardId: reward.id, redeemedDate: today }),
                            'Reward redeemed.',
                          )
                        }
                      >
                        Redeem
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => run(() => api.gradflow.deleteReward(reward.id), 'Reward deleted.')}
                        title="Delete reward"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty reward-empty">Please add reward settings below.</p>
          )}
        </section>
        <section className="panel reward-column-panel">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Redeemed History</h2>
          </div>
          <div className="list-stack scroll-list">
            {(rewardSummary?.redemptions ?? []).map((redemption) => (
              <article className="reward-card reward-history-row" key={redemption.id}>
                <div className="reward-icon">{redemption.icon || '✨'}</div>
                <div className="reward-copy">
                  <strong>{redemption.name}</strong>
                  <span>
                    {redemption.pointCost} pts · {formatDate(redemption.redeemedDate)}
                  </span>
                </div>
              </article>
            ))}
            {!(rewardSummary?.redemptions ?? []).length && <p className="muted">No rewards redeemed yet.</p>}
          </div>
        </section>
      </section>
    </>
  );
}

function FinancePage({ expenseForm, setExpenseForm, expenses, run }) {
  const [dateRange, setDateRange] = useState({ start: monthStartKey(), end: today });
  const [breakdownMode, setBreakdownMode] = useState('expense');
  const periodTransactions = expenses.filter((expense) =>
    isInMoneyDateRange(expense.expenseDate, dateRange.start, dateRange.end),
  );
  const income = periodTransactions
    .filter((expense) => expense.type === 'INCOME')
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const spending = periodTransactions
    .filter((expense) => expense.type !== 'INCOME')
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const net = income - spending;
  const maxBar = Math.max(income, spending, 1);
  const categories = expenseForm.type === 'INCOME' ? incomeCategories : expenseCategories;
  const categoryBreakdown = buildCategoryBreakdown(periodTransactions, breakdownMode);
  const pieGradient = buildPieGradient(categoryBreakdown);
  const breakdownTotal = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const trendPoints = buildFinanceTrend(periodTransactions, dateRange.start, dateRange.end);

  return (
    <section className="finance-layout">
      <section className="finance-top-grid">
        <QuickForm
          icon={<Wallet size={18} />}
          title="Transaction"
          button="Add Transaction"
          onSubmit={() =>
            run(
              () => api.gradflow.createExpense({ ...expenseForm, amount: Number(expenseForm.amount) }),
              'Transaction added.',
            ).then(() => setExpenseForm(emptyExpense))
          }
        >
          <Input
            label="Date"
            type="date"
            value={expenseForm.expenseDate}
            onChange={(expenseDate) => setExpenseForm({ ...expenseForm, expenseDate })}
          />
          <Select
            label="Type"
            value={expenseForm.type}
            onChange={(type) =>
              setExpenseForm({
                ...expenseForm,
                type,
                category: type === 'INCOME' ? incomeCategories[0] : expenseCategories[0],
              })
            }
            options={['EXPENSE', 'INCOME']}
          />
          <Select
            label="Category"
            value={expenseForm.category}
            onChange={(category) => setExpenseForm({ ...expenseForm, category })}
            options={categories}
          />
          <Input
            label="Amount"
            type="number"
            value={expenseForm.amount}
            onChange={(amount) => setExpenseForm({ ...expenseForm, amount })}
            required
          />
          <Input
            label="Description"
            value={expenseForm.description}
            onChange={(description) => setExpenseForm({ ...expenseForm, description })}
          />
        </QuickForm>
        <section className="panel transaction-panel">
          <div className="panel-heading">
            <Wallet size={18} />
            <h2>Recent Transactions</h2>
          </div>
          <div className="transaction-list scroll-list">
            {expenses.length ? (
              expenses.map((expense) => (
                <TransactionRow
                  key={expense.id}
                  expense={expense}
                  onDelete={(id) => run(() => api.gradflow.deleteExpense(id), 'Transaction deleted.')}
                />
              ))
            ) : (
              <p className="muted">No money records yet.</p>
            )}
          </div>
        </section>
      </section>
      <section className="finance-summary-grid">
        <section className="panel finance-panel trend-panel">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Cash Flow</h2>
          </div>
          <div className="finance-date-range">
            <Input
              label="Start"
              type="date"
              value={dateRange.start}
              onChange={(start) => setDateRange((current) => ({ ...current, start }))}
            />
            <Input
              label="End"
              type="date"
              value={dateRange.end}
              onChange={(end) => setDateRange((current) => ({ ...current, end }))}
            />
          </div>
          <div className="money-bars">
            <MoneyBar label="Income" value={income} max={maxBar} tone="income" />
            <MoneyBar label="Expense" value={spending} max={maxBar} tone="expense" />
          </div>
          <Metric label="Net Cash Flow" value={formatMoney(net)} tone={net >= 0 ? 'green' : 'red'} />
          <p className="finance-advice">{getMoneyAdvice(income, spending, net)}</p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <Wallet size={18} />
            <h2>Category Breakdown</h2>
          </div>
          <div className="segmented finance-period">
            {[
              ['expense', 'Expense'],
              ['income', 'Income'],
              ['both', 'Both'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={breakdownMode === value ? 'active' : ''}
                onClick={() => setBreakdownMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <CategoryPie items={categoryBreakdown} gradient={pieGradient} total={breakdownTotal} mode={breakdownMode} />
        </section>
        <section className="panel finance-panel">
          <div className="panel-heading">
            <BarChart3 size={18} />
            <h2>Daily Flow</h2>
          </div>
          <FinanceTrendChart points={trendPoints} />
        </section>
      </section>
    </section>
  );
}

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

function DetailGrid({ rows }) {
  return (
    <div className="detail-grid">
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </React.Fragment>
      ))}
    </div>
  );
}

function SettingsPage({ profileSettings, setProfileSettings, setMessage, onClose, authSession, reportData }) {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [draftProfile, setDraftProfile] = useState(profileSettings);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);

  function saveSettings() {
    if (passwordForm.next && passwordForm.next !== passwordForm.confirm) {
      setMessage('Password confirmation does not match.');
      return;
    }
    const nextProfile = {
      ...draftProfile,
      passwordUpdatedAt: passwordForm.next ? new Date().toISOString() : profileSettings.passwordUpdatedAt,
    };
    setProfileSettings(nextProfile);
    if (authSession?.mode !== 'guest') {
      localStorage.setItem('gradflow.profileSettings', JSON.stringify(nextProfile));
      if (passwordForm.next) {
        const accounts = readAuthAccounts().map((account) =>
          account.email === authSession.email ? { ...account, password: passwordForm.next } : account,
        );
        localStorage.setItem('gradflow.authAccounts', JSON.stringify(accounts));
      }
    }
    setPasswordForm({ current: '', next: '', confirm: '' });
    setMessage('Settings saved.');
    onClose();
  }

  function downloadReport() {
    const completedTasks = reportData.tasks.filter((task) => task.status === 'DONE').length;
    const totalExpense = reportData.expenses
      .filter((expense) => expense.type !== 'INCOME')
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalIncome = reportData.expenses
      .filter((expense) => expense.type === 'INCOME')
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const report = [
      `GradFlow Health Report`,
      `Generated: ${new Date().toLocaleString()}`,
      `Name: ${profileSettings.displayName}`,
      ``,
      `Daily logs: ${reportData.dailyLogs.length}`,
      `Average sleep: ${Number(reportData.analytics?.averageSleep || 0).toFixed(1)}h`,
      `Average mood: ${Number(reportData.analytics?.averageMood || 0).toFixed(1)}/5`,
      `Average stress: ${Number(reportData.analytics?.averageStress || 0).toFixed(1)}/5`,
      ``,
      `Tasks completed: ${completedTasks}/${reportData.tasks.length}`,
      `Active goals: ${reportData.goals.filter((goal) => !goal.completed).length}`,
      `Habits tracked: ${reportData.habits.length}`,
      `Reward points: ${reportData.rewardSummary?.currentPoints ?? 0}`,
      ``,
      `Income recorded: ${formatMoney(totalIncome)}`,
      `Expense recorded: ${formatMoney(totalExpense)}`,
      `Net: ${formatMoney(totalIncome - totalExpense)}`,
      ``,
      `Insights:`,
      ...(reportData.analytics?.insights?.length
        ? reportData.analytics.insights.map((item) => `- ${item}`)
        : ['- No insights yet.']),
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradflow-health-report-${today}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-label="Profile settings">
        <div className="overview-card-head">
          <div className="panel-heading">
            <Settings size={18} />
            <h2>Profile Settings</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        <section className="settings-grid">
          <section className="settings-profile-card">
            <button type="button" className="profile-avatar-preview avatar-click-target" onClick={() => setAvatarEditorOpen(true)}>
              {draftProfile.avatar ? <img src={draftProfile.avatar} alt="" /> : <span>{draftProfile.displayName.slice(0, 2).toUpperCase()}</span>}
            </button>
            <Input
              label="Display name"
              value={draftProfile.displayName}
              onChange={(displayName) => setDraftProfile({ ...draftProfile, displayName })}
            />
            <p className="settings-note">Click the round avatar here to upload, crop, zoom, and adjust contrast. Changes apply after Save.</p>
          </section>
          <section className="settings-panel">
            <div className="panel-heading">
              <Moon size={18} />
              <h2>Appearance</h2>
            </div>
            <div className="theme-picker">
              {themeOptions.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  className={draftProfile.theme === theme.id ? 'active' : ''}
                  onClick={() => setDraftProfile({ ...draftProfile, theme: theme.id })}
                >
                  <span style={{ background: theme.color }} />
                  {theme.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`settings-toggle ${draftProfile.darkMode ? 'active' : ''}`}
              onClick={() => setDraftProfile({ ...draftProfile, darkMode: !draftProfile.darkMode })}
            >
              <span>{draftProfile.darkMode ? 'Dark mode is on' : 'Dark mode is off'}</span>
              <b>{draftProfile.darkMode ? 'ON' : 'OFF'}</b>
            </button>
            <button type="button" className="secondary-button" onClick={downloadReport}>
              Download Health Report
            </button>
          </section>
          <section className="settings-panel">
            <div className="panel-heading">
              <Sparkles size={18} />
              <h2>Password</h2>
            </div>
            <div className="form-grid">
              <Input
                label="Current password"
                type="password"
                value={passwordForm.current}
                onChange={(current) => setPasswordForm({ ...passwordForm, current })}
              />
              <Input
                label="New password"
                type="password"
                value={passwordForm.next}
                onChange={(next) => setPasswordForm({ ...passwordForm, next })}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={passwordForm.confirm}
                onChange={(confirm) => setPasswordForm({ ...passwordForm, confirm })}
              />
            </div>
            <p className="settings-note">
              Demo setting only. Password changes are applied after Save.
              {draftProfile.passwordUpdatedAt
                ? ` Last updated ${new Date(draftProfile.passwordUpdatedAt).toLocaleString()}.`
                : ''}
            </p>
          </section>
        </section>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={saveSettings}>
            <Check size={16} />
            Save Changes
          </button>
        </div>
        {avatarEditorOpen && (
          <AvatarEditor
            profileSettings={draftProfile}
            setProfileSettings={setDraftProfile}
            setMessage={setMessage}
            onClose={() => setAvatarEditorOpen(false)}
            deferMessage
          />
        )}
      </section>
    </div>
  );
}

function FacePicker({ label, options, value, onChange }) {
  return (
    <section className="picker-block">
      <span>{label}</span>
      <div className="face-grid">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={value === option.value ? 'selected' : ''}
            onClick={() => onChange(option.value)}
          >
            <strong>{option.face}</strong>
            <small>{option.label}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="panel-heading">
          <Sparkles size={18} />
          <h2>{title}</h2>
        </div>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            <Check size={16} />
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function CategoryDialog({ value, onChange, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-dialog category-dialog" role="dialog" aria-modal="true" aria-label="Add category">
        <div className="panel-heading">
          <Plus size={18} />
          <h2>Add Category</h2>
        </div>
        <Input label="Category name" value={value} onChange={onChange} placeholder="Thesis, Internship..." autoFocus />
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            <Check size={16} />
            Add
          </button>
        </div>
      </section>
    </div>
  );
}

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

function HabitCheck({ habit, run, compact = false }) {
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
              recordDate: today,
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

function MoneyBar({ label, value, max, tone }) {
  return (
    <article className={`money-bar ${tone}`}>
      <div>
        <strong>{label}</strong>
        <span>{formatMoney(value)}</span>
      </div>
      <div className="money-bar-track">
        <span style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      </div>
    </article>
  );
}

function CategoryPie({ items, gradient, total, mode }) {
  if (!items.length) return <p className="muted">No category data in this range.</p>;
  return (
    <div className="category-pie-wrap">
      <div className="category-pie" style={{ background: gradient }}>
        <div>
          <strong>{formatMoney(total)}</strong>
          <span>{mode === 'both' ? 'total' : mode}</span>
        </div>
      </div>
      <div className="category-legend">
        {items.map((item) => (
          <article key={item.key || item.category}>
            <span className="legend-dot" style={{ background: item.meta.hex }} />
            <span>
              {item.meta.icon} {mode === 'both' ? `${item.type} ` : ''}
              {item.category}
            </span>
            <strong>{formatMoney(item.amount)}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

function FinanceTrendChart({ points }) {
  if (!points.length) return <p className="muted">No daily flow data in this range.</p>;
  const width = 420;
  const height = 240;
  const left = 58;
  const right = 18;
  const top = 18;
  const bottom = 46;
  const enriched = points.map((point) => ({ ...point, net: point.income - point.expense }));
  const max = Math.max(...enriched.flatMap((point) => [point.income, point.expense, point.net]), 1);
  const min = Math.min(...enriched.map((point) => point.net), 0);
  const range = max - min || 1;
  const yTicks = [max, min + range / 2, min];
  const xTicks = enriched.length <= 3
    ? enriched.map((point, index) => ({ point, index }))
    : [
        { point: enriched[0], index: 0 },
        { point: enriched[Math.floor((enriched.length - 1) / 2)], index: Math.floor((enriched.length - 1) / 2) },
        { point: enriched[enriched.length - 1], index: enriched.length - 1 },
      ];

  function xFor(index) {
    return enriched.length === 1 ? (left + width - right) / 2 : left + (index / (enriched.length - 1)) * (width - left - right);
  }

  function yFor(value) {
    return top + ((max - value) / range) * (height - top - bottom);
  }

  function lineFor(key) {
    return enriched
      .map((point, index) => {
        return `${xFor(index)},${yFor(point[key])}`;
      })
      .join(' ');
  }

  return (
    <div className="finance-trend">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Income, expense, and net line chart">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line className="trend-grid-line" x1={left} y1={yFor(tick)} x2={width - right} y2={yFor(tick)} />
            <text className="trend-y-label" x={left - 8} y={yFor(tick) + 4} textAnchor="end">
              {Math.round(tick)}
            </text>
          </g>
        ))}
        <line className="trend-axis" x1={left} y1={top} x2={left} y2={height - bottom} />
        <line className="trend-axis" x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} />
        <text className="trend-axis-title" x={14} y={height / 2} transform={`rotate(-90 14 ${height / 2})`}>
          TWD
        </text>
        {xTicks.map(({ point, index }) => (
          <text className="trend-x-label" key={`${point.date}-${index}`} x={xFor(index)} y={height - 18} textAnchor="middle">
            {point.date.slice(5)}
          </text>
        ))}
        <polyline className="trend-income" points={lineFor('income')} />
        <polyline className="trend-expense" points={lineFor('expense')} />
        <polyline className="trend-net" points={lineFor('net')} />
      </svg>
      <div className="trend-legend">
        <span><i className="trend-dot income" /> Income</span>
        <span><i className="trend-dot expense" /> Expense</span>
        <span><i className="trend-dot net" /> Net</span>
      </div>
    </div>
  );
}

function TransactionRow({ expense, onDelete, compact = false }) {
  const meta = getMoneyMeta(expense.category);
  const isIncome = expense.type === 'INCOME';
  return (
    <article className={`transaction-row ${compact ? 'compact' : ''} ${isIncome ? 'income' : 'expense'} ${meta.color}`}>
      <div className="transaction-icon">{meta.icon}</div>
      <div className="transaction-copy">
        <strong>{expense.category}</strong>
        <span>
          {formatDate(expense.expenseDate)} {expense.description || 'No note'}
        </span>
      </div>
      <b className={isIncome ? 'amount-income' : 'amount-expense'}>
        {isIncome ? '+' : '-'}
        {formatMoney(expense.amount)}
      </b>
      {!compact && (
        <button
          className="icon-button danger transaction-delete"
          onClick={() => onDelete(expense.id)}
          title="Delete transaction"
        >
          <Trash2 size={16} />
        </button>
      )}
    </article>
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

function Input({ label, value, onChange, helper, ...props }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} {...props} />
      {helper && <small className="field-help">{helper}</small>}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, ...props }) {
  return (
    <label>
      {label && <span>{label}</span>}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function Metric({ label, value, tone = 'neutral' }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function QuickForm({ icon, title, button, onSubmit, children }) {
  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="panel-heading">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
      <button className="primary-button">
        <Plus size={16} />
        {button}
      </button>
    </form>
  );
}

function LogList({ title, items }) {
  return (
    <section className="panel log-list">
      <h3>{title}</h3>
      {items.length ? (
        items.slice(0, 8).map((item) => <p key={item}>{item}</p>)
      ) : (
        <p className="muted">No records yet.</p>
      )}
    </section>
  );
}

function TaskTable({ tasks, onDone, onDelete, archived = false, completed = false }) {
  if (!tasks.length) return <p className="empty">No tasks found.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Priority</th>
            <th>Effort</th>
            <th>Deadline</th>
            <th>Status</th>
            {archived ? <th>Archived</th> : <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="task-name">{task.name}</td>
              <td>{task.priority}</td>
              <td>{task.effort}</td>
              <td>{formatDate(task.deadline)}</td>
              <td>
                <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
              </td>
              {archived ? (
                <td>{formatDate(task.archivedAt)}</td>
              ) : (
                <td>
                  <div className="row-actions">
                    {!completed && (
                      <button
                        className="icon-button"
                        onClick={() => onDone(task.id)}
                        disabled={task.status === 'DONE'}
                        title="Mark done"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button className="icon-button danger" onClick={() => onDelete(task.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


