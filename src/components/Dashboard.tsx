import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Calendar, 
  LogOut, 
  Copy, 
  Check, 
  Trophy,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

interface UserData {
  fullName: string;
  email: string;
  role: 'owner' | 'coach';
  academyId: string;
}

interface AcademyData {
  name: string;
  inviteCode: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [academyData, setAcademyData] = useState<AcademyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    async function fetchSaaSContext() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // 1. جلب بيانات ملف المستخدم الشخصي
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const uData = userDocSnap.data() as UserData;
          setUserData(uData);

          // 2. جلب بيانات الأكاديمية المرتبطة بهذا المستخدم (عزل SaaS)
          const academyDocRef = doc(db, 'academies', uData.academyId);
          const academyDocSnap = await getDoc(academyDocRef);

          if (academyDocSnap.exists()) {
            setAcademyData(academyDocSnap.data() as AcademyData);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSaaSContext();
  }, []);

  const handleCopyCode = () => {
    if (academyData?.inviteCode) {
      navigator.clipboard.writeText(academyData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div class="w-full max-w-md space-y-4">
          <div class="h-8 bg-slate-200 rounded-xl animate-pulse w-2/3 mx-auto"></div>
          <div class="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
            <div class="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0 md:pe-64 flex flex-col">
      
      {/* القائمة الجانبية المستقرة للشاشات الكبيرة (Sidebar) - مخفية على الموبايل */}
      <aside class="fixed top-0 right-0 bottom-0 z-20 hidden md:flex flex-col w-64 bg-white border-e border-slate-100 p-4 space-y-6">
        <div class="flex items-center space-x-2 space-x-reverse px-2 py-4">
          <span class="text-2xl">⚽</span>
          <span class="font-black text-xl text-slate-900">ApexAcademy</span>
        </div>
        <nav class="flex-1 space-y-1">
          <button onClick={() => setActiveTab('home')} class={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard class="h-5 w-5" />
            <span>الرئيسية</span>
          </button>
          <button onClick={() => setActiveTab('players')} class="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Users class="h-5 w-5" />
            <span>اللاعبين</span>
          </button>
          <button onClick={() => setActiveTab('training')} class="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar class="h-5 w-5" />
            <span>التدريبات</span>
          </button>
        </nav>
        <button onClick={handleLogout} class="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
          <LogOut class="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* الهيدر العلوي المتجاوب للهاتف */}
      <header class="w-full bg-white border-b border-slate-100 sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-200">
            {academyData?.name ? academyData.name.charAt(0) : 'A'}
          </div>
          <div>
            <h1 class="font-bold text-base text-slate-900 leading-tight">{academyData?.name || 'الأكاديمية الرياضية'}</h1>
            <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <ShieldCheck class="h-3 w-3 text-emerald-600" />
              <span>الكابتن: {userData?.fullName}</span>
              <span class="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-bold">
                {userData?.role === 'owner' ? 'المالك' : 'مدرب'}
              </span>
            </p>
          </div>
        </div>
        
        {/* زر خروج سريع للموبايل */}
        <button onClick={handleLogout} class="md:hidden p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-red-600 transition-colors">
          <LogOut class="h-5 w-5" />
        </button>
      </header>

      {/* منطقة المحتوى الأساسية */}
      <main class="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto space-y-6">
        
        {/* مربع كود الدعوة للمدربين - يظهر لمالك الأكاديمية فقط */}
        {userData?.role === 'owner' && academyData?.inviteCode && (
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-sm font-bold opacity-90">كود دعوة طاقم التدريب</h3>
              <p class="text-xs opacity-75">شارك هذا الكود مع مدربيك لينضموا للأكاديمية برمجياً</p>
            </div>
            <button 
              onClick={handleCopyCode}
              class="bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-4 py-2.5 rounded-xl flex items-center space-x-2 space-x-reverse font-mono font-bold text-sm tracking-wider"
            >
              <span>{academyData.inviteCode}</span>
              {copied ? <Check class="h-4 w-4 text-emerald-300" /> : <Copy class="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* شبكة الإحصائيات الأولية للاستعراض السريع */}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">اللاعبين</span>
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users class="h-4 w-4" /></div>
            </div>
            <p class="text-2xl font-black text-slate-900">0</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">المدربين</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><UserSquare2 class="h-4 w-4" /></div>
            </div>
            <p class="text-2xl font-black text-slate-900">1</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">الحصص التدريبية</span>
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Calendar class="h-4 w-4" /></div>
            </div>
            <p class="text-2xl font-black text-slate-900">0</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">البطولات والفرق</span>
              <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Trophy class="h-4 w-4" /></div>
            </div>
            <p class="text-2xl font-black text-slate-900">0</p>
          </div>
        </div>

        {/* قسم ترحيبي وجدول الحصص اليومية الفارغ كبنية هيكلية */}
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 class="font-bold text-base text-slate-900">أجندة الحصص التدريبية اليوم</h2>
          <div class="text-center py-8 space-y-2">
            <span class="text-3xl block">📋</span>
            <p class="text-slate-500 text-sm font-semibold">لا توجد حصص تدريبية مجدولة لليوم.</p>
            <p class="text-xs text-slate-400">عند إضافة التمارين والحصص ستظهر تكتيكات الملاعب هنا تلقائياً.</p>
          </div>
        </div>

      </main>

      {/* شريط التنقل السفلي الثابت للموبايل (Bottom Navigation) - يختفي على الشاشات الكبيرة */}
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 flex items-center justify-around md:hidden z-20 shadow-lg">
        <button onClick={() => setActiveTab('home')} class={`flex flex-col items-center space-y-1 p-2 ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <LayoutDashboard class="h-5 w-5" />
          <span class="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button onClick={() => setActiveTab('players')} class={`flex flex-col items-center space-y-1 p-2 ${activeTab === 'players' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Users class="h-5 w-5" />
          <span class="text-[10px] font-bold">اللاعبين</span>
        </button>
        <button onClick={() => setActiveTab('training')} class={`flex flex-col items-center space-y-1 p-2 ${activeTab === 'training' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Calendar class="h-5 w-5" />
          <span class="text-[10px] font-bold">التدريبات</span>
        </button>
      </nav>

    </div>
  );
                                                                                                                                                                             }
              
