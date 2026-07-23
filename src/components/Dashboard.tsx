import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Heart, 
  Shield, 
  Zap, 
  Target, 
  Award, 
  FileText, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'training' | 'match' | 'meeting' | 'event';
}

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  icon: React.ReactNode;
}

interface Player {
  id: string;
  name: string;
  status: 'active' | 'injured' | 'resting';
  avatar?: string;
}

interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  type: 'friendly' | 'league' | 'cup';
}

// Skeleton Components
const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
      <div className="h-8 bg-muted animate-pulse rounded w-2/3 mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded"></div>
        <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
      </div>
    </CardContent>
  </Card>
);

const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
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

