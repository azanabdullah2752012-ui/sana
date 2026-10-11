import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DailyPrompt, DailyAnswer } from '../types/database';
import { CONVERSATION_STARTERS } from '../lib/mockData';

export function useDailyPrompt() {
  const { user, partnerProfile, isApproved } = useAuth();
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
  }, [isApproved, user?.id]);

  useEffect(() => {
    fetchPromptAndAnswers();
  }, [fetchPromptAndAnswers]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('daily_answers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_answers' }, () => {
        fetchPromptAndAnswers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchPromptAndAnswers]);

  const submitAnswer = async (text: string) => {
    if (!text.trim() || !user || !prompt) return;

    setIsSubmitting(true);
    const trimmed = text.trim();

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
      await fetchPromptAndAnswers();
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
      pool = CONVERSATION_STARTERS.filter((c) =>
        c.category.toLowerCase().includes(category.toLowerCase())
      );
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
