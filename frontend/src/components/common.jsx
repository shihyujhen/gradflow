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

function InsightNote({ text }) {
  return (
    <p className="overview-insight">
      <Sparkles size={15} />
      {text}
    </p>
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

export {
  InsightNote,
  FacePicker,
  ConfirmDialog,
  CategoryDialog,
  DetailGrid,
  Input,
  Select,
  Textarea,
  Metric,
  QuickForm,
  LogList,
  TaskTable,
};
