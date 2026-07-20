import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'coach'>('owner');
  const [academyName, setAcademyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName || !email || !password) {
      setError('الرجاء ملء كافة الحقول الأساسية.');
      setLoading(false);
      return;
    }

    if (role === 'owner' && !academyName) {
      setError('الرجاء إدخال اسم الأكاديمية الخاصة بك.');
      setLoading(false);
      return;
    }

    if (role === 'coach' && !inviteCode) {
      setError('الرجاء إدخال كود الانضمام الممنوح لك من إدارة الأكاديمية.');
      setLoading(false);
      return;
    }

    try {
      // 1. إنشاء الحساب في Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      let targetAcademyId = inviteCode.trim();

      // 2. إذا كان مالك أكاديمية جديدة، نقوم بتوليد الأكاديمية أولاً
      if (role === 'owner') {
        const academyRef = doc(collection(db, 'academies'));
        targetAcademyId = academyRef.id;

        // توليد رمز دعوة عشوائي للأكاديمية ليستعمله المدربون لاحقاً
        const generatedInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await setDoc(academyRef, {
          id: targetAcademyId,
          name: academyName,
          ownerId: uid,
          inviteCode: generatedInviteCode,
          createdAt: new Date().toISOString()
        });
      }

      // 3. حفظ بيانات المستخدم في Firestore وعزله بالـ academyId
      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName,
        email,
        role,
        academyId: targetAcademyId,
        createdAt: new Date().toISOString()
      });

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً، يجب أن لا تقل عن 6 رموز.');
      } else {
        setError('حدث خطأ أثناء إنشأ الحساب. حاول مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div class="text-center">
          <span class="text-4xl">🌱</span>
          <h2 class="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">انضم إلى الأكاديمية</h2>
          <p class="mt-2 text-sm text-slate-500">ابدأ مسيرتك التدريبية والإدارية الاحترافية اليوم</p>
        </div>

        <form class="space-y-4" onSubmit={handleRegister}>
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الكابتن..."
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@example.com"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">نوع الحساب البرمجي</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  class={`py-3 px-4 text-sm font-bold rounded-xl border transition-all ${role === 'owner' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 bg-white'}`}
                >
                  مالك أكاديمية جديدة
                </button>
                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  class={`py-3 px-4 text-sm font-bold rounded-xl border transition-all ${role === 'coach' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 bg-white'}`}
                >
                  مدرب منضم حالياً
                </button>
              </div>
            </div>

            {role === 'owner' ? (
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">اسم الأكاديمية الرياضية</label>
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="مثال: أكاديمية الديوانية للشباب"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">كود الدعوة / الانضمام</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="أدخل الرمز الممنوح لك"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center uppercase font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full mt-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري بناء الحساب السحابي...' : 'تأكيد التسجيل والانطلاق'}
          </button>
        </form>

        <div class="text-center">
          <button
            onClick={onNavigateToLogin}
            class="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            لديك حساب بالفعل؟ سجل دخولك هنا
          </button>
        </div>
      </div>
    </div>
  );
                  }
