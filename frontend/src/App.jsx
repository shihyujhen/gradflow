import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { api } from './api.js';
import {
  defaultGoalCategories,
  emptyDaily,
  emptyEvent,
  emptyExpense,
  emptyGoal,
  emptyHabit,
  emptyResearch,
  emptyReward,
  emptyTask,
  estimateSleepHours,
  navItems,
  readAuthSession,
  readProfileSettings,
  readTodaySettings,
  uniqueList,
  writeProfileSettings,
} from './appData.jsx';
import {
  AuthPage,
  CalendarPage,
  ConfirmDialog,
  FinancePage,
  GoalsPage,
  HabitsPage,
  Overview,
  ResearchPage,
  RewardsPage,
  SettingsPage,
  TasksPage,
  TodayPage,
} from './components.jsx';

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
  const [profileSettings, setProfileSettings] = useState(() => readProfileSettings(readAuthSession()));
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
      api.gradflow.habits(dailyForm.logDate),
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
    if (!authSession) return;
    api.gradflow.habits(dailyForm.logDate).then(setHabits).catch((err) => setError(err.message));
  }, [authSession?.mode, authSession?.email, dailyForm.logDate]);

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
      const loaded = readProfileSettings(session);
      const nextProfile = {
        ...loaded,
        displayName:
          loaded.displayName && loaded.displayName !== 'Graduate Student'
            ? loaded.displayName
            : session.email.split('@')[0] || loaded.displayName,
      };
      setProfileSettings(nextProfile);
      writeProfileSettings(session, nextProfile);
    } else {
      localStorage.removeItem('gradflow.authSession');
      setProfileSettings(readProfileSettings(session));
    }
  }

  function logout() {
    localStorage.removeItem('gradflow.authSession');
    setAuthSession(null);
    setProfileSettings(readProfileSettings(null));
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

export default App;
