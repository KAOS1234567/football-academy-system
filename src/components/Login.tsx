import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export default function Login({ onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div class="text-center">
          <span class="text-4xl">⚽</span>
          <h2 class="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">ApexAcademy</h2>
          <p class="mt-2 text-sm text-slate-500">نظام إدارة أكاديميات كرة القدم الاحترافي</p>
        </div>

        <form class="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div class="space-y-4">
            <div>
              <label htmlFor="email" class="block text-sm font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <label htmlFor="password" class="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <button
            onClick={onNavigateToRegister}
            class="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            ليس لديك حساب؟ أنشئ حسابك الآن
          </button>
        </div>
      </div>
    </div>
  );
}
