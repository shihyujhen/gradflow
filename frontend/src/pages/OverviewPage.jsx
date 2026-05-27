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
import { InsightNote, Textarea } from '../components/common.jsx';

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

export {
  Overview,
  AiLogAssistant,
};
