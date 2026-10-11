import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKindnessPoints } from '../../hooks/useKindnessPoints';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { Star, Plus, Minus, Sparkles, RotateCcw, Trash2 } from 'lucide-react';

export const KindnessPointsTracker: React.FC = () => {
  const { profile, partnerProfile } = useAuth();
  const {
    azanPoints,
    sanaPoints,
    activities,
    addPoint,
    subtractPoint,
    deleteActivity,
    resetScores,
  } = useKindnessPoints();
  const { showToast } = useToast();

  const [noteInput, setNoteInput] = useState('');

  const handleAdd = (person: 'azan' | 'sana') => {
    const name = person === 'azan' ? 'Azan' : 'Sana';
    addPoint(person, noteInput);
    if (noteInput.trim()) {
      showToast(`+1 for ${name}: "${noteInput.trim()}" ⭐`, 'success');
      setNoteInput('');
    } else {
      showToast(`+1 Point for ${name}! ⭐`, 'success');
    }
  };

  const handleSubtract = (person: 'azan' | 'sana') => {
    const name = person === 'azan' ? 'Azan' : 'Sana';
    subtractPoint(person);
    showToast(`-1 for ${name}`, 'info');
  };

  const handleReset = () => {
    if (window.confirm('Reset both scores back to 0?')) {
      resetScores();
      showToast('Scores reset to 0 ✨', 'info');
    }
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="rounded-3xl p-5 sm:p-7 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h3 className="font-serif font-semibold text-lg sm:text-xl text-cream-900 dark:text-cream-50">
            Bestie Points
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] text-cream-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          title="Reset scores to 0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Two Clean Point Counters */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-5">
        {/* Azan Counter */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850/80 border border-cream-200/80 dark:border-cozydark-750 text-center flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-2">
              <Avatar
                name="Azan"
                url={profile?.display_name === 'Azan' ? profile?.avatar_url : partnerProfile?.avatar_url}
                size="md"
              />
            </div>
            <h4 className="font-serif font-semibold text-sm text-cream-900 dark:text-cream-100">
              Azan ☕
            </h4>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-amber-500 dark:text-amber-400 my-2">
              {azanPoints}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleSubtract('azan')}
              disabled={azanPoints <= 0}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cream-200/80 dark:bg-cozydark-750 text-cream-700 dark:text-cream-300 hover:bg-cream-300/80 transition-colors disabled:opacity-40"
              title="Subtract 1 point"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAdd('azan')}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Point</span>
            </button>
          </div>
        </div>

        {/* Sana Counter */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850/80 border border-cream-200/80 dark:border-cozydark-750 text-center flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-2">
              <Avatar
                name="Sana"
                url={profile?.display_name === 'Sana' ? profile?.avatar_url : partnerProfile?.avatar_url}
                size="md"
              />
            </div>
            <h4 className="font-serif font-semibold text-sm text-cream-900 dark:text-cream-100">
              Sana 🌸
            </h4>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-blush-500 dark:text-blush-400 my-2">
              {sanaPoints}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleSubtract('sana')}
              disabled={sanaPoints <= 0}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cream-200/80 dark:bg-cozydark-750 text-cream-700 dark:text-cream-300 hover:bg-cream-300/80 transition-colors disabled:opacity-40"
              title="Subtract 1 point"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAdd('sana')}
              className="flex-1 py-2 px-3 rounded-xl bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Point</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Quick Note Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Optional note: what did they do? (e.g. bought boba, made coffee...)"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/90 dark:border-cozydark-750 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-400"
        />
        <p className="text-[10px] text-cream-400 mt-1 pl-1">
          Tip: You can just tap <strong>+1 Point</strong> directly without writing anything!
        </p>
      </div>

      {/* Recent Points List */}
      {activities.length > 0 && (
        <div className="pt-3 border-t border-cream-200/70 dark:border-cozydark-800">
          <span className="text-[10px] uppercase font-semibold text-cream-500 tracking-wider block mb-2">
            Recent Points
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {activities.slice(0, 6).map((item) => {
              const isAzan = item.person === 'azan';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-cream-100/40 dark:bg-cozydark-850/40"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        isAzan
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-blush-100 text-blush-800 dark:bg-blush-950/70 dark:text-blush-300'
                      }`}
                    >
                      {isAzan ? 'Azan' : 'Sana'} {item.delta > 0 ? '+1' : '-1'}
                    </span>
                    <span className="text-cream-700 dark:text-cream-300 truncate">
                      {item.note || 'Kind deed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-cream-400">
                      {formatTime(item.timestamp)}
                    </span>
                    <button
                      onClick={() => deleteActivity(item.id)}
                      className="text-cream-300 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
