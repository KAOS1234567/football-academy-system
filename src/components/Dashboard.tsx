import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Bell, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Award, 
  FileText, 
  Video, 
  Search, 
  Heart, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Plus,
  Eye,
  Zap,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface PlayerStats {
  total: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

interface CoachStats {
  total: number;
  newThisWeek: number;
}

interface FinancialStats {
  revenue: number;
  growth: number;
  currency: string;
}

interface HealthStats {
  score: number;
  status: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  title: string;
  coach: string;
  location: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

interface NotificationItem {
  id: string;
  type: 'alert' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface ActivityItem {
  id: string;
  icon: string;
  message: string;
  timestamp: string;
}

interface DashboardData {
  playerStats: PlayerStats | null;
  coachStats: CoachStats | null;
  financialStats: FinancialStats | null;
  healthStats: HealthStats | null;
  schedule: ScheduleItem[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  aiInsights: any;
}

interface DashboardProps {
  academyName?: string;
  onDataLoad?: (data: DashboardData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ academyName = 'Apex Academy', onDataLoad }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    playerStats: null,
    coachStats: null,
    financialStats: null,
    healthStats: null,
    schedule: [],
    notifications: [],
    activities: [],
    aiInsights: null
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Here you will connect to Firebase
      // const data = await firebaseService.getDashboardData();
      // setDashboardData(data);
      // if (onDataLoad) onDataLoad(data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number | null | undefined, currency: string = 'USD'): string => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      notation: 'compact'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back to {academyName}</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
              <Bell className="w-6 h-6 text-slate-600" />
              {dashboardData.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {dashboardData.notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                      <div className="h-8 bg-slate-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-32"></div>
                    </div>
                    <div className="w-14 h-14 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Players</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {formatNumber(dashboardData.playerStats?.total)}
                    </p>
                    {dashboardData.playerStats && (
                      <p className={`text-xs mt-2 flex items-center ${
                        dashboardData.playerStats.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {dashboardData.playerStats.changeType === 'increase' ? '+' : '-'}
                        {Math.abs(dashboardData.playerStats.change)}% from last month
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Active Coaches</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {formatNumber(dashboardData.coachStats?.total)}
                    </p>
                    {dashboardData.coachStats && (
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboardData.coachStats.newThisWeek} new this week
                      </p>
                    )}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Monthly Revenue</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {formatCurrency(dashboardData.financialStats?.revenue, dashboardData.financialStats?.currency)}
                    </p>
                    {dashboardData.financialStats && (
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboardData.financialStats.growth}% growth
                      </p>
                    )}
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Academy Health</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {dashboardData.healthStats ? `${dashboardData.healthStats.score}%` : '—'}
                    </p>
                    {dashboardData.healthStats && (
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {dashboardData.healthStats.status}
                      </p>
                    )}
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <button className="flex flex-col items-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Add Player</span>
            </button>
            <button className="flex flex-col items-center p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Schedule</span>
            </button>
            <button className="flex flex-col items-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Reports</span>
            </button>
            <button className="flex flex-col items-center p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Videos</span>
            </button>
            <button className="flex flex-col items-center p-3 sm:p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Teams</span>
            </button>
            <button className="flex flex-col items-center p-3 sm:p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mb-2" />
              <span className="text-xs sm:text-sm text-slate-700 text-center">Goals</span>
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Today's Schedule</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-slate-50 rounded-lg animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData.schedule.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No schedule items for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.schedule.map((item) => (
                <div key={item.id} className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{item.time}</p>
                    <p className="text-xs text-slate-600">{item.period}</p>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.coach} • {item.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      item.status === 'Active' ? 'bg-green-100 text-green-700' :
                      item.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                    <button className="p-2 hover:bg-blue-100 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Notifications</h2>
            {dashboardData.notifications.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                {dashboardData.notifications.length} New
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start p-4 bg-slate-50 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-slate-200 rounded"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData.notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className={`flex items-start p-4 rounded-lg border ${
                  notification.type === 'alert' ? 'bg-red-50 border-red-100' :
                  notification.type === 'success' ? 'bg-blue-50 border-blue-100' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-100' :
                  'bg-slate-50 border-slate-100'
                }`}>
                  {notification.type === 'alert' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                  {notification.type === 'warning' && <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />}
                  {notification.type === 'info' && <Bell className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />}
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-64 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData.activities.length === 0 ? (
            <div className="text-center py-8">

                <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights - Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              AI Insights
            </h2>
          </div>
          {loading ? (
            <div className="h-32 bg-slate-50 rounded-lg animate-pulse"></div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">AI Insights will appear here</p>
              <p className="text-xs text-slate-400 mt-2">Powered by ApexAcademy AI</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};


;export default Dashboard
