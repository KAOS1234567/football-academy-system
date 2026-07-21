import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronLeft,
  Activity,
  TrendingUp
} from 'lucide-react';

// استيراد الموديلات التشغيلية للأكاديمية
import Players from './Players';
import Coaches from './Coaches';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'coaches'>('overview');
  const [academyName, setAcademyName] = useState<string>('جاري التحميل...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب بيانات الأكاديمية الخاصة بالمدير المالك
  useEffect(() => {
    async function fetchAcademyDetails() {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setAcademyName(data.academyName || 'أكاديمية كرة القدم');
          }
        }
      } catch (error) {
        console.error("Error fetching academy profile:", error);
        setAcademyName('أكاديمية Apex');
      } finally {
        setLoading(false);
      }
    }

    fetchAcademyDetails();
  }, []);

  // دالة تسجيل الخروج الآمن
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // مصفوفة عناصر القائمة الموحدة لتسهيل الصيانة والتوسع المستقبلي
  const navItems = [
    { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'players', label: 'اللاعبين', icon: Users },
    { id: 'coaches', label: 'المدربين', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row dir-rtl font-sans text-slate-800">
      
      {/* --- الشريط الجانبي للشاشات الكبيرة (Desktop Sidebar) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-l border-slate-800 p-5 space-y-8 flex-shrink-0">
        
        {/* الشعار واسم الأكاديمية */}
        <div className="flex items-center space-x-3 space-x-reverse pt-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-base text-white truncate">ApexAcademy</h1>
            <p className="text-[11px] text-emerald-400 font-semibold truncate">{academyName}</p>
          </div>
        </div>

        {/* عناصر التنقل */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronLeft className="h-4 w-4 text-emerald-200" />}
              </button>
            );
          })}
        </nav>

        {/* زر تسجيل الخروج */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* --- الهيدر العلوي للموبايل (Mobile Header) --- */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">ApexAcademy</h1>
            <p className="text-[10px] text-emerald-400 font-medium">{academyName}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* --- القائمة المنبثقة للموبايل (Mobile Overlay Menu) --- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900/95 backdrop-blur-md pt-20 p-6 flex flex-col justify-between animate-fade-in">
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 space-x-reverse px-5 py-4 rounded-2xl font-bold text-base transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                      : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse py-4 rounded-2xl font-bold text-base bg-red-500/10 text-red-400 border border-red-500/20"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}

      {/* --- منطقة عرض المحتوى الرئيسي (Main Content Area) --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* شاشة التبويب الأول: نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
                  لوحة التحكم التكتيكية
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">{academyName}</h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                  مرحباً بك في نظام إدارة الأكاديمية. يمكنك الآن متابعة تفاصيل اللاعبين، وإدارة طاقم التدريب بسهولة وبأعلى كفاءة تشغيلية.
                </p>
              </div>
            </div>

            {/* بطاقات الإحصائيات السريعة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('players')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">إدارة اللاعبين</h3>
                  <p className="text-xs text-slate-500">عرض، إضافة، تعديل وحذف بيانات اللاعبين</p>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('coaches')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Award className="h-6 w-6" />
                  </div>
                  <Activity className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">طاقم التدريب</h3>
                  <p className="text-xs text-slate-500">إدارة المدربين والتخصصات والرخص الفنية</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* شاشة التبويب الثاني: إدارة اللاعبين */}
        {activeTab === 'players' && <Players />}

        {/* شاشة التبويب الثالث: إدارة المدربين */}
        {activeTab === 'coaches' && <Coaches />}

      </main>

    </div>
  );
            }
