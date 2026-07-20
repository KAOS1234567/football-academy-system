import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { Users, UserPlus, ArrowRight, Save, Calendar, Phone, Activity, ShieldCheck, Loader2 } from 'lucide-react';

// واجهة تعريف بيانات اللاعب برمجياً
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
  const [view, setView] = useState<'list' | 'add'>('list');
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // حالة استمارة الإدخال
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    position: '',
    parentPhone: '',
    medicalNotes: ''
  });

  // 1. جلب سياق الأكاديمية وإعداد المستمع اللحظي للاعبين
  useEffect(() => {
    let unsubscribePlayers: (() => void) | null = null;

    async function initializeContext() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // جلب معرف الأكاديمية الخاص بالمدرب الحالي
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          const currentAcademyId = uData.academyId;
          setAcademyId(currentAcademyId);

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

            // ترتيب اللاعبين محلياً في الذاكرة من الأحدث للأقدم لتجنب مشاكل الفهرسة المركبة حالياً
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
        }
      } catch (error) {
        console.error("Error initializing players context:", error);
        setLoading(false);
      }
    }

    initializeContext();

    // تنظيف المستمع عند الخروج من المكون لحفظ استهلاك قراءات الـ Firebase
    return () => {
      if (unsubscribePlayers) unsubscribePlayers();
    };
  }, []);

  // دالة تحديث قيم الحقول
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. معالجة حفظ البيانات الفعلي في Firestore
  const handleFirestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyId || submitting) return;

    setSubmitting(true);

    try {
      // إدخال الوثيقة في مجموعة players الرئيسية مع عزل الـ SaaS
      await addDoc(collection(db, 'players'), {
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        position: formData.position,
        parentPhone: formData.parentPhone.trim(),
        medicalNotes: formData.medicalNotes.trim(),
        academyId: academyId,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp() // طابع زمني دقيق وموحد من خوادم جوجل
      });

      // تنظيف الاستمارة والعودة تلقائياً
      setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
      setView('list');
    } catch (error) {
      console.error("Error saving player to Firestore:", error);
      alert("حدث خطأ أثناء حفظ البيانات، يرجى التحقق من اتصالك بالإنترنت.");
    } finally {
      setSubmitting(false);
    }
  };

  // شاشة التحميل الأولية أثناء جلب البيانات من السحابة
  if (loading) {
    return (
      <div class="py-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 class="h-8 w-8 text-emerald-600 animate-spin" />
        <p class="text-xs text-slate-500 font-semibold">جاري جلب قائمة اللاعبين من السحابة...</p>
      </div>
    );
  }

  // --- شاشة نموذج إضافة لاعب جديد ---
  if (view === 'add') {
    return (
      <div class="space-y-6 animate-fade-in pb-12">
        
        <div class="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
          <button 
            type="button"
            onClick={() => setView('list')} 
            class="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="رجوع"
          >
            <ArrowRight class="h-5 w-5" />
          </button>
          <div>
            <h2 class="text-lg font-black text-slate-900">إضافة لاعب جديد للأكاديمية</h2>
            <p class="text-xs text-slate-500 mt-0.5">سيتم تخزين هذا اللاعب بأمان تحت الهوية البرمجية لأكاديميتك.</p>
          </div>
        </div>

        <form onSubmit={handleFirestoreSubmit} class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">الاسم الكامل للاعب *</label>
            <input 
              type="text"
              name="fullName"
              required
              disabled={submitting}
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="مثال: أحمد كريم حسن"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-700 block">تاريخ الميلاد *</label>
              <input 
                type="date"
                name="birthDate"
                required
                disabled={submitting}
                value={formData.birthDate}
                onChange={handleInputChange}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right disabled:opacity-50"
              />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-700 block">مركز اللعب المفضّل *</label>
              <select 
                name="position"
                required
                disabled={submitting}
                value={formData.position}
                onChange={handleInputChange}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right appearance-none disabled:opacity-50"
              >
                <option value="">اختر المركز...</option>
                <option value="Goalkeeper">حارس مرمى (GK)</option>
                <option value="Defender">مدافع (DF)</option>
                <option value="Midfielder">لاعب وسط (MF)</option>
                <option value="Forward">مهاجم (FW)</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">رقم هاتف ولي الأمر *</label>
            <input 
              type="tel"
              name="parentPhone"
              required
              disabled={submitting}
              value={formData.parentPhone}
              onChange={handleInputChange}
              placeholder="مثال: 077XXXXXXXX"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left dir-ltr placeholder:text-right disabled:opacity-50"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">الملاحظات الطبية أو المحاذير (إن وجدت)</label>
            <textarea 
              name="medicalNotes"
              rows={3}
              disabled={submitting}
              value={formData.medicalNotes}
              onChange={handleInputChange}
              placeholder="مثال: يعاني من ربو خفيف، أو لا توجد ملاحظات..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right resize-none disabled:opacity-50"
            ></textarea>
          </div>

          <div class="pt-2 flex space-x-3 space-x-reverse">
            <button 
              type="submit"
              disabled={submitting}
              class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {submitting ? <Loader2 class="h-4 w-4 animate-spin" /> : <Save class="h-4 w-4" />}
              <span>{submitting ? 'جاري الحفظ سحابياً...' : 'حفظ وتخزين اللاعب'}</span>
            </button>
            <button 
              type="button"
              disabled={submitting}
              onClick={() => setView('list')}
              class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    );
  }

  // --- شاشة العرض الرئيسية لقائمة اللاعبين الحقيقية ---
  return (
    <div class="space-y-6 animate-fade-in">
      
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-xl font-black text-slate-900">إدارة اللاعبين</h2>
          <p class="text-xs text-slate-500 mt-1">
            إجمالي اللاعبين المسجلين حياً: <span class="text-emerald-600 font-bold font-mono">{players.length}</span>
          </p>
        </div>
        {players.length > 0 && (
          <button 
            onClick={() => setView('add')}
            class="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus class="h-3.5 w-3.5" />
            <span>إضافة لاعب</span>
          </button>
        )}
      </div>

      {/* الحالة أ: إذا كانت قاعدة البيانات فارغة تماماً لهذا المستخدم */}
      {players.length === 0 ? (
        <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8 space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
            <Users class="h-8 w-8" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-base text-slate-900">لا يوجد لاعبين مسجلين بعد</h3>
            <p class="text-slate-500 text-xs leading-relaxed px-4">
              قاعدة البيانات السحابية فارغة حالياً. أضف أول لاعب لتجربة المزامنة والتدفق الحي للبيانات.
            </p>
          </div>
          
          <button 
            onClick={() => setView('add')}
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
          >
            <UserPlus class="h-4 w-4" />
            <span>إضافة أول لاعب الآن</span>
          </button>
        </div>
      ) : (
        /* الحالة ب: عرض اللاعبين الفعليين (Mobile-First Cards Structure) */
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {players.map((player) => (
            <div 
              key={player.id} 
              class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all relative overflow-hidden"
            >
              {/* شريط علوي جانبي يعبر عن المركز */}
              <div class="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>

              <div class="flex items-start justify-between">
                <div class="space-y-0.5">
                  <h4 class="font-bold text-base text-slate-900">{player.fullName}</h4>
                  <span class="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                    {positionTranslations[player.position] || player.position}
                  </span>
                </div>
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck class="h-4 w-4" />
                </div>
              </div>

              {/* تفاصيل اللاعب الفنية والاتصال */}
              <div class="grid grid-cols-2 gap-3 border-t border-b border-slate-50 py-3 text-xs text-slate-600">
                <div class="flex items-center space-x-1.5 space-x-reverse">
                  <Calendar class="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>المواليد: {player.birthDate}</span>
                </div>
                <div class="flex items-center space-x-1.5 space-x-reverse dir-rtl">
                  <Phone class="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span class="font-semibold text-slate-700 font-mono text-[11px]">{player.parentPhone}</span>
                </div>
              </div>

              {/* الملاحظات الطبية التكتيكية */}
              <div class="bg-slate-50 p-2.5 rounded-xl flex items-start space-x-2 space-x-reverse">
                <Activity class="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p class="text-[11px] text-slate-500 leading-normal">
                  <span class="font-bold text-slate-700">الملف الطبي:</span>{' '}
                  {player.medicalNotes || 'لا توجد محاذير طبية مسجلة.'}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
  
