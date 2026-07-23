// src/components/Teams.tsx - Part 1/4
import React, { useState, useMemo } from 'react';

// ==========================================
// 1. TYPES & INTERFACES (AI Ready)
// ==========================================
export type TeamStatus = 'active' | 'inactive' | 'archived';
export type AgeCategory = 'U9' | 'U11' | 'U13' | 'U15' | 'U17' | 'U19' | 'Senior';
export type TabType = 'players' | 'staff' | 'training' | 'attendance' | 'matches' | 'statistics' | 'achievements' | 'documents' | 'videos' | 'timeline';

export interface TeamMember {
  id: string;
  name: string;
  role: 'player' | 'coach' | 'assistant_coach' | 'medical' | 'analyst';
  avatar?: string;
  joinedAt: Date;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'player_added' | 'player_removed' | 'player_transferred' | 'coach_assigned' | 'coach_changed' | 'training_created' | 'training_finished' | 'attendance_recorded' | 'match_added' | 'match_finished' | 'document_uploaded' | 'video_uploaded' | 'achievement_added' | 'updated';
  description: string;
  timestamp: Date;
  actor: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  coachId: string;
  coachName: string;
  ageCategory: AgeCategory;
  season: string;
  description: string;
  status: TeamStatus;
  rating: number;
  morale: number;
  healthScore: number;
  playerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// AI Context Interface for future AI integration
export interface TeamAIContext {
  team: Team;
  recentEvents: TimelineEvent[];
  performanceMetrics: {
    winRate: number;
    avgAttendance: number;
    injuryRate: number;
  };
}

// ==========================================
// 2. CONSTANTS
// ==========================================
const AGE_CATEGORIES: AgeCategory[] = ['U9', 'U11', 'U13', 'U15', 'U17', 'U19', 'Senior'];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<AgeCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TeamStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            team.coachName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || team.ageCategory === filterCategory;
      const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [teams, searchQuery, filterCategory, filterStatus]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'players', label: 'اللاعبون', icon: '👥' },
    { id: 'staff', label: 'الجهاز الفني', icon: '👔' },
    { id: 'training', label: 'التدريب', icon: '🏃' },
    { id: 'attendance', label: 'الحضور', icon: '📋' },
    { id: 'matches', label: 'المباريات', icon: '⚽' },
    { id: 'statistics', label: 'الإحصائيات', icon: '📊' },
    { id: 'achievements', label: 'الإنجازات', icon: '🏆' },
    { id: 'documents', label: 'المستندات', icon: '📄' },
    { id: 'videos', label: 'الفيديوهات', icon: '🎥' },
    { id: 'timeline', label: 'السجل الزمني', icon: '🕒' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased">
      {/* Header & Actions */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">إدارة الفرق</h1>
            <p className="text-sm text-zinc-500 mt-1">إدارة وتنظيم فرق الأكاديمية</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>فريق جديد</span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
            <input
              type="text"
              placeholder="بحث بالاسم أو المدرب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AgeCategory | 'all')}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="all">كل الفئات</option>
            {AGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TeamStatus | 'all')}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
            <p className="text-zinc-500">لا توجد فرق مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Cards will be rendered here in Part 2 */}
          </div>
        )}
      </main>
    </div>
  );
                        }
