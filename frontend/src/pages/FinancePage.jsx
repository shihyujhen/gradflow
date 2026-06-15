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
import { Input, Metric, QuickForm, Select } from '../components/common.jsx';
import { CategoryPie, FinanceTrendChart, MoneyBar, TransactionRow } from '../components/charts.jsx';

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

export {
  FinancePage,
};
