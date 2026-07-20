import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Register from './components/Register';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p class="text-slate-500 text-sm font-medium">جاري تأمين الاتصال السحابي...</p>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجلاً، نقله مؤقتاً إلى مساحة لوحة التحكم التأسيسية لتجربة التدفق الإجرائي
  if (user) {
    return (
      <div class="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4">
        <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-6">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto">
            ✓
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-slate-900">مرحباً بك في لوحة تحكم ApexAcademy</h1>
            <p class="text-slate-500 text-sm">تم التحقق من هويتك بنجاح عبر البريد الإلكتروني:</p>
            <p class="text-slate-700 font-mono text-xs bg-slate-50 py-1.5 px-3 rounded-lg inline-block">{user.email}</p>
          </div>
          
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-right">
            <p class="text-xs text-blue-800 font-medium leading-relaxed">
              💡 <strong>حالة النظام الحالية:</strong> شاشات تسجيل الدخول والإنشاء تعمل ومربوطة بالكامل بـ Firebase Auth. في الخطوة القادمة، سنقوم ببناء شاشة الـ Dashboard المستقلة وقراءة حقول تخصيص الـ SaaS.
            </p>
          </div>

          <button
            onClick={handleLogout}
            class="w-full py-3 px-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            تسجيل الخروج للاختبار
          </button>
        </div>
      </div>
    );
  }

  // التبديل بين شاشتي تسجيل الدخول وإنشاء حساب
  return currentView === 'login' ? (
    <Login onNavigateToRegister={() => setCurrentView('register')} />
  ) : (
    <Register onNavigateToLogin={() => setCurrentView('login')} />
  );
    }
