import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DailyPrompt, DailyAnswer } from '../types/database';
import { INITIAL_MOCK_PROMPT, INITIAL_MOCK_ANSWERS, CONVERSATION_STARTERS } from '../lib/mockData';

const MOCK_PROMPT_KEY = 'sana_mock_daily_prompt';
const MOCK_ANSWERS_KEY = 'sana_mock_daily_answers';

export function useDailyPrompt() {
  const { user, profile, partnerProfile, isApproved, isMockMode } = useAuth();
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userAnswerText, setUserAnswerText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPromptAndAnswers = useCallback(async () => {
    if (!isApproved) {
      setLoading(false);
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    if (isMockMode) {
      // Mock mode
      const storedPrompt = localStorage.getItem(MOCK_PROMPT_KEY);
      const storedAnswers = localStorage.getItem(MOCK_ANSWERS_KEY);

      const resolvedPrompt: DailyPrompt = storedPrompt
        ? JSON.parse(storedPrompt)
        : INITIAL_MOCK_PROMPT;

      const resolvedAnswers: DailyAnswer[] = storedAnswers
        ? JSON.parse(storedAnswers)
        : INITIAL_MOCK_ANSWERS;

      setPrompt(resolvedPrompt);
      setAnswers(resolvedAnswers);

      const myAns = resolvedAnswers.find((a) => a.user_id === user?.id);
      if (myAns) setUserAnswerText(myAns.answer);

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch today's prompt or pick one
      let { data: promptData } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('prompt_date', todayDate)
        .maybeSingle();

      if (!promptData) {
        // Fallback: create prompt for today from conversation starters pool
        const randomCategory =
          CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)];
        const randomQ =
          randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];

        const { data: newPrompt } = await supabase
          .from('daily_prompts')
          .insert({
            prompt_date: todayDate,
            question: randomQ,
            category: randomCategory.category,
          })
          .select()
          .maybeSingle();

        promptData = newPrompt;
      }

      setPrompt(promptData);

      if (promptData) {
        const { data: answersData } = await supabase
          .from('daily_answers')
          .select(`
            *,
            user:profiles!user_id(*)
          `)
          .eq('prompt_id', promptData.id);

        setAnswers(answersData || []);
        const myAns = (answersData || []).find((a) => a.user_id === user?.id);
        if (myAns) setUserAnswerText(myAns.answer);
      }
    } catch (err) {
      console.error('Error fetching daily prompt:', err);
    } finally {
      setLoading(false);
    }
  }, [isApproved, isMockMode, user?.id]);

  useEffect(() => {
    fetchPromptAndAnswers();
  }, [fetchPromptAndAnswers]);

  // Realtime
  useEffect(() => {
    if (!isApproved) return;

    if (isMockMode) {
      const handleStorage = () => {
        const storedAnswers = localStorage.getItem(MOCK_ANSWERS_KEY);
        if (storedAnswers) {
          try {
            setAnswers(JSON.parse(storedAnswers));
          } catch (e) {
            console.error(e);
          }
        }
      };
      window.addEventListener('sana_prompt_answers_updated', handleStorage as EventListener);
      return () => {
        window.removeEventListener('sana_prompt_answers_updated', handleStorage as EventListener);
      };
    }

    const channel = supabase
      .channel('daily_answers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_answers' }, () => {
        fetchPromptAndAnswers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, isMockMode, fetchPromptAndAnswers]);

  const submitAnswer = async (text: string) => {
    if (!text.trim() || !user || !profile || !prompt) return;

    setIsSubmitting(true);
    const trimmed = text.trim();

    if (isMockMode) {
      const filtered = answers.filter((a) => a.user_id !== user.id);
      const newAnswer: DailyAnswer = {
        id: `ans-${Date.now()}`,
        prompt_id: prompt.id,
        user_id: user.id,
        answer: trimmed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: profile,
      };

      const updated = [...filtered, newAnswer];
      setAnswers(updated);
      setUserAnswerText(trimmed);
      localStorage.setItem(MOCK_ANSWERS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sana_prompt_answers_updated'));
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if existing
      const existing = answers.find((a) => a.user_id === user.id);
      if (existing) {
        await supabase
          .from('daily_answers')
          .update({ answer: trimmed, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('daily_answers').insert({
          prompt_id: prompt.id,
          user_id: user.id,
          answer: trimmed,
        });
      }
      setUserAnswerText(trimmed);
      fetchPromptAndAnswers();
    } catch (err) {
      console.error('Failed to submit daily answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get a random question right now for playful conversation
  const getRandomQuestion = (category?: string) => {
    let pool = CONVERSATION_STARTERS;
    if (category) {
      pool = CONVERSATION_STARTERS.filter((c) => c.category.toLowerCase().includes(category.toLowerCase()));
      if (pool.length === 0) pool = CONVERSATION_STARTERS;
    }
    const cat = pool[Math.floor(Math.random() * pool.length)];
    const q = cat.questions[Math.floor(Math.random() * cat.questions.length)];
    return { question: q, category: cat.category };
  };

  return {
    prompt,
    answers,
    loading,
    isSubmitting,
    userAnswerText,
    setUserAnswerText,
    submitAnswer,
    getRandomQuestion,
    myAnswer: answers.find((a) => a.user_id === user?.id),
    partnerAnswer: answers.find((a) => a.user_id === partnerProfile?.id),
  };
}
