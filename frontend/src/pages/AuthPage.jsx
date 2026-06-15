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

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitAuth(event) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      setAuthError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setAuthError('Password confirmation does not match.');
        setSubmitting(false);
        return;
      }
    }
    try {
      const account =
        mode === 'register'
          ? await api.auth.register({ email, password: form.password })
          : await api.auth.login({ email, password: form.password });
      onAuth({ mode: 'account', email: account.email });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          <button className="primary-button" disabled={submitting}>
            <Check size={16} />
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
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

export {
  AuthPage,
};
