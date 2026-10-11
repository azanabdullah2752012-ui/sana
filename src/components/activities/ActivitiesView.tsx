import React, { useState } from 'react';
import { DailyPromptWidget } from './DailyPromptWidget';
import { BucketListView } from './BucketListView';
import { SpecialDatesView } from './SpecialDatesView';
import { QuestionGeneratorModal } from './QuestionGeneratorModal';
import { Sparkles, MessageCircleQuestion } from 'lucide-react';

interface ActivitiesViewProps {
  onSendToChat?: (text: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ onSendToChat }) => {
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🌸</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-cream-900 dark:text-cream-50">
              Together &amp; Connected
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-cream-600 dark:text-cream-400 font-light">
            Daily questions, cozy bucket lists, countdowns, and fun conversation starters.
          </p>
        </div>

        {/* Random Question Generator Pill Button */}
        <button
          onClick={() => setQuestionModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blush-400 to-lavender-400 hover:from-blush-500 hover:to-lavender-500 text-white font-medium text-xs sm:text-sm shadow-cozy hover:shadow-cozy-lg transition-all"
        >
          <MessageCircleQuestion className="w-4 h-4" />
          <span>Random Conversation Generator</span>
        </button>
      </div>

      {/* 1. Daily Reflection Prompt */}
      <section>
        <DailyPromptWidget />
      </section>

      {/* 2. Things to Do Together (Bucket List) */}
      <section>
        <BucketListView />
      </section>

      {/* 3. Important Dates & Countdowns */}
      <section>
        <SpecialDatesView />
      </section>

      {/* Question Generator Modal */}
      <QuestionGeneratorModal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSendToChat={onSendToChat}
      />
    </div>
  );
};
