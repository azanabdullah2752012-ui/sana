import React, { useState } from 'react';
import { useDailyPrompt } from '../../hooks/useDailyPrompt';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../common/Avatar';
import { Sparkles, MessageCircle, Check, Send, Heart, Coffee } from 'lucide-react';
import { useToast } from '../common/Toast';

export const DailyPromptWidget: React.FC = () => {
  const { profile, partnerProfile } = useAuth();
  const {
    prompt,
    answers,
    loading,
    isSubmitting,
    userAnswerText,
    setUserAnswerText,
    submitAnswer,
    myAnswer,
    partnerAnswer,
  } = useDailyPrompt();
  const { showToast } = useToast();

  const [inputVal, setInputVal] = useState(userAnswerText || '');
  const [isEditing, setIsEditing] = useState(false);

  // Sync initial inputVal
  React.useEffect(() => {
    if (userAnswerText && !inputVal) {
      setInputVal(userAnswerText);
    }
  }, [userAnswerText, inputVal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    await submitAnswer(inputVal.trim());
    setIsEditing(false);
    showToast('Your daily thought was recorded! 🌸', 'success');
  };

  const bothAnswered = myAnswer && partnerAnswer;

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blush-200/20 dark:bg-blush-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blush-100 dark:bg-blush-950/60 text-blush-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-base text-cream-900 dark:text-cream-50">
              Today's Cozy Reflection
            </h3>
            <p className="text-[10px] text-cream-500 dark:text-cream-400">
              A shared question to answer every morning
            </p>
          </div>
        </div>

        {bothAnswered && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            <Heart className="w-3 h-3 fill-emerald-500" />
            <span>Both Answered!</span>
          </span>
        )}
      </div>

      {/* Question */}
      <div className="mb-6 p-4 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/70 dark:border-cozydark-750">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-blush-600 dark:text-blush-300 block mb-1">
          {prompt?.category || 'Question of the day'}
        </span>
        <p className="font-serif text-lg text-cream-900 dark:text-cream-100 leading-snug">
          "{prompt?.question || 'What is a small, quiet moment this week that made you smile?'}"
        </p>
      </div>

      {/* Answers Display & Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Current User's Answer Card */}
        <div className="p-4 rounded-2xl bg-cream-100/40 dark:bg-cozydark-850/60 border border-cream-200/60 dark:border-cozydark-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar
                  name={profile?.display_name || 'You'}
                  url={profile?.avatar_url}
                  size="xs"
                />
                <span className="text-xs font-semibold text-cream-800 dark:text-cream-200">
                  Your Answer
                </span>
              </div>

              {myAnswer && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] text-blush-500 hover:text-blush-600 dark:text-blush-300 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {myAnswer && !isEditing ? (
              <p className="text-xs text-cream-700 dark:text-cream-300 leading-relaxed font-light italic">
                "{myAnswer.answer}"
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type your reflection here..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 focus:outline-none focus:ring-1 focus:ring-blush-400"
                />
                <div className="flex justify-end gap-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 rounded-xl text-xs text-cream-500 dark:text-cream-400 hover:bg-cream-200 dark:hover:bg-cozydark-750 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !inputVal.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{myAnswer ? 'Update' : 'Share Reflection'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Partner's Answer Card */}
        <div className="p-4 rounded-2xl bg-cream-100/40 dark:bg-cozydark-850/60 border border-cream-200/60 dark:border-cozydark-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                name={partnerProfile?.display_name || 'Bestie'}
                url={partnerProfile?.avatar_url}
                size="xs"
              />
              <span className="text-xs font-semibold text-cream-800 dark:text-cream-200">
                {partnerProfile?.display_name || 'Bestie'}'s Answer
              </span>
            </div>

            {partnerAnswer ? (
              <p className="text-xs text-cream-700 dark:text-cream-300 leading-relaxed font-light italic">
                "{partnerAnswer.answer}"
              </p>
            ) : (
              <div className="py-5 text-center text-cream-400 dark:text-cream-500">
                <Coffee className="w-5 h-5 mx-auto mb-1 opacity-70" />
                <p className="text-xs font-serif">
                  Waiting for {partnerProfile?.display_name || 'Sana'}'s thought...
                </p>
                <p className="text-[10px] opacity-70">
                  Their answer will appear here once shared!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
