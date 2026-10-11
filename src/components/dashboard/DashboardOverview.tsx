import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMemories } from '../../hooks/useMemories';
import { useNotes } from '../../hooks/useNotes';
import { useSpecialDates } from '../../hooks/useSpecialDates';
import { useDailyPrompt } from '../../hooks/useDailyPrompt';
import { Avatar } from '../common/Avatar';
import { ActiveTab } from '../common/Navbar';
import { QuestionGeneratorModal } from '../activities/QuestionGeneratorModal';
import {
  Heart,
  MessageCircle,
  Camera,
  BookOpen,
  Sparkles,
  Calendar,
  Coffee,
  ArrowRight,
  Send,
  Pin,
} from 'lucide-react';

interface DashboardOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSendToChat?: (text: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  onSendToChat,
}) => {
  const { profile, partnerProfile, isPartnerOnline } = useAuth();
  const { memories } = useMemories();
  const { notes } = useNotes();
  const { dates, getDaysUntil } = useSpecialDates();
  const { prompt, myAnswer, partnerAnswer } = useDailyPrompt();
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Find next upcoming date
  const sortedDates = [...dates].sort((a, b) => {
    return getDaysUntil(a.event_date, a.is_recurring_yearly) - getDaysUntil(b.event_date, b.is_recurring_yearly);
  });
  const nextDate = sortedDates[0];
  const daysUntilNext = nextDate ? getDaysUntil(nextDate.event_date, nextDate.is_recurring_yearly) : null;

  const recentMemories = memories.slice(0, 3);
  const pinnedNotes = notes.filter((n) => n.is_pinned).slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative rounded-4xl p-7 sm:p-9 bg-gradient-to-br from-cream-50 via-blush-50/60 to-lavender-50/50 dark:from-cozydark-900 dark:via-blush-950/20 dark:to-lavender-950/20 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark overflow-hidden">
        {/* Soft Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blush-200/25 dark:bg-blush-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100/90 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300 text-xs font-medium mb-3 border border-blush-100 dark:border-cozydark-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanctuary for two best friends</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-cream-900 dark:text-cream-50 font-semibold mb-2 tracking-tight">
              {getGreetingTime()},{' '}
              <span className="text-blush-500 dark:text-blush-300">
                {profile?.display_name || 'Friend'}
              </span>{' '}
              ☕✨
            </h1>

            <p className="text-xs sm:text-sm text-cream-600 dark:text-cream-300 font-light leading-relaxed">
              {partnerProfile ? (
                <>
                  Connected with your bestie <strong>{partnerProfile.display_name}</strong>. Everything you share here is private, synchronized in real time, and protected by PostgreSQL Row Level Security.
                </>
              ) : (
                'Welcome to your private best friends space. Start a conversation or save a memory.'
              )}
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap gap-2.5 mt-5">
              <button
                onClick={() => setActiveTab('chat')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium shadow-cozy transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('memories')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-cream-100/90 dark:bg-cozydark-850 text-cream-800 dark:text-cream-200 border border-cream-200 dark:border-cozydark-700 hover:bg-cream-200/80 text-xs font-medium transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blush-400" />
                <span>Scrapbook</span>
              </button>

              <button
                onClick={() => setQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-cream-100/90 dark:bg-cozydark-850 text-cream-800 dark:text-cream-200 border border-cream-200 dark:border-cozydark-700 hover:bg-cream-200/80 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-lavender-400" />
                <span>Daily Prompt</span>
              </button>
            </div>
          </div>

          {/* Partner Presence Card */}
          {partnerProfile && (
            <div className="p-5 rounded-3xl bg-cream-50/90 dark:bg-cozydark-850/90 border border-cream-200/90 dark:border-cozydark-750 shadow-sm flex flex-col justify-between max-w-sm w-full">
              <div className="flex items-center gap-3.5 mb-3">
                <Avatar
                  name={partnerProfile.display_name}
                  url={partnerProfile.avatar_url}
                  size="lg"
                  showStatus={true}
                  isOnline={isPartnerOnline}
                />
                <div>
                  <h3 className="font-serif font-semibold text-base text-cream-900 dark:text-cream-50 flex items-center gap-1.5">
                    {partnerProfile.display_name}
                    <Sparkles className="w-3.5 h-3.5 text-blush-400" />
                  </h3>
                  <p className="text-[11px] text-cream-500 dark:text-cream-400 leading-tight">
                    {partnerProfile.bio || 'Best friends sharing cozy moments ✨'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-800 flex items-center justify-between text-xs">
                {isPartnerOnline ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online &amp; Active
                  </span>
                ) : (
                  <span className="text-[11px] text-cream-500 dark:text-cream-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cream-400 dark:bg-cozydark-600" />
                    Offline
                  </span>
                )}

                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-xs text-blush-500 hover:text-blush-600 dark:text-blush-300 font-medium flex items-center gap-1"
                >
                  <span>Chat now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Row: Today's Reflection Teaser & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Reflection Teaser (2 cols) */}
        <div className="md:col-span-2 rounded-3xl p-6 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blush-600 dark:text-blush-300 px-2.5 py-0.5 rounded-full bg-blush-100/70 dark:bg-blush-950/60 border border-blush-200/60 dark:border-blush-800">
                Today's Question
              </span>

              <button
                onClick={() => setActiveTab('activities')}
                className="text-xs text-blush-500 hover:text-blush-600 dark:text-blush-300 font-medium flex items-center gap-1"
              >
                <span>View answers</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <h3 className="font-serif text-lg font-medium text-cream-900 dark:text-cream-100 mb-2 leading-snug">
              "{prompt?.question || 'What is a quiet, simple thing from this week that made you unexpectedly happy?'}"
            </h3>

            <p className="text-xs text-cream-600 dark:text-cream-400 font-light">
              {myAnswer ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ You answered today! {partnerAnswer ? `Both of you have shared your thoughts.` : `Waiting for your bestie ${partnerProfile?.display_name || 'Sana'}.`}
                </span>
              ) : (
                'You haven\'t answered today\'s question yet! Take 30 seconds to reflect.'
              )}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-cream-200/60 dark:border-cozydark-800 flex items-center justify-between">
            <span className="text-xs text-cream-500 dark:text-cream-400">
              Category: {prompt?.category || 'cozy reflection'}
            </span>
            <button
              onClick={() => setActiveTab('activities')}
              className="px-4 py-1.5 rounded-xl bg-blush-100 hover:bg-blush-200 text-blush-800 dark:bg-blush-950 dark:text-blush-200 text-xs font-medium transition-colors"
            >
              {myAnswer ? 'See Answers 💬' : 'Write Answer ✍️'}
            </button>
          </div>
        </div>

        {/* Upcoming Countdown Card (1 col) */}
        <div className="rounded-3xl p-6 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blush-400" />
              <h3 className="font-serif font-semibold text-sm text-cream-900 dark:text-cream-50">
                Next Countdown
              </h3>
            </div>

            {nextDate ? (
              <div className="my-2">
                <span className="font-serif text-3xl font-bold text-blush-500 dark:text-blush-300 block">
                  {daysUntilNext === 0 ? 'Today! 🎉' : `${daysUntilNext} days`}
                </span>
                <p className="text-sm font-medium text-cream-800 dark:text-cream-200 mt-1">
                  {nextDate.title}
                </p>
                <p className="text-[11px] text-cream-500 dark:text-cream-400 font-light">
                  {nextDate.event_date}
                </p>
              </div>
            ) : (
              <div className="py-4 text-xs text-cream-400">
                No countdowns scheduled yet.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('activities')}
            className="w-full py-2 rounded-xl bg-cream-100 dark:bg-cozydark-850 hover:bg-cream-200 dark:hover:bg-cozydark-800 text-cream-700 dark:text-cream-300 text-xs font-medium text-center transition-colors"
          >
            All Dates &amp; Milestones
          </button>
        </div>
      </div>

      {/* 3. Recent Memories Scrapbook Snippet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📷</span>
            <h3 className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50">
              Recent Memories
            </h3>
          </div>

          <button
            onClick={() => setActiveTab('memories')}
            className="text-xs text-blush-500 hover:text-blush-600 dark:text-blush-300 font-medium flex items-center gap-1"
          >
            <span>Open Scrapbook</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-cream-50/50 dark:bg-cozydark-900/50 border border-cream-200 dark:border-cozydark-800 text-xs text-cream-400">
            No memories added yet. Upload your first photo in the Scrapbook tab!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentMemories.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveTab('memories')}
                className="group cursor-pointer rounded-3xl bg-cream-50 dark:bg-cozydark-900 border border-cream-200/80 dark:border-cozydark-800 overflow-hidden shadow-cozy hover:shadow-cozy-lg transition-all"
              >
                {m.image_url ? (
                  <div className="aspect-[16/10] overflow-hidden bg-cream-200 dark:bg-cozydark-800">
                    <img
                      src={m.image_url}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-cream-200/50 dark:bg-cozydark-800 flex items-center justify-center text-cream-400">
                    <Camera className="w-6 h-6 opacity-40" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-[10px] text-cream-400 block mb-0.5">
                    {m.memory_date}
                  </span>
                  <h4 className="font-serif font-medium text-sm text-cream-900 dark:text-cream-50 truncate group-hover:text-blush-500 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-cream-600 dark:text-cream-400 font-light truncate mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Pinned Notes Glance */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-blush-500 fill-blush-500" />
              <h3 className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50">
                Pinned Notes
              </h3>
            </div>

            <button
              onClick={() => setActiveTab('notes')}
              className="text-xs text-blush-500 hover:text-blush-600 dark:text-blush-300 font-medium flex items-center gap-1"
            >
              <span>View Notebook</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveTab('notes')}
                className="cursor-pointer p-4 rounded-2xl bg-cream-50 dark:bg-cozydark-900 border border-cream-200 dark:border-cozydark-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-serif font-medium text-sm text-cream-900 dark:text-cream-100 mb-1">
                  {note.title}
                </h4>
                <p className="text-xs text-cream-600 dark:text-cream-400 font-light line-clamp-2">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Generator Modal */}
      <QuestionGeneratorModal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSendToChat={onSendToChat}
      />
    </div>
  );
};
