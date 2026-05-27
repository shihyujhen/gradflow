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
import { Input, QuickForm, Textarea } from '../components/common.jsx';
import { ResearchHoursChart } from '../components/charts.jsx';

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

export {
  ResearchPage,
  ResearchQueueItem,
};
