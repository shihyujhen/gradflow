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
import { IconPicker } from '../components/habitControls.jsx';

function RewardsPage({ rewardForm, setRewardForm, rewards, rewardSummary, run }) {
  return (
    <>
      <div className="reward-points-line">✨ Current Points: {rewardSummary?.currentPoints ?? 0}</div>
      <section className="reward-page-grid">
        <section className="panel reward-pool-panel">
          <div className="panel-heading">
            <Gift size={18} />
            <h2>Reward Pool</h2>
          </div>
          <form
            className="reward-pool-form"
            onSubmit={(event) => {
              event.preventDefault();
              run(
                () => api.gradflow.createReward({ ...rewardForm, pointCost: Number(rewardForm.pointCost) }),
                'Reward added.',
              ).then(() => setRewardForm(emptyReward));
            }}
          >
            <IconPicker
              label="Icon"
              value={rewardForm.icon}
              onChange={(icon) => setRewardForm({ ...rewardForm, icon })}
              options={rewardIcons}
            />
            <div className="reward-pool-fields">
              <Input
                label="Reward"
                value={rewardForm.name}
                onChange={(name) => setRewardForm({ ...rewardForm, name })}
                placeholder="Big dinner"
                required
              />
              <Input
                label="Points to redeem"
                type="number"
                min="1"
                value={rewardForm.pointCost}
                onChange={(pointCost) => setRewardForm({ ...rewardForm, pointCost })}
              />
            </div>
            <button className="secondary-button reward-add-button">
              <Plus size={16} />
              Add Reward
            </button>
          </form>
        </section>
        <section className="panel reward-column-panel">
          <div className="panel-heading">
            <Gift size={18} />
            <h2>Choose Reward</h2>
          </div>
          {rewards.length ? (
            <div className="reward-grid scroll-list">
              {rewards.map((reward) => {
                const canRedeem = (rewardSummary?.currentPoints ?? 0) >= reward.pointCost;
                return (
                  <article className={`reward-card ${canRedeem ? '' : 'locked'}`} key={reward.id}>
                    <div className="reward-icon">{reward.icon || '✨'}</div>
                    <div className="reward-copy">
                      <strong>{reward.name}</strong>
                      <span>{reward.pointCost} points</span>
                    </div>
                    <div className="reward-actions">
                      <button
                        className="secondary-button"
                        disabled={!canRedeem}
                        onClick={() =>
                          run(
                            () => api.gradflow.redeemReward({ rewardId: reward.id, redeemedDate: today }),
                            'Reward redeemed.',
                          )
                        }
                      >
                        Redeem
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => run(() => api.gradflow.deleteReward(reward.id), 'Reward deleted.')}
                        title="Delete reward"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty reward-empty">Please add reward settings below.</p>
          )}
        </section>
        <section className="panel reward-column-panel">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Redeemed History</h2>
          </div>
          <div className="list-stack scroll-list">
            {(rewardSummary?.redemptions ?? []).map((redemption) => (
              <article className="reward-card reward-history-row" key={redemption.id}>
                <div className="reward-icon">{redemption.icon || '✨'}</div>
                <div className="reward-copy">
                  <strong>{redemption.name}</strong>
                  <span>
                    {redemption.pointCost} pts · {formatDate(redemption.redeemedDate)}
                  </span>
                </div>
              </article>
            ))}
            {!(rewardSummary?.redemptions ?? []).length && <p className="muted">No rewards redeemed yet.</p>}
          </div>
        </section>
      </section>
    </>
  );
}

export {
  RewardsPage,
};
