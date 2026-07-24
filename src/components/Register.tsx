import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "coach">("owner");
  const [academyName, setAcademyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!fullName || !email || !password) {
      setError("الرجاء ملء جميع الحقول.");
      return;
    }

    if (role === "owner" && !academyName) {
      setError("الرجاء إدخال اسم الأكاديمية.");
      return;
    }

    if (role === "coach" && !inviteCode) {
      setError("الرجاء إدخال كود الدعوة.");
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = credential.user.uid;

      let academyId = inviteCode.trim();

      if (role === "owner") {
        const academyRef = doc(collection(db, "academies"));

        academyId = academyRef.id;

        const generatedInviteCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        await setDoc(academyRef, {
          id: academyId,
          name: academyName,
          ownerId: uid,
          inviteCode: generatedInviteCode,
          createdAt: new Date().toISOString(),
        });
      }

      await setDoc(doc(db, "users", uid), {
        uid,
        fullName,
        email,
        role,
        academyId,
        createdAt: new Date().toISOString(),
      });

      // App.tsx سيحول المستخدم تلقائياً إلى Dashboard

    } catch (err: any) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("البريد الإلكتروني مستخدم بالفعل.");
          break;

        case "auth/weak-password":
          setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
          break;

        case "auth/invalid-email":
          setError("البريد الإلكتروني غير صالح.");
          break;

        default:
          setError("حدث خطأ أثناء إنشاء الحساب.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="text-center">
          <div className="text-5xl">🌱</div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            إنشاء حساب
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            ApexAcademy AI
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              الاسم الكامل
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              البريد الإلكتروني
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              style={{ direction: "ltr" }}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              كلمة المرور
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              style={{ direction: "ltr" }}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              نوع الحساب
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`rounded-xl border py-3 font-semibold transition ${
                  role === "owner"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200"
                }`}
              >
                مالك أكاديمية
              </button>

              <button
                type="button"
                onClick={() => setRole("coach")}
                className={`rounded-xl border py-3 font-semibold transition ${
                  role === "coach"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200"
                }`}
              >
                مدرب
              </button>

            </div>
          </div>

          {role === "owner" ? (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                اسم الأكاديمية
              </label>

              <input
                type="text"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                كود الدعوة
              </label>

              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center uppercase font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}
