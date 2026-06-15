import {
  BookOpen,
  CalendarDays,
  Droplets,
  Flag,
  Gift,
  LayoutDashboard,
  ListChecks,
  Moon,
  Wallet,
} from 'lucide-react';

export const today = new Date().toISOString().slice(0, 10);

export const emptyTask = { name: '', category: 'Research', priority: 3, effort: 2, deadline: '', goalId: '' };
export const emptyDaily = {
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
export const emptyHabit = { name: '', targetCount: 1, unit: 'check', icon: '💧', goalId: '' };
export const emptyReward = { name: '', icon: '🍜', pointCost: 10 };
export const emptyExpense = { expenseDate: today, category: 'Food', type: 'EXPENSE', amount: '', description: '' };
export const emptyResearch = { logDate: today, topic: '', progress: '', blockers: '', nextStep: '', hours: 1 };
export const emptyGoal = { title: '', category: 'Research', targetDate: '', progress: 0, completed: false };
export const emptyEvent = {
  title: '',
  startDate: today,
  endDate: today,
  startTime: '',
  endTime: '',
  category: 'Study',
  note: '',
};

export const taskCategories = ['Research', 'Course', 'Homework', 'Meeting', 'Admin', 'Health', 'Life'];
export const defaultGoalCategories = ['Research', 'Course', 'Career', 'Health', 'Money', 'Life', 'Skill'];
export const expenseCategories = [
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
export const incomeCategories = ['Scholarship', 'Salary', 'Family', 'Part-time', 'Reward', 'Other'];
export const moneyMeta = {
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
export const exerciseTypes = ['Walk', 'Run', 'Yoga', 'Gym', 'Bike', 'Stretching', 'Dance'];
export const habitIcons = ['💧', '📚', '🏃', '🧘', '🥗', '☀️', '🌙', '📝', '🎧', '🧹', '💊', '✨'];
export const rewardIcons = ['🍜', '🍰', '🧋', '🎬', '🎮', '📦', '🛍️', '☕', '🎧', '💐', '🧸', '✨'];
export const defaultTodaySettings = {
  waterVisible: true,
  exerciseVisible: true,
  defaultWaterMl: 2000,
  defaultExerciseType: 'Walk',
  defaultExerciseMinutes: 20,
};
export const themeOptions = [
  { id: 'green', label: 'Sage', color: '#7f958b' },
  { id: 'pink', label: 'Rose', color: '#b58b92' },
  { id: 'blue', label: 'Mist', color: '#7f96a6' },
  { id: 'purple', label: 'Mauve', color: '#9a8fa8' },
  { id: 'gray', label: 'Stone', color: '#858985' },
  { id: 'orange', label: 'Clay', color: '#b79a82' },
];

export const moodOptions = [
  { value: 1, face: '😭', label: 'Drained' },
  { value: 2, face: '😕', label: 'Low' },
  { value: 3, face: '😐', label: 'Okay' },
  { value: 4, face: '😊', label: 'Good' },
  { value: 5, face: '🤩', label: 'Bright' },
];

export const stressOptions = [
  { value: 1, face: '😌', label: 'Calm' },
  { value: 2, face: '🙂', label: 'Light' },
  { value: 3, face: '😵‍💫', label: 'Busy' },
  { value: 4, face: '😰', label: 'Tense' },
  { value: 5, face: '🤯', label: 'Overloaded' },
];
export const navItems = [
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

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function formatMoney(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(
    value ?? 0,
  );
}

export function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function eventStartDate(event) {
  return event.startDate || event.eventDate;
}

export function eventEndDate(event) {
  return event.endDate || event.startDate || event.eventDate;
}

export function eventOccursOn(event, dateString) {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  return start <= dateString && dateString <= end;
}

export function formatEventRange(event) {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  const datePart = start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`;
  const timePart = event.startTime
    ? `${event.startTime.slice(0, 5)}${event.endTime ? `-${event.endTime.slice(0, 5)}` : ''}`
    : '';
  return `${datePart}${timePart ? ` ${timePart}` : ''}`;
}

export function estimateSleepHours(start, end) {
  if (!start || !end) return 0;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

export function getMoneyMeta(category) {
  return moneyMeta[category] ?? moneyMeta.Other;
}

export function buildCategoryBreakdown(transactions, mode = 'expense') {
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

export function buildPieGradient(items) {
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

export function isInMoneyDateRange(dateString, start, end) {
  const date = new Date(`${dateString}T00:00:00`);
  const startDate = start ? new Date(`${start}T00:00:00`) : null;
  const endDate = end ? new Date(`${end}T23:59:59`) : null;
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
}

export function monthStartKey() {
  const date = new Date();
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function buildFinanceTrend(transactions, start, end) {
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

export function getMoneyAdvice(income, spending, net) {
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

export function uniqueList(items) {
  return [
    ...new Set(
      items
        .filter(Boolean)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function readTodaySettings() {
  try {
    return { ...defaultTodaySettings, ...JSON.parse(localStorage.getItem('gradflow.todaySettings') ?? '{}') };
  } catch {
    return defaultTodaySettings;
  }
}

export const defaultProfileSettings = {
  displayName: 'Graduate Student',
  avatar: '',
  darkMode: false,
  theme: 'green',
  passwordUpdatedAt: '',
};

function profileStorageKey(session) {
  if (session && session.mode !== 'guest' && session.email) {
    return `gradflow.profileSettings.${session.email}`;
  }
  return null;
}

export function readProfileSettings(session) {
  const key = profileStorageKey(session);
  if (!key) return { ...defaultProfileSettings };
  try {
    return { ...defaultProfileSettings, ...JSON.parse(localStorage.getItem(key) ?? '{}') };
  } catch {
    return { ...defaultProfileSettings };
  }
}

export function writeProfileSettings(session, profile) {
  const key = profileStorageKey(session);
  if (key) {
    localStorage.setItem(key, JSON.stringify(profile));
  }
}

export function readAuthSession() {
  try {
    return JSON.parse(localStorage.getItem('gradflow.authSession') ?? 'null');
  } catch {
    return null;
  }
}

