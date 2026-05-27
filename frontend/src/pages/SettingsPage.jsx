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
import { Input } from '../components/common.jsx';
import { AvatarEditor } from '../components/AvatarEditor.jsx';

function SettingsPage({ profileSettings, setProfileSettings, setMessage, onClose, authSession, reportData }) {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [draftProfile, setDraftProfile] = useState(profileSettings);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);

  async function saveSettings() {
    if (passwordForm.next && passwordForm.next !== passwordForm.confirm) {
      setMessage('Password confirmation does not match.');
      return;
    }
    if (passwordForm.next && !passwordForm.current) {
      setMessage('Current password is required.');
      return;
    }
    if (passwordForm.next && authSession?.mode !== 'guest') {
      try {
        await api.auth.changePassword({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        });
      } catch (err) {
        setMessage(err.message);
        return;
      }
    }
    const nextProfile = {
      ...draftProfile,
      passwordUpdatedAt: passwordForm.next ? new Date().toISOString() : profileSettings.passwordUpdatedAt,
    };
    setProfileSettings(nextProfile);
    if (authSession?.mode !== 'guest') {
      localStorage.setItem('gradflow.profileSettings', JSON.stringify(nextProfile));
    }
    setPasswordForm({ current: '', next: '', confirm: '' });
    setMessage('Settings saved.');
    onClose();
  }
  async function sendReminder() {
    try {
      setMessage('提醒寄送中...');
      const response = await fetch(
        'https://ayfewyrj6dnzxpo3mco2piqpqi0ekgfe.lambda-url.ap-northeast-1.on.aws/',
        { method: 'POST' },
      );
      if (!response.ok) throw new Error('寄送失敗');
      const data = await response.json();
      setMessage(data.message || '提醒已寄出，請查看信箱。');
    } catch (err) {
      setMessage('提醒寄送失敗：' + err.message);
    }
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
            <button type="button" className="secondary-button" onClick={sendReminder}>
              寄送今日提醒到信箱
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

export {
  SettingsPage,
};
