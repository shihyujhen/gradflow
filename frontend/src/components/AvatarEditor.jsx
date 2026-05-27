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
import { Input } from './common.jsx';

function AvatarEditor({ profileSettings, setProfileSettings, setMessage, onClose, deferMessage = false }) {
  const [avatarDraft, setAvatarDraft] = useState(profileSettings.avatar);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarContrast, setAvatarContrast] = useState(100);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  function updateAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarDraft(reader.result);
    reader.readAsDataURL(file);
  }

  function saveAvatar() {
  if (!avatarDraft) {
    setProfileSettings({ ...profileSettings, avatar: '' });
    setMessage('Avatar removed.');
    onClose();
    return;
  }

  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');
  const image = new Image();

  image.onload = () => {
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const sourceSize = Math.min(image.width, image.height) / avatarZoom;
    const sx = (image.width - sourceSize) / 2;
    const sy = (image.height - sourceSize) / 2;

    context.clearRect(0, 0, size, size);
    context.filter = `contrast(${avatarContrast}%)`;
    context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMessage('Avatar upload failed.');
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, `avatar-${Date.now()}.png`);

      try {
        setAvatarUploading(true);

        const response = await fetch('/api/gradflow/upload', {
          method: 'POST',
          headers: {
            'X-User-Email': 'demo@gradflow.local',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Avatar upload failed.');
        }

        const s3Url = await response.text();

        setProfileSettings({ ...profileSettings, avatar: s3Url });
        if (!deferMessage) setMessage('Avatar uploaded to S3.');
        onClose();
      } catch (error) {
        console.error('Avatar upload failed:', error);
        setMessage('Avatar upload failed.');
      } finally {
        setAvatarUploading(false);
      }
    }, 'image/png');
  };

  image.src = avatarDraft;
}

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="avatar-dialog" role="dialog" aria-modal="true" aria-label="Upload avatar">
        <div className="overview-card-head">
          <div className="panel-heading">
            <Upload size={18} />
            <h2>Avatar</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        <button type="button" className="profile-avatar-preview avatar-click-target" onClick={() => fileInputRef.current?.click()}>
          {avatarDraft ? (
            <img
              src={avatarDraft}
              alt="Profile avatar draft"
              style={{ transform: `scale(${avatarZoom})`, filter: `contrast(${avatarContrast}%)` }}
            />
          ) : (
            <span>{profileSettings.displayName.slice(0, 2).toUpperCase()}</span>
          )}
        </button>
        <input ref={fileInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={updateAvatar} />
        <div className="two-col">
          <Input
            label="Crop zoom"
            type="range"
            min="1"
            max="2.4"
            step="0.1"
            value={avatarZoom}
            onChange={(value) => setAvatarZoom(Number(value))}
          />
          <Input
            label="Contrast"
            type="range"
            min="70"
            max="150"
            step="5"
            value={avatarContrast}
            onChange={(value) => setAvatarContrast(Number(value))}
          />
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={() => setAvatarDraft('')}>
            Remove
          </button>
          <button type="button" className="primary-button" onClick={saveAvatar} disabled={avatarUploading}>
            <Check size={16} />
            {avatarUploading ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
        <canvas ref={canvasRef} className="avatar-canvas" />
      </section>
    </div>
  );
}

export {
  AvatarEditor,
};
