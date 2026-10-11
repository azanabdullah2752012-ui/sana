import {
  UserProfile,
  AuthorizedMember,
} from '../types/database';

export const BASE_USER_AZAN: UserProfile = {
  id: 'user-azan-001',
  display_name: 'Azan',
  avatar_url: null,
  bio: 'Cozy moments & memories ☕✨',
  theme_preference: 'light',
  accent_color: 'blush',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const BASE_USER_SANA: UserProfile = {
  id: 'user-sana-002',
  display_name: 'Sana',
  avatar_url: null,
  bio: 'Cozy moments & memories 🌸✨',
  theme_preference: 'light',
  accent_color: 'lavender',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const BASE_AUTHORIZED_MEMBERS: AuthorizedMember[] = [
  {
    id: 'auth-member-1',
    user_id: BASE_USER_AZAN.id,
    display_name: BASE_USER_AZAN.display_name,
    role: 'member_1',
    is_approved: true,
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'auth-member-2',
    user_id: BASE_USER_SANA.id,
    display_name: BASE_USER_SANA.display_name,
    role: 'member_2',
    is_approved: true,
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Curated question generator prompts
export const CONVERSATION_STARTERS = [
  {
    category: 'Cozy & Nostalgic',
    questions: [
      'What is your earliest memory that still feels crystal clear?',
      'If you could relive any single day from the past two years without changing anything, which one would it be?',
      'What smell or sound immediately takes you back to childhood?',
      'What was the best comfort meal someone ever made for you when you were tired?',
    ],
  },
  {
    category: 'Dreams & Wanderlust',
    questions: [
      'If we could spend an entire month in a small cottage anywhere in the world, where would we go?',
      'What is a skill or art form you secretly wish you were effortlessly brilliant at?',
      'What does your dream Sunday look like from morning to night?',
      'If money and time were unlimited, what passion project would you start tomorrow?',
    ],
  },
  {
    category: 'Deep & Meaningful',
    questions: [
      'What is something you’ve learned about yourself recently that surprised you?',
      'When in your life have you felt the most peaceful and at home in your own skin?',
      'What is a quality in a person that makes you immediately feel safe around them?',
      'What is something people often misunderstand about you at first glance?',
    ],
  },
  {
    category: 'Fun & Playful',
    questions: [
      'If our friendship had a signature movie or TV show, what would the soundtrack sound like?',
      'What is the most ridiculous thing you have ever laughed uncontrollably at?',
      'If we were stranded on an island with only three snacks, what are you bringing?',
      'Which animal do you think matches each other’s personality the most?',
    ],
  },
];
