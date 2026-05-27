const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

let guestMode = false;
let currentUserEmail = 'demo@gradflow.local';
const guestDb = {
  tasks: [],
  archived: [],
  dailyLogs: [],
  habits: [],
  habitRecords: [],
  rewards: [],
  redemptions: [],
  expenses: [],
  researchLogs: [],
  goals: [],
  events: [],
  ids: {},
};

function nextId(name) {
  guestDb.ids[name] = (guestDb.ids[name] ?? 0) + 1;
  return guestDb.ids[name];
}

function jsonResponse(value) {
  return Promise.resolve(value);
}

function notFound(message) {
  throw new Error(message);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function analytics() {
  const daily = guestDb.dailyLogs;
  const expenses = guestDb.expenses;
  const researchHours = guestDb.researchLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const totalExpenses = expenses
    .filter((item) => item.type !== 'INCOME')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalIncome = expenses
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return {
    averageSleep: daily.length ? daily.reduce((sum, log) => sum + Number(log.sleepHours || 0), 0) / daily.length : 0,
    averageMood: daily.length ? daily.reduce((sum, log) => sum + Number(log.mood || 0), 0) / daily.length : 0,
    averageStress: daily.length ? daily.reduce((sum, log) => sum + Number(log.stress || 0), 0) / daily.length : 0,
    totalStudyHours: daily.reduce((sum, log) => sum + Number(log.studyHours || 0), 0),
    totalExpenses,
    totalIncome,
    netCashFlow: totalIncome - totalExpenses,
    totalResearchHours: researchHours,
    activeGoals: guestDb.goals.filter((goal) => !goal.completed).length,
    weeklyHabitCompletions: guestDb.habitRecords.length,
    insights: ['Guest mode keeps records only until refresh.'],
    spendingByCategory: {},
  };
}

function rewardSummary() {
  const earnedPoints = guestDb.habitRecords.length;
  const redeemedPoints = guestDb.redemptions.reduce((sum, item) => sum + Number(item.pointCost || 0), 0);
  return {
    earnedPoints,
    redeemedPoints,
    currentPoints: earnedPoints - redeemedPoints,
    redemptions: [...guestDb.redemptions].sort((a, b) => new Date(b.redeemedDate) - new Date(a.redeemedDate)),
  };
}

async function guestRequest(path, options = {}) {
  const method = options.method ?? 'GET';
  const body = options.body ? JSON.parse(options.body) : null;

  if (path === '/tasks' && method === 'GET') return jsonResponse([...guestDb.tasks]);
  if (path === '/tasks?archived=true') return jsonResponse([...guestDb.archived]);
  if (path === '/tasks' && method === 'POST') {
    const task = { id: nextId('tasks'), status: 'PENDING', createdAt: new Date().toISOString(), ...body };
    guestDb.tasks.push(task);
    return jsonResponse(task);
  }
  if (path.match(/^\/tasks\/\d+\/done$/) && method === 'PATCH') {
    const id = Number(path.split('/')[2]);
    const task = guestDb.tasks.find((item) => item.id === id) ?? notFound('Task id not found.');
    task.status = 'DONE';
    return jsonResponse(task);
  }
  if (path.match(/^\/tasks\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/')[2]);
    guestDb.tasks = guestDb.tasks.filter((item) => item.id !== id);
    return jsonResponse(null);
  }
  if (path.match(/^\/tasks\/\d+\/postpone$/) && method === 'PATCH') {
    const id = Number(path.split('/')[2]);
    const task = guestDb.tasks.find((item) => item.id === id) ?? notFound('Task id not found.');
    const date = new Date(`${task.deadline || todayKey()}T00:00:00`);
    date.setDate(date.getDate() + Number(body.days || 0));
    task.deadline = date.toISOString().slice(0, 10);
    return jsonResponse(task);
  }
  if (path === '/tasks/reset' && method === 'DELETE') {
    guestDb.tasks = [];
    return jsonResponse(null);
  }
  if (path === '/archive' && method === 'POST') {
    const done = guestDb.tasks.filter((task) => task.status === 'DONE');
    guestDb.archived.push(...done.map((task) => ({ ...task, archivedAt: new Date().toISOString() })));
    guestDb.tasks = guestDb.tasks.filter((task) => task.status !== 'DONE');
    return jsonResponse({ archivedCount: done.length, message: `${done.length} task(s) archived.` });
  }
  if (path.startsWith('/suggestions')) return jsonResponse([...guestDb.tasks].filter((task) => task.status !== 'DONE').slice(0, 3));
  if (path === '/stats') return jsonResponse({ totalTasks: guestDb.tasks.length, doneTasks: guestDb.tasks.filter((task) => task.status === 'DONE').length });

  if (path === '/gradflow/daily-logs' && method === 'GET') return jsonResponse([...guestDb.dailyLogs].sort((a, b) => new Date(b.logDate) - new Date(a.logDate)));
  if (path === '/gradflow/daily-logs' && method === 'POST') {
    const existing = guestDb.dailyLogs.find((log) => log.logDate === body.logDate);
    const next = { ...(existing ?? { id: nextId('dailyLogs') }), ...body, updatedAt: new Date().toISOString() };
    if (existing) Object.assign(existing, next);
    else guestDb.dailyLogs.push(next);
    return jsonResponse(next);
  }
  if (path.match(/^\/gradflow\/daily-logs\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.dailyLogs = guestDb.dailyLogs.filter((item) => item.id !== id);
    return jsonResponse(null);
  }

  if ((path === '/gradflow/habits' || path.startsWith('/gradflow/habits?')) && method === 'GET') {
    const date = path.includes('?') ? new URLSearchParams(path.split('?')[1]).get('date') : todayKey();
    return jsonResponse(guestDb.habits.map((habit) => ({
      ...habit,
      todayCount: guestDb.habitRecords.find((record) => record.habitId === habit.id && record.recordDate === date)?.count ?? 0,
      weeklyRate: 0,
    })));
  }
  if (path === '/gradflow/habits' && method === 'POST') {
    const habit = { id: nextId('habits'), ...body };
    guestDb.habits.push(habit);
    return jsonResponse(habit);
  }
  if (path.match(/^\/gradflow\/habits\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.habits = guestDb.habits.filter((item) => item.id !== id);
    guestDb.habitRecords = guestDb.habitRecords.filter((item) => item.habitId !== id);
    return jsonResponse(null);
  }
  if (path === '/gradflow/habit-records' && method === 'POST') {
    const existing = guestDb.habitRecords.find((record) => record.habitId === body.habitId && record.recordDate === body.recordDate);
    const record = { ...(existing ?? { id: nextId('habitRecords') }), ...body };
    if (existing) Object.assign(existing, record);
    else guestDb.habitRecords.push(record);
    return jsonResponse(record);
  }
  if (path.match(/^\/gradflow\/habits\/\d+\/stats$/)) {
    const id = Number(path.split('/')[3]);
    const habit = guestDb.habits.find((item) => item.id === id) ?? notFound('Habit id not found.');
    return jsonResponse({ habitId: id, name: habit.name, icon: habit.icon, currentStreak: 0, bestStreak: 0, thisWeekCompleted: 0, thisWeekTotal: 7, completionRate: 0, last14Days: [], weeklyTrend: [], suggestion: 'Guest habit stats are temporary.' });
  }

  if (path === '/gradflow/rewards' && method === 'GET') return jsonResponse([...guestDb.rewards]);
  if (path === '/gradflow/rewards' && method === 'POST') {
    const reward = { id: nextId('rewards'), ...body };
    guestDb.rewards.push(reward);
    return jsonResponse(reward);
  }
  if (path.match(/^\/gradflow\/rewards\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.rewards = guestDb.rewards.filter((item) => item.id !== id);
    return jsonResponse(null);
  }
  if (path === '/gradflow/reward-redemptions' && method === 'POST') {
    const reward = guestDb.rewards.find((item) => item.id === body.rewardId) ?? notFound('Reward id not found.');
    const redemption = { id: nextId('redemptions'), rewardId: reward.id, name: reward.name, icon: reward.icon, pointCost: reward.pointCost, redeemedDate: body.redeemedDate || todayKey() };
    guestDb.redemptions.push(redemption);
    return jsonResponse(redemption);
  }
  if (path === '/gradflow/reward-summary') return jsonResponse(rewardSummary());

  if (path === '/gradflow/expenses' && method === 'GET') return jsonResponse([...guestDb.expenses]);
  if (path === '/gradflow/expenses' && method === 'POST') {
    const expense = { id: nextId('expenses'), ...body };
    guestDb.expenses.push(expense);
    return jsonResponse(expense);
  }
  if (path.match(/^\/gradflow\/expenses\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.expenses = guestDb.expenses.filter((item) => item.id !== id);
    return jsonResponse(null);
  }

  if (path === '/gradflow/research-logs' && method === 'GET') return jsonResponse([...guestDb.researchLogs]);
  if (path === '/gradflow/research-logs' && method === 'POST') {
    const log = { id: nextId('researchLogs'), blockerSolved: false, nextStepSolved: false, ...body };
    guestDb.researchLogs.push(log);
    return jsonResponse(log);
  }
  if (path.match(/^\/gradflow\/research-logs\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.researchLogs = guestDb.researchLogs.filter((item) => item.id !== id);
    return jsonResponse(null);
  }
  if (path.match(/^\/gradflow\/research-logs\/\d+\/solve\/[\w-]+$/) && method === 'PATCH') {
    const parts = path.split('/');
    const id = Number(parts[3]);
    const item = parts[5];
    const log = guestDb.researchLogs.find((entry) => entry.id === id);
    if (!log) throw new Error('Research log id not found.');
    if (item === 'blocker') log.blockerSolved = true;
    if (item === 'next-step') log.nextStepSolved = true;
    return jsonResponse(log);
  }

  if (path === '/gradflow/goals' && method === 'GET') return jsonResponse([...guestDb.goals].map((goal) => ({ ...goal, manualProgress: goal.progress, autoProgress: false, linkedTasks: 0, doneTasks: 0, linkedHabits: 0 })));
  if (path === '/gradflow/goals' && method === 'POST') {
    const goal = { id: nextId('goals'), ...body };
    guestDb.goals.push(goal);
    return jsonResponse(goal);
  }
  if (path.match(/^\/gradflow\/goals\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.goals = guestDb.goals.filter((item) => item.id !== id);
    return jsonResponse(null);
  }

  if (path === '/gradflow/calendar-events' && method === 'GET') return jsonResponse([...guestDb.events]);
  if (path === '/gradflow/calendar-events' && method === 'POST') {
    const event = { id: nextId('events'), ...body };
    guestDb.events.push(event);
    return jsonResponse(event);
  }
  if (path.match(/^\/gradflow\/calendar-events\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    guestDb.events = guestDb.events.filter((item) => item.id !== id);
    return jsonResponse(null);
  }
  if (path === '/gradflow/analytics') return jsonResponse(analytics());
  if (path === '/gradflow/ai/parse-log' && method === 'POST') return request(path, options);

  throw new Error(`Guest endpoint not implemented: ${method} ${path}`);
}

async function request(path, options = {}) {
  if (guestMode && path !== '/gradflow/ai/parse-log') {
    return guestRequest(path, options);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': currentUserEmail,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(error.message ?? 'Request failed.');
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  setGuestMode: (enabled) => {
    guestMode = enabled;
  },
  setCurrentUser: (email) => {
    currentUserEmail = email || 'demo@gradflow.local';
  },
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (credentials) => request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
    changePassword: (payload) => request('/auth/password', { method: 'PATCH', body: JSON.stringify(payload) }),
  },
  listTasks: () => request('/tasks'),
  listArchived: () => request('/tasks?archived=true'),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  markDone: (id) => request(`/tasks/${id}/done`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  postpone: (id, days) =>
    request(`/tasks/${id}/postpone`, {
      method: 'PATCH',
      body: JSON.stringify({ days }),
    }),
  suggestions: (top) => request(`/suggestions?top=${top}`),
  stats: () => request('/stats'),
  archive: () => request('/archive', { method: 'POST' }),
  reset: () => request('/tasks/reset', { method: 'DELETE' }),
  gradflow: {
    dailyLogs: () => request('/gradflow/daily-logs'),
    saveDailyLog: (log) => request('/gradflow/daily-logs', { method: 'POST', body: JSON.stringify(log) }),
    deleteDailyLog: (id) => request(`/gradflow/daily-logs/${id}`, { method: 'DELETE' }),
    habits: (date) => request(`/gradflow/habits${date ? `?date=${date}` : ''}`),
    habitStats: (id) => request(`/gradflow/habits/${id}/stats`),
    createHabit: (habit) => request('/gradflow/habits', { method: 'POST', body: JSON.stringify(habit) }),
    deleteHabit: (id) => request(`/gradflow/habits/${id}`, { method: 'DELETE' }),
    saveHabitRecord: (record) => request('/gradflow/habit-records', { method: 'POST', body: JSON.stringify(record) }),
    rewards: () => request('/gradflow/rewards'),
    createReward: (reward) => request('/gradflow/rewards', { method: 'POST', body: JSON.stringify(reward) }),
    deleteReward: (id) => request(`/gradflow/rewards/${id}`, { method: 'DELETE' }),
    redeemReward: (redemption) =>
      request('/gradflow/reward-redemptions', { method: 'POST', body: JSON.stringify(redemption) }),
    rewardSummary: () => request('/gradflow/reward-summary'),
    expenses: () => request('/gradflow/expenses'),
    createExpense: (expense) => request('/gradflow/expenses', { method: 'POST', body: JSON.stringify(expense) }),
    deleteExpense: (id) => request(`/gradflow/expenses/${id}`, { method: 'DELETE' }),
    researchLogs: () => request('/gradflow/research-logs'),
    createResearchLog: (log) => request('/gradflow/research-logs', { method: 'POST', body: JSON.stringify(log) }),
    deleteResearchLog: (id) => request(`/gradflow/research-logs/${id}`, { method: 'DELETE' }),
    solveResearchItem: (id, item) => request(`/gradflow/research-logs/${id}/solve/${item}`, { method: 'PATCH' }),
    goals: () => request('/gradflow/goals'),
    createGoal: (goal) => request('/gradflow/goals', { method: 'POST', body: JSON.stringify(goal) }),
    deleteGoal: (id) => request(`/gradflow/goals/${id}`, { method: 'DELETE' }),
    calendarEvents: () => request('/gradflow/calendar-events'),
    createCalendarEvent: (event) =>
      request('/gradflow/calendar-events', { method: 'POST', body: JSON.stringify(event) }),
    deleteCalendarEvent: (id) => request(`/gradflow/calendar-events/${id}`, { method: 'DELETE' }),
    analytics: () => request('/gradflow/analytics'),
    parseLog: (payload) => request('/gradflow/ai/parse-log', { method: 'POST', body: JSON.stringify(payload) }),
  },
};
