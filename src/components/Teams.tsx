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
// src/components/Teams.tsx - Part 2/4

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

const TeamCard = ({ team, onClick }: { team: Team; onClick: () => void }) => {
  const statusStyles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-zinc-50 text-zinc-600 border-zinc-200',
    archived: 'bg-red-50 text-red-700 border-red-200',
  };
  const statusLabels = { active: 'نشط', inactive: 'غير نشط', archived: 'مؤرشف' };

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-lg hover:border-zinc-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: team.primaryColor || '#18181b' }}
          >
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              team.name.charAt(0)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700">{team.name}</h3>
            <p className="text-xs text-zinc-500">{team.coachName} • {team.ageCategory}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusStyles[team.status]}`}>
          {statusLabels[team.status]}
        </span>
      </div>

      <p className="text-sm text-zinc-600 line-clamp-2 mb-4 min-h-[40px]">{team.description || 'لا يوجد وصف للفريق'}</p>

      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-zinc-100">
        <div className="text-center">
          <p className="text-[10px] text-zinc-400">التقييم</p>
          <p className="text-sm font-semibold text-zinc-900">{team.rating}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-400">المعنويات</p>
          <p className="text-sm font-semibold text-zinc-900">{team.morale}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-400">الصحة</p>
          <p className="text-sm font-semibold text-zinc-900">{team.healthScore}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-400">اللاعبون</p>
          <p className="text-sm font-semibold text-zinc-900">{team.playerCount}</p>
        </div>
      </div>
    </div>
  );
};

type TeamFormData = Omit<Team, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

const TeamModal = ({ isOpen, onClose, team, onSave }: { isOpen: boolean; onClose: () => void; team: Team | null; onSave: (data: TeamFormData) => void }) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: '', logo: '', primaryColor: '#18181b', secondaryColor: '#f4f4f5',
    coachId: '', coachName: '', ageCategory: 'U15', season: '2025-2026',
    description: '', status: 'active', rating: 80, morale: 85, healthScore: 90, playerCount: 0,
  });

  React.useEffect(() => {
    if (team) {
      setFormData({ ...team });
    } else {
      setFormData({ name: '', logo: '', primaryColor: '#18181b', secondaryColor: '#f4f4f5', coachId: '', coachName: '', ageCategory: 'U15', season: '2025-2026', description: '', status: 'active', rating: 80, morale: 85, healthScore: 90, playerCount: 0 });
    }
  }, [team, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-zinc-900">{team ? 'تعديل الفريق' : 'إنشاء فريق جديد'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">اسم الفريق</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">الفئة العمرية</label>
              <select value={formData.ageCategory} onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value as AgeCategory })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                {AGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">الموسم</label>
              <input value={formData.season} onChange={(e) => setFormData({ ...formData, season: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">المدرب</label>
              <input value={formData.coachName} onChange={(e) => setFormData({ ...formData, coachName: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">الحالة</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TeamStatus })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">اللون الأساسي</label>
              <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">اللون الثانوي</label>
              <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">الوصف</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamDetails = ({ team, tabs, activeTab, setActiveTab, onBack }: { team: Team; tabs: { id: TabType; label: string; icon: string }[]; activeTab: TabType; setActiveTab: (t: TabType) => void; onBack: () => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button onClick={onBack} className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
        <span>→</span> العودة للفرق
      </button>
      
      <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md" style={{ backgroundColor: team.primaryColor }}>
            {team.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-900">{team.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{team.coachName} • {team.ageCategory} • {team.season}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 mb-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.id ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 min-h-[400px]">
        {/* Tab Content will be rendered here in Part 3 */}
        <p className="text-zinc-500 text-center py-20">محتوى تبويب: {tabs.find(t => t.id === activeTab)?.label}</p>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN COMPONENT RETURN (Continuation)
// ==========================================
// Replace the placeholder in Part 1's main return with this:
/*
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {selectedTeam ? (
          <TeamDetails team={selectedTeam} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} onBack={() => setSelectedTeam(null)} />
        ) : (
          <>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
                <p className="text-zinc-500">لا توجد فرق مطابقة للبحث.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <TeamCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <TeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        team={null}
        onSave={(data) => console.log('Save team:', data)}
      />
    </div>
  );
}
*/
// src/components/Teams.tsx - Part 3/4

// ==========================================
// 6. TAB CONTENT COMPONENT
// ==========================================
const TabContent = ({ activeTab, team }: { activeTab: TabType; team: Team }) => {
  const renderEmptyState = (icon: string, title: string, desc: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-2xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm">{desc}</p>
      <button className="mt-4 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors">
        إضافة عنصر جديد
      </button>
    </div>
  );

  switch (activeTab) {
    case 'players':
      return renderEmptyState('👥', 'لا يوجد لاعبون', 'قم بإضافة لاعبين إلى هذا الفريق لبدء إدارة تشكيلتك.');
    case 'staff':
      return renderEmptyState('👔', 'لا يوجد جهاز فني', 'أضف مدربين ومساعدين ومحللين إلى الفريق.');
    case 'training':
      return renderEmptyState('🏃', 'لا توجد تدريبات', 'قم بجدولة حصص تدريبية للفريق.');
    case 'attendance':
      return renderEmptyState('📋', 'لا يوجد سجل حضور', 'تتبع حضور وغياب اللاعبين.');
    case 'matches':
      return renderEmptyState('⚽', 'لا توجد مباريات', 'أضف مباريات قادمة أو سجل نتائج المباريات السابقة.');
    case 'statistics':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <p className="text-xs text-zinc-500">معدل الفوز</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">0%</p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <p className="text-xs text-zinc-500">الأهداف المسجلة</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">0</p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <p className="text-xs text-zinc-500">الأهداف المستقبلة</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">0</p>
          </div>
        </div>
      );
    case 'achievements':
      return renderEmptyState('🏆', 'لا توجد إنجازات', 'سجل بطولات وجوائز الفريق.');
    case 'documents':
      return renderEmptyState('📄', 'لا توجد مستندات', 'ارفع عقود اللاعبين والمستندات الطبية.');
    case 'videos':
      return renderEmptyState('🎥', 'لا توجد فيديوهات', 'أضف فيديوهات التحليل وأبرز اللقطات.');
    case 'timeline':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">السجل الزمني للفريق</h3>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-2xl mb-4">🕒</div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">السجل فارغ</h3>
            <p className="text-sm text-zinc-500 max-w-sm">سيتم تسجيل جميع أحداث الفريق هنا تلقائياً.</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// ==========================================
// 7. TIMELINE HELPER (AI Ready)
// ==========================================
export const generateTimelineEvent = (
  type: TimelineEvent['type'],
  description: string,
  actor: string = 'System'
): TimelineEvent => ({
  id: crypto.randomUUID(),
  type,
  description,
  timestamp: new Date(),
  actor,
});
