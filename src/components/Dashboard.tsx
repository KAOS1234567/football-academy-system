import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Activity,
  Brain,
  Plus,
  UserPlus,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Inbox
} from 'lucide-react';

interface ExecutiveSummaryData {
  totalPlayers: number;
  activeCoaches: number;
  todaySessions: number;
  revenue: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'training' | 'match' | 'meeting';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface DashboardState {
  summary: ExecutiveSummaryData | null;
  schedule: ScheduleItem[];
  notifications: Notification[];
  activities: ActivityItem[];
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
}

const useDashboardData = () => {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    schedule: [],
    notifications: [],
    activities: [],
    insights: [],
    loading: true,
    error: null
  });

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Connect to Firebase
      // For now, initialize with empty data structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState({
        summary: null,
        schedule: [],
        notifications: [],
        activities: [],
        insights: [],
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { state, reload: loadData };
};

const SummarySkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const SectionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-60" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="rounded-full bg-muted p-4 mb-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
  </div>
);

const ErrorState = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Activity,
  Brain,
  Plus,
  UserPlus,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Inbox
} from 'lucide-react';

interface ExecutiveSummaryData {
  totalPlayers: number;
  activeCoaches: number;
  todaySessions: number;
  revenue: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'training' | 'match' | 'meeting';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface DashboardState {
  summary: ExecutiveSummaryData | null;
  schedule: ScheduleItem[];
  notifications: Notification[];
  activities: ActivityItem[];
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
}

const useDashboardData = () => {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    schedule: [],
    notifications: [],
    activities: [],
    insights: [],
    loading: true,
    error: null
  });

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      setState({
        summary: null,
        schedule: [],
        notifications: [],
        activities: [],
        insights: [],
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { state, reload: loadData };
};

const SummarySkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const SectionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-60" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="rounded-full bg-muted p-4 mb-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
  </div>
);

const ErrorState = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

