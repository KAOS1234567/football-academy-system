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
  
// ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 2/7
// Context Provider + UI Base Components
// ============================================================================

// ============================================================================
// SECTION 6: Dashboard Context
// ============================================================================

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboard = (): DashboardContextValue => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return ctx;
};

export const DashboardProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const stats = useFirebaseReadyFetcher<DashboardStats>(
    fetchDashboardStats,
    { players: 0, coaches: 0, teams: 0, lastUpdated: null }
  );

  const activities = useFirebaseReadyFetcher<ActivityItem[]>(
    fetchRecentActivity,
    []
  );

  const notifications = useFirebaseReadyFetcher<NotificationItem[]>(
    fetchNotifications,
    []
  );

  const schedule = useFirebaseReadyFetcher<ScheduleItem[]>(
    fetchTodaySchedule,
    []
  );

  const insights = useFirebaseReadyFetcher<AIInsight[]>(
    fetchAIInsights,
    []
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      stats: stats.data,
      statsLoading: stats.loading,
      statsError: stats.error,
      refreshStats: stats.refresh,
      activities: activities.data,
      activitiesLoading: activities.loading,
      activitiesError: activities.error,
      refreshActivities: activities.refresh,
      notifications: notifications.data,
      notificationsLoading: notifications.loading,
      notificationsError: notifications.error,
      refreshNotifications: notifications.refresh,
      schedule: schedule.data,
      scheduleLoading: schedule.loading,
      scheduleError: schedule.error,
      refreshSchedule: schedule.refresh,
      insights: insights.data,
      insightsLoading: insights.loading,
      insightsError: insights.error,
      refreshInsights: insights.refresh,
    }),
    [stats, activities, notifications, schedule, insights]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
};

// ============================================================================
// SECTION 7: Icon System (Inline SVG, no external deps)
// ============================================================================

type IconProps = SVGProps<SVGSVGElement> & { name: IconName; size?: number };
type IconName =
  | 'players'
  | 'coaches'
  | 'teams'
  | 'bell'
  | 'search'
  | 'refresh'
  | 'external'
  | 'eye'
  | 'calendar'
  | 'sparkles'
  | 'activity'
  | 'alert'
  | 'check'
  | 'info'
  | 'warning'
  | 'error'
  | 'empty';

const Icon: FC<IconProps> = ({ name, size = 20, className, ...rest }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    ...rest,
  };

  switch (name) {
    case 'players':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c.5-3.5 3.3-5.5 6.5-5.5s6 2 6.5 5.5" />
          <circle cx="17" cy="7" r="2.5" />
          <path d="M16 14.5c2.5.3 4.5 2 5 4.5" />
        </svg>
      );
    case 'coaches':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 20c.5-4 3.5-6.5 8-6.5s7.5 2.5 8 6.5" />
          <path d="M9 4l3-2 3 2" />
        </svg>
      );
    case 'teams':
      return (
        <svg {...common}>
          <path d="M4 7l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 17l8 4 8-4" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 8a6 6 0 1112 0c0 4 2 5 2 7H4c0-2 2-3 2-7z" />
          <path d="M10 19a2 2 0 004 0" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 11-3-6.7" />
          <path d="M21 4v5h-5" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M20 4l-9 9" />
          <path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-5" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
          <path d="M19 15l.9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9L19 15z" />
        </svg>
      );
    case 'activity':
      return (
        <svg {...common}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common}>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 10v5M12 18v.01" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" />
        </svg>
      );
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v.01M11 12h1v5h1" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 10v5M12 18v.01" />
        </svg>
      );
    case 'error':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      );
    case 'empty':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M8 14h3M8 17h5" />
        </svg>
      );
    default:
      return null;
  }
};

// ============================================================================
// SECTION 8: Primitive UI - Skeleton, Empty, Error, Button
// ============================================================================

export const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cx(
      'animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
      className
    )}
    aria-hidden="true"
  />
);

export const CardSkeleton: FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-16 rounded" />
    </div>
    <Skeleton className="mt-5 h-4 w-24 rounded" />
    <Skeleton className="mt-3 h-9 w-28 rounded" />
    <div className="mt-6 flex gap-2">
      <Skeleton className="h-9 w-24 rounded-lg" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);

export const WidgetSkeleton: FC<{ lines?: number }> = ({ lines = 4 }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-40 rounded" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <div className="mt-5 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const EmptyState: FC<{
  icon?: IconName;
  title: string;
  description?: string;
}> = ({ icon = 'empty', title, description }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Icon name={icon} size={26} />
    </div>
    <h4 className="mt-4 text-sm font-semibold text-slate-700">{title}</h4>
    {description && (
      <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
    )}
  </div>
);

export const ErrorState: FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50/60 py-8 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
      <Icon name="error" size={22} />
    </div>
    <p className="mt-3 max-w-sm text-sm text-rose-700">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
    >
      <Icon name="refresh" size={14} />
      Retry
    </button>
  </div>
);

export const Button: FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'outline';
    size?: 'sm' | 'md';
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  }
> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };
  const variants = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
  };
  return (
    <button
      type="button"
      className={cx(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
