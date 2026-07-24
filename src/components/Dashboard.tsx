// ============================================================================
// ApexAcademy AI - Dashboard.tsx
// Enterprise Modular Dashboard | Part 1/7
// ============================================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type FC,
  type SVGProps,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ============================================================================
// SECTION 1: Types & Interfaces
// ============================================================================

export type ModuleKey = 'players' | 'coaches' | 'teams';

export interface ModuleConfig {
  key: ModuleKey;
  title: string;
  path: string;
  icon: ModuleKey;
  color: string;
  gradient: string;
  description: string;
}

export interface DashboardStats {
  players: number;
  coaches: number;
  teams: number;
  lastUpdated: number | null;
}

export interface ActivityItem {
  id: string;
  type: ModuleKey | 'system';
  title: string;
  description?: string;
  timestamp: number;
  actor?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: ModuleKey;
  location?: string;
}

export interface AIInsight {
  id: string;
  category: 'performance' | 'trend' | 'alert' | 'recommendation';
  title: string;
  summary: string;
  confidence: number;
  timestamp: number;
}

export interface DashboardContextValue {
  stats: DashboardStats;
  statsLoading: boolean;
  statsError: string | null;
  refreshStats: () => void;
  activities: ActivityItem[];
  activitiesLoading: boolean;
  activitiesError: string | null;
  refreshActivities: () => void;
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  refreshNotifications: () => void;
  schedule: ScheduleItem[];
  scheduleLoading: boolean;
  scheduleError: string | null;
  refreshSchedule: () => void;
  insights: AIInsight[];
  insightsLoading: boolean;
  insightsError: string | null;
  refreshInsights: () => void;
}

// ============================================================================
// SECTION 2: Constants & Configuration
// ============================================================================

export const MODULES: Record<ModuleKey, ModuleConfig> = {
  players: {
    key: 'players',
    title: 'Players',
    path: '/players',
    icon: 'players',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Manage academy players roster and profiles',
  },
  coaches: {
    key: 'coaches',
    title: 'Coaches',
    path: '/coaches',
    icon: 'coaches',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'Manage coaching staff and assignments',
  },
  teams: {
    key: 'teams',
    title: 'Teams',
    path: '/teams',
    icon: 'teams',
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-violet-600',
    description: 'Manage teams, squads and formations',
  },
};

export const MODULE_KEYS: ModuleKey[] = ['players', 'coaches', 'teams'];

export const ACADEMY_NAME = 'ApexAcademy AI';

// ============================================================================
// SECTION 3: Utility Functions
// ============================================================================

export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const cx = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

// ============================================================================
// SECTION 4: Custom Hooks - Time
// ============================================================================

export const useCurrentTime = (intervalMs: number = 1000) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return {
    date: formatDate(now),
    time: formatTime(now),
    raw: now,
  };
};

// ============================================================================
// SECTION 5: Custom Hooks - Data Fetchers (Firebase-ready)
// ============================================================================

interface FetcherState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const useFirebaseReadyFetcher = <T,>(
  fetcher: () => Promise<T>,
  emptyValue: T,
  deps: unknown[] = []
): FetcherState<T> => {
  const [data, setData] = useState<T>(emptyValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, error, refresh };
};

// Replace the bodies of these fetchers with Firebase calls when ready.
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // TODO-FIREBASE: subscribe to /stats aggregate
  return { players: 0, coaches: 0, teams: 0, lastUpdated: null };
};

const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  // TODO-FIREBASE: subscribe to /activity ordered by timestamp desc, limit 10
  return [];
};

const fetchNotifications = async (): Promise<NotificationItem[]> => {
  // TODO-FIREBASE: subscribe to /notifications for current user
  return [];
};

const fetchTodaySchedule = async (): Promise<ScheduleItem[]> => {
  // TODO-FIREBASE: subscribe to /schedule for today
  return [];
};

const fetchAIInsights = async (): Promise<AIInsight[]> => {
  // TODO-FIREBASE: subscribe to /insights generated by AI engine
  return [];
};
  
