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
  Users, 
  UserPlus, 
  ArrowRight, 
  Save, 
  Calendar, 
  Phone, 
  Activity, 
  ShieldCheck, 
  Loader2, 
  Edit2, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

// واجهة تعريف بيانات اللاعب برمجياً للـ TypeScript
interface Player {
  id: string;
  fullName: string;
  birthDate: string;
  position: string;
  parentPhone: string;
  medicalNotes: string;
  createdAt: any;
}

// قاموس لترجمة مراكز اللعب للغة العربية في الواجهة
const positionTranslations: Record<string, string> = {
  Goalkeeper: 'حارس مرمى (GK)',
  Defender: 'مدافع (DF)',
  Midfielder: 'لاعب وسط (MF)',
  Forward: 'مهاجم (FW)',
};

export default function Players() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // حالات التحكم في اللاعب المختار والحذف
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // حالة استمارة الإدخال والتعديل
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    position: '',
    parentPhone: '',
    medicalNotes: ''
  });

  // جلب سياق الأكاديمية وإعداد المستمع اللحظي للاعبين
  useEffect(() => {
    let unsubscribePlayers: (() => void) | null = null;

    async function initializeContext() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // جلب معرف الأكاديمية الخاص بالمدرب الحالي
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          const currentAcademyId = uData?.academyId || null;
          setAcademyId(currentAcademyId);

          if (currentAcademyId) {
            // إعداد استعلام مراقبة اللاعبين التابعين لهذه الأكاديمية فقط
            const q = query(
              collection(db, 'players'),
              where('academyId', '==', currentAcademyId)
            );

            // الاستماع اللحظي للتغيرات في Firestore
            unsubscribePlayers = onSnapshot(q, (snapshot) => {
              const fetchedPlayers: Player[] = [];
              snapshot.forEach((doc) => {
                fetchedPlayers.push({
                  id: doc.id,
                  ...doc.data()
                } as Player);
              });

              // ترتيب اللاعبين محلياً في الذاكرة لتجنب مشاكل الفهرسة المركبة حالياً
              fetchedPlayers.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
              });

              setPlayers(fetchedPlayers);
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
        console.error("Error initializing players context:", error);
        setLoading(false);
      }
    }

    initializeContext();

    // تنظيف المستمع عند الخروج لحماية موارد النطاق الترددي
    return () => {
      if (unsubscribePlayers) unsubscribePlayers();
    };
  }, []);

  // دالة تحديث قيم الحقول ديناميكياً
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // الانتقال لوضع التعديل وحقن البيانات الحالية للاعب
  const startEdit = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      fullName: player.fullName,
      birthDate: player.birthDate,
      position: player.position,
      parentPhone: player.parentPhone,
      medicalNotes: player.medicalNotes
    });
    setView('edit');
  };

  // فتح نافذة تأكيد الحذف المخصصة للأمان
  const startDelete = (player: Player) => {
    setSelectedPlayer(player);
    setIsDeleteModalOpen(true);
  };

  // دالة حفظ لاعب جديد في Firestore
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyId || submitting) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'players'), {
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        position: formData.position,
        parentPhone: formData.parentPhone.trim(),
        medicalNotes: formData.medicalNotes.trim(),
        academyId: academyId,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });

      setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
      setView('list');
    } catch (error) {
      console.error("Error adding player:", error);
      alert("حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setSubmitting(false);
    }
  };

  // دالة تحديث بيانات اللاعب الحالية
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || submitting) return;
    setSubmitting(true);

    try {
      const playerDocRef = doc(db, 'players', selectedPlayer.id);
      await updateDoc(playerDocRef, {
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        position: formData.position,
        parentPhone: formData.parentPhone.trim(),
        medicalNotes: formData.medicalNotes.trim(),
        updatedAt: serverTimestamp()
      });

      setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
      setSelectedPlayer(null);
      setView('list');
    } catch (error) {
      console.error("Error updating player:", error);
      alert("حدث خطأ أثناء تحديث بيانات اللاعب.");
    } finally {
      setSubmitting(false);
    }
  };

  // دالة الحذف النهائية القطعية من السحابة
  const confirmDelete = async () => {
    if (!selectedPlayer || submitting) return;
    setSubmitting(true);

    try {
      const playerDocRef = doc(db, 'players', selectedPlayer.id);
      await deleteDoc(playerDocRef);
      
      setIsDeleteModalOpen(false);
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("حدث خطأ أثناء حذف اللاعب.");
    } finally {
      setSubmitting(false);
    }
  };

  // شاشة التحميل اللحظية لحين جلب البيانات سحابياً
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">جاري جلب قائمة اللاعبين من السحابة...</p>
      </div>
    );
  }

  // --- شاشات الإدخال والتعديل المتجاوبة ---
  if (view === 'add' || view === 'edit') {
    const isEditMode = view === 'edit';
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
          <button 
            type="button"
            onClick={() => {
              setView('list');
              setSelectedPlayer(null);
              setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
            }} 
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEditMode ? `تعديل بيانات: ${selectedPlayer?.fullName}` : 'إضافة لاعب جديد للأكاديمية'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode ? 'تعديل الحقول المطلوبة واضغط حفظ لتحديث قاعدة البيانات فوراً.' : 'سيتم تخزين هذا اللاعب بأمان تحت الهوية البرمجية لأكاديميتك.'}
            </p>
          </div>
        </div>

        <form onSubmit={isEditMode ? handleUpdateSubmit : handleAddSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">الاسم الكامل للاعب *</label>
            <input 
              type="text"
              name="fullName"
              required
              disabled={submitting}
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="مثال: أحمد كريم حسن"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">تاريخ الميلاد *</label>
              <input 
                type="date"
                name="birthDate"
                required
                disabled={submitting}
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">مركز اللعب المفضّل *</label>
              <select 
                name="position"
                required
                disabled={submitting}
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right appearance-none disabled:opacity-50"
              >
                <option value="">اختر المركز...</option>
                <option value="Goalkeeper">حارس مرمى (GK)</option>
                <option value="Defender">مدافع (DF)</option>
                <option value="Midfielder">لاعب وسط (MF)</option>
                <option value="Forward">مهاجم (FW)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">رقم هاتف ولي الأمر *</label>
            <input 
              type="tel"
              name="parentPhone"
              required
              disabled={submitting}
              value={formData.parentPhone}
              onChange={handleInputChange}
              placeholder="مثال: 077XXXXXXXX"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left dir-ltr placeholder:text-right disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">الملاحظات الطبية أو المحاذير (إن وجدت)</label>
            <textarea 
              name="medicalNotes"
              rows={3}
              disabled={submitting}
              value={formData.medicalNotes}
              onChange={handleInputChange}
              placeholder="مثال: يعاني من ربو خفيف، أو لا توجد ملاحظات..."
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
              <span>{submitting ? 'جاري الحفظ...' : isEditMode ? 'تحديث البيانات سحابياً' : 'حفظ وتخزين اللاعب'}</span>
            </button>
            <button 
              type="button"
              disabled={submitting}
              onClick={() => {
                setView('list');
                setSelectedPlayer(null);
                setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
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

  // --- شاشة العرض الرئيسية لقائمة اللاعبين والبطاقات التكتيكية ---
  return (
    <div className="space-y-6 animate-fade-in relative">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة اللاعبين</h2>
          <p className="text-xs text-slate-500 mt-1">
            إجمالي اللاعبين المسجلين حياً: <span className="text-emerald-600 font-bold font-mono">{players.length}</span>
          </p>
        </div>
        {players.length > 0 && (
          <button 
            onClick={() => setView('add')}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>إضافة لاعب</span>
          </button>
        )}
      </div>

      {players.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">لا يوجد لاعبين مسجلين بعد</h3>
            <p className="text-slate-500 text-xs leading-relaxed px-4">
              قائمة الأكاديمية فارغة. أضف لاعبك الأول لإدارة البيانات والتحكم الفني.
            </p>
          </div>
          <button 
            onClick={() => setView('add')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>إضافة أول لاعب الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-base text-slate-900">{player.fullName}</h4>
                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                      {positionTranslations[player.position] || player.position}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button 
                      onClick={() => startEdit(player)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="تعديل بيانات اللاعب"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => startDelete(player)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="حذف اللاعب نهائياً"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-b border-slate-50 py-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5 space-x-reverse">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>المواليد: {player.birthDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 space-x-reverse dir-rtl">
                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 font-mono text-[11px]">{player.parentPhone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl flex items-start space-x-2 space-x-reverse">
                  <Activity className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    <span className="font-bold text-slate-700">الملف الطبي:</span>{' '}
                    {player.medicalNotes || 'لا توجد محاذير طبية مسجلة.'}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- نافذة تأكيد الحذف المخصصة والآمنة (Custom Delete Modal Overlay) --- */}
      {isDeleteModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">هل أنت متأكد من حذف اللاعب؟</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                سيتم حذف اللاعب <span className="font-bold text-slate-900">"{selectedPlayer.fullName}"</span> نهائياً وبشكل قطعي من خوادم الأكاديمية السحابية. لا يمكن التراجع عن ه
