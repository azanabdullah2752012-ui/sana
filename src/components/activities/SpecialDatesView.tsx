import React, { useState } from 'react';
import { useSpecialDates } from '../../hooks/useSpecialDates';
import { SpecialDateCategory } from '../../types/database';
import { Calendar, Plus, Trash2, Heart, Gift, Compass } from 'lucide-react';
import { useToast } from '../common/Toast';

const CATEGORIES: { id: SpecialDateCategory; label: string; icon: any }[] = [
  { id: 'birthday', label: 'Birthday', icon: Gift },
  { id: 'anniversary', label: 'Anniversary', icon: Heart },
  { id: 'trip', label: 'Trip / Getaway', icon: Compass },
  { id: 'milestone', label: 'Milestone', icon: Calendar },
  { id: 'reminder', label: 'Reminder', icon: Calendar },
];

export const SpecialDatesView: React.FC = () => {
  const { dates, loading, addDate, deleteDate, getDaysUntil } = useSpecialDates();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SpecialDateCategory>('milestone');
  const [isRecurring, setIsRecurring] = useState(true);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    await addDate({
      title: title.trim(),
      event_date: eventDate,
      description: description.trim() || undefined,
      category,
      is_recurring_yearly: isRecurring,
    });

    setTitle('');
    setEventDate('');
    setDescription('');
    setIsAdding(false);
    showToast('Special date saved! 📅✨', 'success');
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-800 shadow-cozy dark:shadow-cozy-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <div>
            <h3 className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50">
              Important Dates &amp; Countdowns
            </h3>
            <p className="text-xs text-cream-500 dark:text-cream-400 font-light">
              Never forget birthdays, anniversaries, and planned getaways.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white shadow-sm transition-transform active:scale-95"
          title="Add date"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-4 mb-5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 space-y-3 animate-slide-up"
        >
          <input
            type="text"
            required
            placeholder="Event name (e.g. Sana's Birthday, Cabin Trip)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-1 focus:ring-blush-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-1 focus:ring-blush-300"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SpecialDateCategory)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-cream-700 dark:text-cream-300">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded text-blush-500"
            />
            <span>Repeats annually (like birthdays &amp; anniversaries)</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-cream-500 dark:text-cream-400 hover:bg-cream-200 dark:hover:bg-cozydark-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium shadow-sm transition-colors"
            >
              Save Date
            </button>
          </div>
        </form>
      )}

      {/* Dates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dates.map((d) => {
          const daysLeft = getDaysUntil(d.event_date, d.is_recurring_yearly);
          return (
            <div
              key={d.id}
              className="p-4 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-800 flex items-center justify-between gap-3 group"
            >
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-blush-600 dark:text-blush-300 block mb-0.5">
                  {d.category}
                </span>
                <h4 className="font-serif font-medium text-sm text-cream-900 dark:text-cream-100">
                  {d.title}
                </h4>
                <p className="text-[11px] text-cream-500 dark:text-cream-400 font-light">
                  {d.event_date} {d.is_recurring_yearly && '• Repeats yearly'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-lg font-serif font-bold text-blush-600 dark:text-blush-300 block leading-tight">
                    {daysLeft === 0 ? 'Today! 🎉' : `${daysLeft}d`}
                  </span>
                  <span className="text-[9px] text-cream-400 block uppercase">
                    {daysLeft === 0 ? 'Celebrate' : 'Remaining'}
                  </span>
                </div>

                <button
                  onClick={() => deleteDate(d.id)}
                  className="p-1 text-cream-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
