import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKindnessPoints } from '../../hooks/useKindnessPoints';
import { KindnessCategory } from '../../types/database';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import {
  Sparkles,
  Plus,
  Star,
  Coffee,
  Heart,
  Smile,
  BookOpen,
  Send,
  Trash2,
  Award,
  Zap,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  KindnessCategory,
  { label: string; icon: any; color: string }
> = {
  treat: { label: 'Treat & Food', icon: Coffee, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60' },
  support: { label: 'Support & Care', icon: Heart, color: 'text-rose-500 bg-rose-100 dark:bg-rose-950/60' },
  laughter: { label: 'Laughter & Fun', icon: Smile, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950/60' },
  help: { label: 'Help & Favor', icon: BookOpen, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950/60' },
  thoughtful: { label: 'Thoughtful Act', icon: Sparkles, color: 'text-blush-500 bg-blush-100 dark:bg-blush-950/60' },
  other: { label: 'Special Deed', icon: Star, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60' },
};

const QUICK_PRESETS = [
  { text: 'Made or bought coffee / matcha ☕', category: 'treat' as KindnessCategory, pts: 1 },
  { text: 'Surprise snack or boba run 🧋', category: 'treat' as KindnessCategory, pts: 1 },
  { text: 'Listened and cheered me up 🫂', category: 'support' as KindnessCategory, pts: 1 },
  { text: 'Made me laugh until my stomach hurt 😂', category: 'laughter' as KindnessCategory, pts: 1 },
  { text: 'Helped me out when I was busy or stressed 📚', category: 'help' as KindnessCategory, pts: 1 },
  { text: 'Sent a sweet daily check-in message 💌', category: 'thoughtful' as KindnessCategory, pts: 1 },
  { text: 'Remembered something small & cute ✨', category: 'thoughtful' as KindnessCategory, pts: 1 },
];

export const KindnessPointsTracker: React.FC = () => {
  const { profile, partnerProfile } = useAuth();
  const {
    entries,
    azanPoints,
    sanaPoints,
    totalKindnesses,
    awardPoints,
    deleteEntry,
  } = useKindnessPoints();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRecipient, setTargetRecipient] = useState<'azan' | 'sana'>('sana');
  const [reason, setReason] = useState('');
  const [pointsCount, setPointsCount] = useState(1);
  const [category, setCategory] = useState<KindnessCategory>('thoughtful');

  // Identify IDs
  const azanId = 'user-azan-001';
  const sanaId = 'user-sana-002';
  const myId = profile?.id || azanId;

  const handleOpenAwardModal = (recipient: 'azan' | 'sana') => {
    setTargetRecipient(recipient);
    setReason('');
    setPointsCount(1);
    setCategory('thoughtful');
    setIsModalOpen(true);
  };

  const handleQuickAdd = async (recipient: 'azan' | 'sana', text: string, cat: KindnessCategory, pts = 1) => {
    const recId = recipient === 'azan' ? azanId : sanaId;
    const name = recipient === 'azan' ? 'Azan' : 'Sana';
    await awardPoints(recId, myId, pts, text, cat);
    showToast(`+${pts} Point awarded to ${name}! ⭐✨`, 'success');
  };

  const handleSubmitCustomAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please describe the nice deed', 'error');
      return;
    }

    const recId = targetRecipient === 'azan' ? azanId : sanaId;
    const name = targetRecipient === 'azan' ? 'Azan' : 'Sana';
    await awardPoints(recId, myId, pointsCount, reason.trim(), category);
    showToast(`+${pointsCount} Point awarded to ${name}! ⭐✨`, 'success');
    setIsModalOpen(false);
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⭐</span>
            <h3 className="font-serif font-semibold text-lg sm:text-xl text-cream-900 dark:text-cream-50">
              Bestie Kindness Points
            </h3>
          </div>
          <p className="text-xs text-cream-500 dark:text-cream-400 font-light">
            Whenever either of us does something sweet, the other gives a point! Controlled by both of us.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blush-100/80 dark:bg-blush-950/70 border border-blush-200 dark:border-blush-800 text-[11px] font-medium text-blush-700 dark:text-blush-300">
            {totalKindnesses} sweet deeds logged ✨
          </span>
        </div>
      </div>

      {/* Two Parallel Scoreboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Azan's Points Card */}
        <div className="relative p-5 rounded-3xl bg-cream-100/70 dark:bg-cozydark-850/80 border border-cream-200/90 dark:border-cozydark-750 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                name="Azan"
                url={profile?.id === azanId ? profile?.avatar_url : partnerProfile?.avatar_url}
                size="md"
              />
              <div>
                <h4 className="font-serif font-semibold text-sm text-cream-900 dark:text-cream-100">
                  Azan
                </h4>
                <span className="text-[10px] text-cream-500 dark:text-cream-400 font-medium">
                  Warm Bestie ☕
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif text-3xl font-bold text-amber-500 dark:text-amber-400 flex items-center justify-end gap-1">
                <span>{azanPoints}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
              </div>
              <span className="text-[10px] text-cream-400 dark:text-cream-500 uppercase tracking-wider font-medium">
                Points
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-750 flex items-center justify-between">
            <span className="text-[11px] text-cream-500 dark:text-cream-400">
              Did something nice?
            </span>
            <button
              onClick={() => handleOpenAwardModal('azan')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Give Azan a Point</span>
            </button>
          </div>
        </div>

        {/* Sana's Points Card */}
        <div className="relative p-5 rounded-3xl bg-cream-100/70 dark:bg-cozydark-850/80 border border-cream-200/90 dark:border-cozydark-750 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                name="Sana"
                url={profile?.id === sanaId ? profile?.avatar_url : partnerProfile?.avatar_url}
                size="md"
              />
              <div>
                <h4 className="font-serif font-semibold text-sm text-cream-900 dark:text-cream-100">
                  Sana
                </h4>
                <span className="text-[10px] text-cream-500 dark:text-cream-400 font-medium">
                  Sweet Bestie 🌸
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif text-3xl font-bold text-blush-500 dark:text-blush-400 flex items-center justify-end gap-1">
                <span>{sanaPoints}</span>
                <Sparkles className="w-5 h-5 text-blush-400 inline" />
              </div>
              <span className="text-[10px] text-cream-400 dark:text-cream-500 uppercase tracking-wider font-medium">
                Points
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-750 flex items-center justify-between">
            <span className="text-[11px] text-cream-500 dark:text-cream-400">
              Did something nice?
            </span>
            <button
              onClick={() => handleOpenAwardModal('sana')}
              className="px-3 py-1.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-medium text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Give Sana a Point</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Suggestions Bar */}
      <div className="mb-6">
        <label className="block text-[11px] font-medium text-cream-600 dark:text-cream-400 mb-2">
          ⚡ Quick 1-Click Points:
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.slice(0, 5).map((preset, idx) => (
            <div
              key={idx}
              className="inline-flex items-center rounded-xl bg-cream-200/60 dark:bg-cozydark-800 border border-cream-300/60 dark:border-cozydark-700 text-xs overflow-hidden"
            >
              <span className="px-2.5 py-1 text-cream-800 dark:text-cream-200 text-[11px]">
                {preset.text}
              </span>
              <button
                onClick={() => handleQuickAdd('sana', preset.text, preset.category, preset.pts)}
                className="px-2 py-1 bg-blush-100 hover:bg-blush-200 dark:bg-blush-950/70 text-blush-700 dark:text-blush-300 text-[10px] font-bold border-l border-cream-300/60 dark:border-cozydark-700"
                title="Give to Sana"
              >
                +1 Sana
              </button>
              <button
                onClick={() => handleQuickAdd('azan', preset.text, preset.category, preset.pts)}
                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 text-[10px] font-bold border-l border-cream-300/60 dark:border-cozydark-700"
                title="Give to Azan"
              >
                +1 Azan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Kindness Log */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Kindness History Log</span>
        </h4>

        {entries.length === 0 ? (
          <div className="py-8 text-center text-cream-400 dark:text-cream-500 bg-cream-100/40 dark:bg-cozydark-850/40 rounded-2xl border border-cream-200/60 dark:border-cozydark-800">
            <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-60 text-blush-400" />
            <p className="text-xs font-medium">No points logged yet!</p>
            <p className="text-[11px] opacity-75">Tap a button above whenever someone does something nice.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const isAzanRecipient = entry.recipient_id === azanId;
              const catConfig = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.other;
              const Icon = catConfig.icon;

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-cream-100/50 dark:bg-cozydark-850/60 border border-cream-200/80 dark:border-cozydark-750 transition-all hover:bg-cream-100/80 dark:hover:bg-cozydark-800"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Category Icon Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${catConfig.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isAzanRecipient
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200'
                            : 'bg-blush-100 text-blush-800 dark:bg-blush-950/80 dark:text-blush-200'
                        }`}>
                          {isAzanRecipient ? 'Azan' : 'Sana'} +{entry.points}
                        </span>
                        <span className="text-[10px] text-cream-400 dark:text-cream-500">
                          {formatRelativeTime(entry.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-cream-800 dark:text-cream-100 font-medium truncate mt-0.5">
                        {entry.reason}
                      </p>
                    </div>
                  </div>

                  {/* Delete button (Controlled by both of us) */}
                  <button
                    onClick={() => {
                      if (confirm('Delete this point entry?')) {
                        deleteEntry(entry.id);
                        showToast('Entry removed', 'info');
                      }
                    }}
                    className="p-1.5 text-cream-400 hover:text-rose-500 transition-colors ml-2"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Award Point Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Award Kindness Points to {targetRecipient === 'azan' ? 'Azan' : 'Sana'}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmitCustomAward} className="space-y-4 pt-1">
          {/* Recipient Switcher */}
          <div>
            <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1.5">
              Who did something nice?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-cream-200/60 dark:bg-cozydark-850 border border-cream-300/60 dark:border-cozydark-750">
              <button
                type="button"
                onClick={() => setTargetRecipient('sana')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  targetRecipient === 'sana'
                    ? 'bg-blush-500 text-white shadow-xs'
                    : 'text-cream-600 dark:text-cream-400'
                }`}
              >
                Sana 🌸
              </button>
              <button
                type="button"
                onClick={() => setTargetRecipient('azan')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  targetRecipient === 'azan'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-cream-600 dark:text-cream-400'
                }`}
              >
                Azan ☕
              </button>
            </div>
          </div>

          {/* Points Amount */}
          <div>
            <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1.5">
              Points to Award:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPointsCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    pointsCount === num
                      ? 'bg-cream-900 text-cream-50 dark:bg-cream-50 dark:text-cream-950 border-transparent shadow-xs'
                      : 'bg-white dark:bg-cozydark-800 border-cream-300/70 dark:border-cozydark-700 text-cream-700 dark:text-cream-300'
                  }`}
                >
                  +{num} {num === 1 ? 'Point' : 'Points'}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1.5">
              What did they do?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Made morning coffee, sent a sweet reminder..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-blush-400"
            />

            {/* Preset shortcuts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setReason(p.text);
                    setCategory(p.category);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-cream-200/70 dark:bg-cozydark-800 text-[10px] text-cream-700 dark:text-cream-300 hover:bg-cream-300/70 transition-colors"
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as KindnessCategory[]).map((catKey) => {
                const conf = CATEGORY_CONFIG[catKey];
                const Icon = conf.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 rounded-xl border text-center text-[11px] font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-cream-100 dark:bg-cozydark-800 border-blush-400 text-blush-600 dark:text-blush-300 font-semibold ring-1 ring-blush-400'
                        : 'bg-white dark:bg-cozydark-850 border-cream-200 dark:border-cozydark-750 text-cream-600 dark:text-cream-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{conf.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-cream-600 dark:text-cream-300 text-xs hover:bg-cream-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium shadow-cozy transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Award Points</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
