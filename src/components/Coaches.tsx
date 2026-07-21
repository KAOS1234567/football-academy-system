import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Award, 
  UserPlus, 
  ArrowRight, 
  Save, 
  Phone, 
  Mail, 
  Clock, 
  Activity, 
  Loader2, 
  Edit2, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

interface Coach {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  specialization: string;
  license: string;
  experience: string | number;
  notes: string;
  status: 'active' | 'inactive';
  createdAt?: any;
}

const specNames: Record<string, string> = {
  HeadCoach: 'مدرب رئيسي',
  AssistantCoach: 'مدرب مساعد',
  GoalkeeperCoach: 'مدرب حراس',
  FitnessCoach: 'مدرب لياقة',
  YouthCoach: 'مدرب فئات عمرية',
};

export default function Coaches() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    specialization: '',
    license: '',
    experience: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    let unsub: (() => void) | null = null;
    async function init() {
      try {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return; }
        const uSnap = await getDoc(doc(db, 'users', user.uid));
        if (uSnap.exists()) {
          const accId = uSnap.data()?.academyId || null;
          setAcademyId(accId);
          if (accId) {
            const q = query(collection(db, 'coaches'), where('academyId', '==', accId));
            unsub = onSnapshot(q, (snap) => {
              const list: Coach[] = [];
              snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Coach));
              list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
              setCoaches(list);
              setLoading(false);
            }, () => setLoading(false));
          } else { setLoading(false); }
        } else { setLoading(false); }
      } catch { setLoading(false); }
    }
    init();
    return () => { if (unsub) unsub(); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (c: Coach) => {
    setSelectedCoach(c);
    setFormData({
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      specialization: c.specialization,
      license: c.license,
      experience: String(c.experience),
      notes: c.notes || '',
      status: c.status || 'active'
    });
    setView('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyId || submitting) return;
    setSubmitting(true);
    try {
      if (view === 'edit' && selectedCoach) {
        await updateDoc(doc(db, 'coaches', selectedCoach.id), {
          ...formData,
          experience: Number(formData.experience) || 0,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'coaches'), {
          ...formData,
          experience: Number(formData.experience) || 0,
          academyId,
          createdBy: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
      }
      setFormData({ fullName: '', phone: '', email: '', specialization: '', license: '', experience: '', notes: '', status: 'active' });
      setSelectedCoach(null);
      setView('list');
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!coachToDelete || submitting) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'coaches', coachToDelete.id));
      setIsDeleteModalOpen(false);
      setCoachToDelete(null);
    } catch {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (view === 'add' || view === 'edit') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center space-x-3 space-x-reverse border-b pb-4">
          <button onClick={() => { setView('list'); setSelectedCoach(null); }} className="p-2 bg-white rounded-xl border text-slate-600">
            <ArrowRight className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-black">{view === 'edit' ? 'تعديل مدرب' : 'إضافة مدرب جديد'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">الاسم الكامل *</label>
            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">رقم الهاتف *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm dir-ltr text-left" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">البريد الإلكتروني *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm dir-ltr text-left" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">التخصص *</label>
              <select name="specialization" required value={formData.specialization} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm">
                <option value="">اختر التخصص...</option>
                <option value="HeadCoach">مدرب رئيسي</option>
                <option value="AssistantCoach">مدرب مساعد</option>
                <option value="GoalkeeperCoach">مدرب حراس</option>
                <option value="FitnessCoach">مدرب لياقة</option>
                <option value="YouthCoach">مدرب فئات عمرية</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">الرخصة *</label>
              <input type="text" name="license" required value={formData.license} onChange={handleChange} placeholder="مثال: AFC A" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">سنوات الخبرة *</label>
              <input type="number" name="experience" required value={formData.experience} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">الحالة *</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm">
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">ملاحظات</label>
            <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl text-sm resize-none"></textarea>
          </div>

          <div className="flex space-x-3 space-x-reverse pt-2">
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{submitting ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
            </button>
            <button type="button" onClick={() => { setView('list'); setSelectedCoach(null); }} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black">إدارة المدربين</h2>
          <p className="text-xs text-slate-500">العدد: {coaches.length}</p>
        </div>
        <button onClick={() => setView('add')} className="py-2.5 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse">
          <UserPlus className="h-4 w-4" />
          <span>إضافة مدرب</span>
        </button>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border text-center space-y-4 max-w-md mx-auto">
          <Award className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-500">لا يوجد مدربين مسجلين بعد.</p>
          <button onClick={() => setView('add')} className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl">إضافة أول مدرب</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coaches.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border space-y-3 relative overflow-hidden">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${c.status === 'inactive' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
              
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{c.fullName}</h4>
                  <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                    {specNames[c.specialization] || c.specialization}
                  </span>
                </div>
                <div className="flex space-x-1 space-x-reverse">
                  <button onClick={() => startEdit(c)} className="p-2 text-slate-400 hover:text-emerald-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => { setCoachToDelete(c); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="border-t border-b py-2 text-xs space-y-1 text-slate-600">
                <div className="flex items-center space-x-2 space-x-reverse"><Phone className="h-3.5 w-3.5" /><span>{c.phone}</span></div>
                <div className="flex items-center space-x-2 space-x-reverse dir-ltr justify-end"><Mail className="h-3.5 w-3.5" /><span className="truncate">{c.email}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[11px]">
                <div className="flex items-center space-x-1 space-x-reverse"><Award className="h-3.5 w-3.5 text-emerald-600" /><span>الرخصة: <strong>{c.license}</strong></span></div>
                <div className="flex items-center space-x-1 space-x-reverse"><Clock className="h-3.5 w-3.5 text-indigo-600" /><span>الخبرة: <strong>{c.experience} سنة</strong></span></div>
              </div>

              {c.notes && (
                <div className="flex items-center space-x-1 space-x-reverse text-[11px] text-slate-500">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  <span className="truncate">{c.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isDeleteModalOpen && coachToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
            <h3 className="font-bold text-base">تأكيد حذف المدرب؟</h3>
            <p className="text-xs text-slate-500">سيتم حذف "{coachToDelete.fullName}" نهائياً من النظام.</p>
            <div className="flex space-x-3 space-x-reverse">
              <button onClick={confirmDelete} disabled={submitting} className="flex-1 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl">
                {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
              <button onClick={() => { setIsDeleteModalOpen(false); setCoachToDelete(null); }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
