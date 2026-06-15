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

export {
  ResearchHoursChart,
  buildResearchHourPoints,
  MoneyBar,
  CategoryPie,
  FinanceTrendChart,
  TransactionRow,
};
