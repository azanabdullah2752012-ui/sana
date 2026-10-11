import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sana_bestie_simple_points';
const EVENT_NAME = 'sana_simple_points_updated';

export interface PointActivity {
  id: string;
  person: 'azan' | 'sana';
  delta: number;
  note?: string;
  timestamp: string;
}

export interface BestiePointsState {
  azan: number;
  sana: number;
  activities: PointActivity[];
}

const DEFAULT_STATE: BestiePointsState = {
  azan: 5,
  sana: 5,
  activities: [
    {
      id: 'act-1',
      person: 'sana',
      delta: 1,
      note: 'Shared cute reels & made me laugh 😂',
      timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    },
    {
      id: 'act-2',
      person: 'azan',
      delta: 1,
      note: 'Built our sanctuary app 🌸',
      timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    },
  ],
};

function getStored(): BestiePointsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.azan === 'number' && typeof parsed.sana === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_STATE;
}

function persist(state: BestiePointsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
  } catch (e) {
    console.warn(e);
  }
}

export function useKindnessPoints() {
  const [state, setState] = useState<BestiePointsState>(getStored);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setState(e.detail);
      } else {
        setState(getStored());
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const addPoint = useCallback((person: 'azan' | 'sana', note = '') => {
    setState((prev) => {
      const next: BestiePointsState = {
        ...prev,
        [person]: prev[person] + 1,
        activities: [
          {
            id: `act-${Date.now()}`,
            person,
            delta: 1,
            note: note.trim() || undefined,
            timestamp: new Date().toISOString(),
          },
          ...prev.activities.slice(0, 19), // keep last 20
        ],
      };
      persist(next);
      return next;
    });
  }, []);

  const subtractPoint = useCallback((person: 'azan' | 'sana') => {
    setState((prev) => {
      const next: BestiePointsState = {
        ...prev,
        [person]: Math.max(0, prev[person] - 1),
        activities: [
          {
            id: `act-${Date.now()}`,
            person,
            delta: -1,
            note: 'Point adjusted',
            timestamp: new Date().toISOString(),
          },
          ...prev.activities.slice(0, 19),
        ],
      };
      persist(next);
      return next;
    });
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setState((prev) => {
      const next: BestiePointsState = {
        ...prev,
        activities: prev.activities.filter((a) => a.id !== id),
      };
      persist(next);
      return next;
    });
  }, []);

  const resetScores = useCallback(() => {
    const next: BestiePointsState = {
      azan: 0,
      sana: 0,
      activities: [],
    };
    setState(next);
    persist(next);
  }, []);

  return {
    azanPoints: state.azan,
    sanaPoints: state.sana,
    totalKindnesses: state.activities.length,
    activities: state.activities,
    addPoint,
    subtractPoint,
    deleteActivity,
    resetScores,
  };
}
