import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

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

  // التوجيه الذكي: إذا كان مسجلاً يذهب فوراً إلى لوحة التحكم الحقيقية المربوطة بـ Firestore
  if (user) {
    return <Dashboard />;
  }

  return currentView === 'login' ? (
    <Login onNavigateToRegister={() => setCurrentView('register')} />
  ) : (
    <Register onNavigateToLogin={() => setCurrentView('login')} />
  );
}
