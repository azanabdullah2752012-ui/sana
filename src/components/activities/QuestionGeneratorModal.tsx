import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CONVERSATION_STARTERS } from '../../lib/mockData';
import { Sparkles, RefreshCw, Send, Copy, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

interface QuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (question: string) => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; category: string }>(() => {
    const cat = CONVERSATION_STARTERS[0];
    return { question: cat.questions[0], category: cat.category };
  });
  const [copied, setCopied] = useState(false);

  const generateNew = (catName = selectedCategory) => {
    let pool = CONVERSATION_STARTERS;
    if (catName !== 'All') {
      pool = CONVERSATION_STARTERS.filter((c) => c.category === catName);
    }
    const cat = pool[Math.floor(Math.random() * pool.length)];
    const q = cat.questions[Math.floor(Math.random() * cat.questions.length)];
    setCurrentQuestion({ question: q, category: cat.category });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentQuestion.question);
    setCopied(true);
    showToast('Question copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (onSendToChat) {
      onSendToChat(`💭 **Question for us:** ${currentQuestion.question}`);
      showToast('Sent to chat!', 'success');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span>Conversation Generator</span>
        </div>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {['All', ...CONVERSATION_STARTERS.map((c) => c.category)].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                generateNew(cat);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blush-500 text-white shadow-sm'
                  : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300 hover:bg-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question Highlight Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cream-100/90 via-blush-50/50 to-lavender-50/50 dark:from-cozydark-850 dark:via-blush-950/20 dark:to-lavender-950/20 border border-blush-200/80 dark:border-cozydark-750 text-center relative shadow-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-cream-50 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300 border border-blush-100 dark:border-blush-900 inline-block mb-4">
            {currentQuestion.category}
          </span>

          <p className="font-serif text-lg sm:text-xl text-cream-900 dark:text-cream-50 leading-relaxed font-normal">
            "{currentQuestion.question}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => generateNew()}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-cream-100 dark:bg-cozydark-850 hover:bg-cream-200 dark:hover:bg-cozydark-800 text-cream-800 dark:text-cream-200 text-xs font-medium flex items-center justify-center gap-2 border border-cream-200 dark:border-cozydark-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Another</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-2xl bg-cream-100 dark:bg-cozydark-850 hover:bg-cream-200 dark:hover:bg-cozydark-800 text-cream-800 dark:text-cream-200 text-xs font-medium flex items-center justify-center gap-2 border border-cream-200 dark:border-cozydark-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>

          {onSendToChat && (
            <button
              onClick={handleSendToChat}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-cozy transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Chat</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
