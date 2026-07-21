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
  UserCheck, 
  UserPlus, 
  ArrowRight, 
  Save, 
  Phone, 
  Mail, 
  Briefcase, 
  Clock, 
  Activity, 
  Loader2, 
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// تعريف الواجهة البرمجية لبيانات المدرب لضمان مطابقة TypeScript
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
  createdAt: any;
}

// قاموس لترجمة التخصصات التدريبية للعربية في الواجهة
const specializationTranslations: Record<string, string> = {
  HeadCoach: 'مدرب رئيسي (Head Coach)',
  AssistantCoach: 'مدرب مساعد (Assistant Coach)',
  GoalkeeperCoach: 'مدرب حراس مرمى (GK Coach)',
  FitnessCoach: 'مدرب لياقة بدنية (Fitness Coach)',
  YouthCoach: 'مدرب فئات عمرية (Youth Coach)',
};

export default function Coaches() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // حالة الاحتفاظ بالمدرب الجاري تعديله حالياً
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  // حالات إدارة ميزة الحذف الآمن
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // حالة استمارة الإدخال والتعديل الموحدة
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

  // جلب سياق الأكاديمية وإعداد المستمع اللحظي للمدربين المسجلين
  useEffect(() => {
    let unsubscribeCoaches: (() => void) | null = null;

    async function initializeContext() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          const currentAcademyId = uData?.academyId || null;
          setAcademyId(currentAcademyId);

          if (currentAcademyId) {
            const q = query(
              collection(db, 'coaches'),
              where('academyId', '==', currentAcademyId)
            );

            unsubscribeCoaches = onSnapshot(q, (snapshot) => {
              const fetchedCoaches: Coach[] = [];
              snapshot.forEach((doc) => {
                fetchedCoaches.push({
                  id: doc.id,
                  ...doc.data()
                } as Coach);
              });

              // ترتيب زمني محلي للحفاظ على استقرار الواجهة
              fetchedCoaches.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
              });

              setCoaches(fetchedCoaches);
              setLoading(false);
            }, (error) => {
              console.error("Firestore subscription error:", error);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing coaches context:", error);
        setLoading(false);
      }
    }

    initializeContext();

    return () => {
      if (unsubscribeCoaches) unsubscribeCoaches();
    };
  }, []);

  // تحديث مدخلات الاستمارة ديناميكياً
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // تشغيل وضع التعديل وحقن البيانات الحالية للمدرب المختار
  const startEdit = (coach: Coach) => {
    setSelectedCoach(coach);
    setFormData({
      fullName: coach.fullName,
      phone: coach.phone,
      email: coach.email,
      specialization: coach.specialization,
      license: coach.license,
      experience: String(coach.experience),
      notes: coach.notes || '',
      status: coach.status || 'active'
    });
    setView('edit');
  };

  // تفعيل واجهة الحذف الآمن للمدرب المختار
  const startDelete = (coach: Coach) => {
    setCoachToDelete(coach);
    setIsDeleteModalOpen(true);
  };

  // دالة حفظ مدرب جديد في Firestore
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyId || submitting) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'coaches'), {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization,
        license: formData.license.trim(),
        experience: Number(formData.experience) || 0,
        notes: formData.notes.trim(),
        status: formData.status,
        academyId: academyId,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });

      setFormData({ fullName: '', phone: '', email: '', specialization: '', license: '', experience: '', notes: '', status: 'active' });
      setView('list');
    } catch (error) {
      console.error("Error adding coach:", error);
      alert("حدث خطأ أثناء حفظ بيانات المدرب.");
    } finally {
      setSubmitting(false);
    }
  };

  // دالة إرسال التحديثات لبيانات مدرب موجود مسبقاً إلى Firestore
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach || submitting) return;
    setSubmitting(true);

    try {
      const coachDocRef = doc(db, 'coaches', selectedCoach.id);
      await updateDoc(coachDocRef, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization,
        license: formData.license.trim(),
        experience: Number(formData.experience) || 0,
        notes: formData.notes.trim(),
        status: formData.status,
        updatedAt: serverTimestamp()
      });

      // تنظيف وإعادة ضبط الحالات بعد النجاح السحابي
      setFormData({ fullName: '', phone: '', email: '', specialization: '', license: '', experience: '', notes: '', status: 'active' });
      setSelectedCoach(null);
      setView('list');
    } catch (error) {
      console.error("Error updating coach:", error);
      alert("حدث خطأ أثناء تحديث بيانات المدرب، يرجى المحاولة لاحقاً.");
    } finally {
      setSubmitting(false);
    }
  };

  // دالة الحذف النهائي القطعي من قاعدة البيانات السحابية
  const handleConfirmDelete = async () => {
    if (!coachToDelete || submitting) return;
    setSubmitting(true);

    try {
      const coachDocRef = doc(db, 'coaches', coachToDelete.id);
      await deleteDoc(coachDocRef);
      
      setIsDeleteModalOpen(false);
      setCoachToDelete(null);
    } catch (error) {
      console.error("Error deleting coach:", error);
      alert("حدث خطأ غير متوقع أثناء محاولة حذف المدرب، يرجى التحقق من اتصال الشبكة.");
    } finally {
      setSubmitting(false);
    }
  };

  // شاشة التحميل الدوارة لحين اكتمال الاتصال السحابي
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">جاري جلب قائمة طاقم التدريب من السحابة...</p>
      </div>
    );
  }

  // --- شاشة نموذج إضافة وتعديل المدرب الموحدة (DRY UI Construction) ---
  if (view === 'add' || view === 'edit') {
    const isEditMode = view === 'edit';
    
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
          <button 
            type="button"
            onClick={() => {
              setView('list');
              setSelectedCoach(null);
              setFormData({ fullName: '', phone: '', email: '', specialization: '', license: '', experience: '', notes: '', status: 'active' });
            }} 
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEditMode ? `تعديل بيانات المدرب: ${selectedCoach?.fullName}` : 'إضافة مدرب جديد للأكاديمية'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode ? 'تعديل الحقول المطلوبة ثم اضغط تحديث لحفظ التعديلات سحابياً.' : 'سيتم تخزين بيانات المدرب بأمان تحت الهوية البرمجية لأكاديميتك.'}
            </p>
          </div>
        </div>

        <form onSubmit={isEditMode ? handleUpdateSubmit : handleAddSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">الاسم الكامل للمدرب *</label>
            <input 
              type="text"
              name="fullName"
              required
              disabled={submitting}
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="مثال: الكابتن محمد جاسم"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">رقم الهاتف *</label>
              <input 
                type="tel"
                name="phone"
                required
                disabled={submitting}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="مثال: 077XXXXXXXX"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left dir-ltr placeholder:text-right disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">البريد الإلكتروني *</label>
              <input 
                type="email"
                name="email"
                required
                disabled={submitting}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="coach@academy.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left dir-ltr placeholder:text-right disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">التخصص التدريبي *</label>
              <select 
                name="specialization"
                required
                disabled={submitting}
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right appearance-none disabled:opacity-50"
              >
                <option value="">اختر التخصص...</option>
                <option value="HeadCoach">مدرب رئيسي</option>
                <option value="AssistantCoach">مدرب مساعد</option>
                <option value="GoalkeeperCoach">مدرب حراس مرمى</option>
                <option value="FitnessCoach">مدرب لياقة بدنية</option>
                <option value="YouthCoach">مدرب فئات عمرية</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">الرخصة التدريبية *</label>
              <input 
                type="text"
                name="license"
                required
                disabled={submitting}
                value={formData.license}
                onChange={handleInputChange}
                placeholder="مثال: AFC Pro / UEFA A"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">سنوات الخبرة *</label>
              <input 
                type="number"
                name="experience"
                min="0"
                max="50"
                required
                disabled={submitting}
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="مثال: 5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">حالة المدرب *</label>
            <select 
              name="status"
              required
              disabled={submitting}
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right appearance-none disabled:opacity-50"
            >
              <option value="active">نشط (Active)</option>
              <option value="inactive">غير نشط (Inactive)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">ملاحظات إضافية (إن وجدت)</label>
            <textarea 
              name="notes"
              rows={3}
              disabled={submitting}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="مثال: مسؤول عن الفئات العمرية تحت 16 سنة..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right resize-none disabled:opacity-50"
            ></textarea>
          </div>

          <div className="pt-2 flex space-x-3 space-x-reverse">
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{submitting ? 'جاري الحفظ سحابياً...' : isEditMode ? 'تحديث بيانات المدرب' : 'حفظ وتخزين المدرب'}</span>
            </button>
            <button 
              type="button"
              disabled={submitting}
              onClick={() => {
                setView('list');
                setSelectedCoach(null);
                setFormData({ fullName: '', phone: '', email: '', specialization: '', license: '', experience: '', notes: '', status: 'active' });
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    );
  }

  // --- شاشة العرض الرئيسية لقائمة بطاقات المدربين (Main Dashboard List) ---
  return (
    <div className="space-y-6 animate-fade-in relative">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة المدربين</h2>
          <p className="text-xs text-slate-500 mt-1">
            إجمالي المدربين المسجلين حياً: <span className="text-emerald-600 font-bold font-mono">{coaches.length}</span>
          </p>
        </div>
        {coaches.length > 0 && (
          <button 
            onClick={() => setView('add')}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>إضافة مدرب</span>
          </button>
        )}
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">لا يوجد مدربين مسجلين بعد</h3>
            <p className="text-slate-500 text-xs leading-relaxed px-4">
              قائمة طاقم التدريب فارغة. أضف المدرب الأول لبدء توزيع المهام الفنية.
            </p>
          </div>
          <button 
            onClick={() => setView('add')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>إضافة أول مدرب الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coaches.map((coach) => (
            <div 
              key={coach.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${coach.status === 'inactive' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h4 className="font-bold text-base text-slate-900">{coach.fullName}
