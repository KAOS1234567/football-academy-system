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


  // ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 3/7
// Header + Executive Summary Cards
// ============================================================================

// ============================================================================
// SECTION 9: Header Component
// ============================================================================

export const Header: FC = () => {
  const { date, time } = useCurrentTime();
  const { notifications } = useDashboard();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <Icon name="sparkles" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {ACADEMY_NAME}
            </h1>
            <p className="text-xs text-slate-500">Executive Dashboard</p>
          </div>
        </div>

        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players, coaches, teams..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-700">{time}</p>
            <p className="text-[10px] text-slate-500">{date}</p>
          </div>
          
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Notifications"
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white shadow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// SECTION 10: Executive Summary Cards
// ============================================================================

interface SummaryCardProps {
  moduleKey: ModuleKey;
  count: number;
  loading: boolean;
}

const SummaryCard: FC<SummaryCardProps> = ({ moduleKey, count, loading }) => {
  const config = MODULES[moduleKey];
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={cx('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition group-hover:opacity-20', config.gradient)} />
      
      <div className="relative flex items-start justify-between">
        <div className={cx('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', config.gradient)}>
          <Icon name={config.icon} size={22} />
        </div>
        {loading ? (
          <Skeleton className="h-6 w-12 rounded" />
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {count}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <h3 className="text-sm font-medium text-slate-500">{config.title}</h3>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-20 rounded" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {count}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">{config.description}</p>
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        <Link
          to={config.path}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="eye" size={14} />
          View
        </Link>
        <Link
          to={config.path}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90',
            config.gradient
          )}
        >
          Open
          <Icon name="external" size={14} />
        </Link>
      </div>
    </div>
  );
};

export const ExecutiveSummary: FC = () => {
  const { stats, statsLoading } = useDashboard();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Executive Summary</h2>
        <span className="text-xs text-slate-500">Overview of academy modules</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_KEYS.map((key) => (
          <SummaryCard
            key={key}
            moduleKey={key}
            count={stats[key]}
            loading={statsLoading}
          />
        ))}
      </div>
    </section>
  );
};

  
// ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 4/7
// Quick Actions + Recent Activity Widget
// ============================================================================

// ============================================================================
// SECTION 11: Quick Actions
// ============================================================================

export const QuickActions: FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      key: 'players' as ModuleKey,
      label: 'Open Players',
      icon: 'players' as IconName,
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'coaches' as ModuleKey,
      label: 'Open Coaches',
      icon: 'coaches' as IconName,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      key: 'teams' as ModuleKey,
      label: 'Open Teams',
      icon: 'teams' as IconName,
      color: 'from-violet-500 to-violet-600',
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <span className="text-xs text-slate-500">Fast access to modules</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => {
  console.log("clicked");
  alert("clicked");
  navigate("/players");
}}
            className={cx(
              'group relative overflow-hidden rounded-xl bg-gradient-to-r p-4 text-left text-white shadow-sm transition hover:shadow-md hover:scale-[1.02]',
              action.color
            )}
          >
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 transition group-hover:scale-150" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon name={action.icon} size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="text-xs text-white/80">
                  {MODULES[action.key].description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// SECTION 12: Recent Activity Widget
// ============================================================================

const ActivityItemRow: FC<{ item: ActivityItem }> = ({ item }) => {
  const iconMap: Record<ActivityItem['type'], IconName> = {
    players: 'players',
    coaches: 'coaches',
    teams: 'teams',
    system: 'activity',
  };

  const colorMap: Record<ActivityItem['type'], string> = {
    players: 'bg-blue-100 text-blue-600',
    coaches: 'bg-emerald-100 text-emerald-600',
    teams: 'bg-violet-100 text-violet-600',
    system: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-slate-50">
      <div
        className={cx(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          colorMap[item.type]
        )}
      >
        <Icon name={iconMap[item.type]} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            {item.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          {item.actor && <span className="font-medium">{item.actor}</span>}
          <span>•</span>
          <span>{formatRelativeTime(item.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export const RecentActivityWidget: FC = () => {
  const { activities, activitiesLoading, activitiesError, refreshActivities } =
    useDashboard();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="activity" size={18} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>
        <button
          type="button"
          onClick={refreshActivities}
          disabled={activitiesLoading}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label="Refresh activities"
        >
          <Icon
            name="refresh"
            size={16}
            className={cx(activitiesLoading && 'animate-spin')}
          />
        </button>
      </div>

      {activitiesLoading ? (
        <WidgetSkeleton lines={5} />
      ) : activitiesError ? (
        <ErrorState message={activitiesError} onRetry={refreshActivities} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No recent activity"
          description="Activity will appear here as actions are performed"
        />
      ) : (
        <div className="space-y-1">
          {activities.map((item) => (
            <ActivityItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

  
// ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 5/7
// Notifications Widget + Today's Schedule Widget
// ============================================================================

// ============================================================================
// SECTION 13: Notifications Widget
// ============================================================================

const NotificationItemRow: FC<{ item: NotificationItem }> = ({ item }) => {
  const iconMap: Record<NotificationItem['level'], IconName> = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    error: 'error',
  };

  const colorMap: Record<NotificationItem['level'], string> = {
    info: 'bg-blue-100 text-blue-600 border-blue-200',
    success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-100 text-amber-600 border-amber-200',
    error: 'bg-rose-100 text-rose-600 border-rose-200',
  };

  return (
    <div
      className={cx(
        'flex items-start gap-3 rounded-lg border p-3 transition',
        item.read ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300',
        colorMap[item.level]
      )}
    >
      <div
        className={cx(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          colorMap[item.level].split(' ').slice(0, 2).join(' ')
        )}
      >
        <Icon name={iconMap[item.level]} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {item.title}
          </p>
          {!item.read && (
            <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
          {item.message}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          {formatRelativeTime(item.timestamp)}
        </p>
      </div>
    </div>
  );
};

export const NotificationsWidget: FC = () => {
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    refreshNotifications,
  } = useDashboard();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="bell" size={18} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={refreshNotifications}
          disabled={notificationsLoading}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label="Refresh notifications"
        >
          <Icon
            name="refresh"
            size={16}
            className={cx(notificationsLoading && 'animate-spin')}
          />
        </button>
      </div>

      {notificationsLoading ? (
        <WidgetSkeleton lines={4} />
      ) : notificationsError ? (
        <ErrorState message={notificationsError} onRetry={refreshNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No notifications"
          description="You're all caught up! New notifications will appear here"
        />
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((item) => (
            <NotificationItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================================================
// SECTION 14: Today's Schedule Widget
// ============================================================================

const ScheduleItemRow: FC<{ item: ScheduleItem }> = ({ item }) => {
  const colorMap: Record<ScheduleItem['type'], string> = {
    players: 'bg-blue-100 text-blue-600',
    coaches: 'bg-emerald-100 text-emerald-600',
    teams: 'bg-violet-100 text-violet-600',
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:shadow-sm">
      <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 px-3 py-2 min-w-[60px]">
        <span className="text-xs font-semibold text-slate-700">{item.time}</span>
      </div>
      <div
        className={cx(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          colorMap[item.type]
        )}
      >
        <Icon name={item.type} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
        {item.location && (
          <p className="mt-0.5 text-xs text-slate-500 truncate">{item.location}</p>
        )}
      </div>
    </div>
  );
};

export const TodaysScheduleWidget: FC = () => {
  const { schedule, scheduleLoading, scheduleError, refreshSchedule } =
    useDashboard();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="calendar" size={18} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
        </div>
        <button
          type="button"
          onClick={refreshSchedule}
          disabled={scheduleLoading}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label="Refresh schedule"
        >
          <Icon
            name="refresh"
            size={16}
            className={cx(scheduleLoading && 'animate-spin')}
          />
        </button>
      </div>

      {scheduleLoading ? (
        <WidgetSkeleton lines={4} />
      ) : scheduleError ? (
        <ErrorState message={scheduleError} onRetry={refreshSchedule} />
      ) : schedule.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No events scheduled"
          description="Your schedule for today will appear here"
        />
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {schedule.map((item) => (
            <ScheduleItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

  // ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 6/7
// AI Insights Widget + Main Dashboard Component
// ============================================================================

// ============================================================================
// SECTION 15: AI Insights Widget
// ============================================================================

const InsightItemRow: FC<{ item: AIInsight }> = ({ item }) => {
  const categoryConfig: Record<
    AIInsight['category'],
    { icon: IconName; color: string; label: string }
  > = {
    performance: {
      icon: 'activity',
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      label: 'Performance',
    },
    trend: {
      icon: 'sparkles',
      color: 'bg-violet-100 text-violet-600 border-violet-200',
      label: 'Trend',
    },
    alert: {
      icon: 'alert',
      color: 'bg-amber-100 text-amber-600 border-amber-200',
      label: 'Alert',
    },
    recommendation: {
      icon: 'check',
      color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      label: 'Recommendation',
    },
  };

  const config = categoryConfig[item.category];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={cx(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border',
            config.color
          )}
        >
          <Icon name={config.icon} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cx(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold',
                    config.color
                  )}
                >
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h4>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
            {item.summary}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${item.confidence}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              {item.confidence}% confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIInsightsWidget: FC = () => {
  const { insights, insightsLoading, insightsError, refreshInsights } =
    useDashboard();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" size={18} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">AI Insights</h2>
        </div>
        <button
          type="button"
          onClick={refreshInsights}
          disabled={insightsLoading}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label="Refresh insights"
        >
          <Icon
            name="refresh"
            size={16}
            className={cx(insightsLoading && 'animate-spin')}
          />
        </button>
      </div>

      {insightsLoading ? (
        <WidgetSkeleton lines={3} />
      ) : insightsError ? (
        <ErrorState message={insightsError} onRetry={refreshInsights} />
      ) : insights.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title="No insights yet"
          description="AI insights will appear here as data is analyzed"
        />
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {insights.map((item) => (
            <InsightItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================================================
// SECTION 16: Main Dashboard Component
// ============================================================================

export const DashboardContent: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Executive Summary */}
          <ExecutiveSummary />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Grid - Activity + Notifications */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivityWidget />
            <NotificationsWidget />
          </div>

          {/* Secondary Grid - Schedule + AI Insights */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TodaysScheduleWidget />
            <AIInsightsWidget />
          </div>
        </div>
      </main>
    </div>
  );
};


  // ============================================================================
// ApexAcademy AI - Dashboard.tsx | Part 7/7 (Final)
// Main Dashboard Wrapper + Export
// ============================================================================

// ============================================================================
// SECTION 17: Main Dashboard Wrapper
// ============================================================================

const Dashboard: FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

// ============================================================================
// SECTION 18: Additional Utilities (Optional)
// ============================================================================

// Helper function to get module color by key
export const getModuleColor = (key: ModuleKey): string => {
  return MODULES[key].color;
};

// Helper function to get module gradient by key
export const getModuleGradient = (key: ModuleKey): string => {
  return MODULES[key].gradient;
};

// Helper function to get module path by key
export const getModulePath = (key: ModuleKey): string => {
  return MODULES[key].path;
};

// ============================================================================
// SECTION 19: Error Boundary (Optional but Recommended)
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 shadow-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Icon name="error" size={32} className="text-rose-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <Icon name="refresh" size={16} />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// SECTION 20: Enhanced Dashboard with Error Boundary
// ============================================================================

export const DashboardWithBoundary: FC = () => {
  return (
    <DashboardErrorBoundary>
      <Dashboard />
    </DashboardErrorBoundary>
  );
};

// ============================================================================
// SECTION 21: Performance Optimizations
// ============================================================================

// Memoized version for better performance
export const MemoizedDashboard = React.memo(Dashboard);

// Lazy loading wrapper (if needed)
export const LazyDashboard = React.lazy(() =>
  Promise.resolve({ default: Dashboard })
);

// ============================================================================
// SECTION 22: Module Documentation
// ============================================================================

/**
 * ApexAcademy AI - Enterprise Dashboard
 * 
 * @module Dashboard
 * @description Professional, modular, and scalable dashboard for ApexAcademy AI
 * 
 * Features:
 * - Modular architecture with independent widgets
 * - Firebase-ready data fetching hooks
 * - Comprehensive loading, empty, and error states
 * - Responsive design with Tailwind CSS
 * - TypeScript for type safety
 * - Context-based state management
 * - Error boundary for crash protection
 * 
 * Components:
 * - Header: Academy info, search, notifications, time display
 * - ExecutiveSummary: Stats cards for Players, Coaches, Teams
 * - QuickActions: Fast navigation buttons
 * - RecentActivityWidget: Activity feed with Firebase integration
 * - NotificationsWidget: Notification center
 * - TodaysScheduleWidget: Daily schedule display
 * - AIInsightsWidget: AI-generated insights and recommendations
 * 
 * Usage:
 * ```tsx
 * import Dashboard from './Dashboard';
 * 
 * function App() {
 *   return <Dashboard />;
 * }
 * ```
 * 
 * Firebase Integration:
 * Replace the fetcher functions with actual Firebase calls:
 * - fetchDashboardStats()
 * - fetchRecentActivity()
 * - fetchNotifications()
 * - fetchTodaySchedule()
 * - fetchAIInsights()
 */

// ============================================================================
// SECTION 23: Final Export
// ============================================================================

export default Dashboard;
