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

import Players from './Players';
import Coaches from './Coaches';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'coaches'>('overview');
  const [academyName, setAcademyName] = useState<string>('جاري التحميل...');
  const [academyId, setAcademyId] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchAcademy() {
      try {
        const user = auth.currentUser;
        if (user) {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
    const data = snap.data();

    setAcademyName(data?.academyName || 'أكاديمية Apex');
    setAcademyId(data?.academyId || '');
          }
        
      } catch {
        setAcademyName('أكاديمية Apex');
      }
    }
    fetchAcademy();
  }, []);

  const handleLogout = () => signOut(auth);

  const navItems = [
    { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'players', label: 'اللاعبين', icon: Users },
    { id: 'coaches', label: 'المدربين', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row dir-rtl font-sans text-slate-800">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-5 space-y-8 flex-shrink-0">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-base">ApexAcademy</h1>
            <p className="text-[11px] text-emerald-400 font-semibold truncate">{academyName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronLeft className="h-4 w-4" />}
              </button>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10">
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3 space-x-reverse">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <h1 className="font-bold text-sm">{academyName}</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900/95 pt-20 p-6 flex flex-col justify-between">
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 space-x-reverse px-5 py-4 rounded-2xl font-bold text-base ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <button onClick={handleLogout} className="w-full py-4 rounded-2xl font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            تسجيل الخروج
          </button>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">لوحة التحكم</span>
              <h2 className="text-2xl font-black">{academyName}</h2>
              <p className="text-slate-400 text-xs">مرحباً بك في نظام ApexAcademy. قم بإدارة اللاعبين والمدربين بسهولة.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => setActiveTab('players')} className="bg-white p-5 rounded-2xl border cursor-pointer hover:border-emerald-500 transition-all">
                <div className="flex justify-between items-center"><Users className="h-6 w-6 text-emerald-600" /><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
                <h3 className="font-bold mt-4">إدارة اللاعبين</h3>
                <p className="text-xs text-slate-500">سجلات اللاعبين والتبييبات</p>
              </div>

              <div onClick={() => setActiveTab('coaches')} className="bg-white p-5 rounded-2xl border cursor-pointer hover:border-indigo-500 transition-all">
                <div className="flex justify-between items-center"><Award className="h-6 w-6 text-indigo-600" /><Activity className="h-4 w-4 text-indigo-500" /></div>
                <h3 className="font-bold mt-4">طاقم التدريب</h3>
                <p className="text-xs text-slate-500">إدارة المدربين والتخصصات</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && <Players />}
        {activeTab === 'coaches' && <Coaches />}
      </main>
    </div>
  );
}
