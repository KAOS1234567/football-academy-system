import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      // App.tsx سيتولى التحويل تلقائياً إلى Dashboard
    } catch (err: any) {
      console.error(err);

      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
          break;

        case "auth/invalid-email":
          setError("البريد الإلكتروني غير صالح.");
          break;

        case "auth/too-many-requests":
          setError("تم إيقاف المحاولة مؤقتاً، حاول لاحقاً.");
          break;

        default:
          setError("حدث خطأ أثناء تسجيل الدخول.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="text-center">
          <div className="text-5xl">⚽</div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            ApexAcademy AI
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            نظام إدارة أكاديميات كرة القدم
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              البريد الإلكتروني
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              style={{ direction: "ltr" }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              كلمة المرور
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              style={{ direction: "ltr" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            ليس لديك حساب؟ أنشئ حساباً جديداً
          </Link>
        </div>

      </div>
    </div>
  );
}
