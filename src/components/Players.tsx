import { useState } from 'react';
import { Users, UserPlus, ArrowRight, Save, ShieldAlert } from 'lucide-react';

export default function Players() {
  // التحكم في الشاشة النشطة داخل المكون
  const [view, setView] = useState<'list' | 'add'>('list');

  // الحالة البرمجية لتجميع بيانات النموذج
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    position: '',
    parentPhone: '',
    medicalNotes: ''
  });

  // دالة تحديث الحقول ديناميكياً
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // معالجة الإرسال التجريبي واختبار جودة البيانات
  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // طباعة البيانات في الكونسول للتأكد من سلامة الحقول قبل ربط Firestore
    console.log('--- فحص البيانات الملتقطة بنجاح ---');
    console.log('الاسم الكامل:', formData.fullName);
    console.log('تاريخ الميلاد:', formData.birthDate);
    console.log('مركز اللعب:', formData.position);
    console.log('رقم ولي الأمر:', formData.parentPhone);
    console.log('الملاحظات الطبية:', formData.medicalNotes || 'لا توجد');
    
    alert(`تنبيه المطور: تم التحقق من النموذج بنجاح!\nاللاعب: ${formData.fullName}\nالخطوة التالية هي الربط مع قواعد البيانات.`);
    
    // تصفير الحقول والعودة للشاشة الرئيسية
    setFormData({ fullName: '', birthDate: '', position: '', parentPhone: '', medicalNotes: '' });
    setView('list');
  };

  // --- الشاشة الأولى: شاشة نموذج إضافة لاعب جديد ---
  if (view === 'add') {
    return (
      <div class="space-y-6 animate-fade-in pb-12">
        
        {/* هيدر النموذج وزر العودة التكتيكي */}
        <div class="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4">
          <button 
            onClick={() => setView('list')} 
            class="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="رجوع"
          >
            <ArrowRight class="h-5 w-5" />
          </button>
          <div>
            <h2 class="text-lg font-black text-slate-900">إضافة لاعب جديد للأكاديمية</h2>
            <p class="text-xs text-slate-500 mt-0.5">يرجى ملء البيانات الأساسية للاعب بدقة.</p>
          </div>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleLocalSubmit} class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          
          {/* حقل الاسم الكامل */}
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">الاسم الكامل للاعب *</label>
            <input 
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="مثال: أحمد كريم حسن"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right"
            />
          </div>

          {/* شبكة من حقلين متجاورين: المواليد ومركز اللعب */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* حقل تاريخ الميلاد */}
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-700 block">تاريخ الميلاد *</label>
              <input 
                type="date"
                name="birthDate"
                required
                value={formData.birthDate}
                onChange={handleInputChange}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right"
              />
            </div>

            {/* حقل مركز اللعب التكتيكي */}
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-700 block">مركز اللعب المفضّل *</label>
              <select 
                name="position"
                required
                value={formData.position}
                onChange={handleInputChange}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right appearance-none"
              >
                <option value="">اختر المركز...</option>
                <option value="Goalkeeper">حارس مرمى (GK)</option>
                <option value="Defender">مدافع (DF)</option>
                <option value="Midfielder">لاعب وسط (MF)</option>
                <option value="Forward">مهاجم (FW)</option>
              </select>
            </div>

          </div>

          {/* حقل رقم ولي الأمر */}
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">رقم هاتف ولي الأمر *</label>
            <input 
              type="tel"
              name="parentPhone"
              required
              value={formData.parentPhone}
              onChange={handleInputChange}
              placeholder="مثال: 077XXXXXXXX"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left dir-ltr placeholder:text-right"
            />
          </div>

          {/* حقل الملاحظات الطبية */}
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">الملاحظات الطبية أو المحاذير (إن وجدت)</label>
            <textarea 
              name="medicalNotes"
              rows={3}
              value={formData.medicalNotes}
              onChange={handleInputChange}
              placeholder="مثال: يعاني من ربو خفيف، أو لا توجد ملاحظات..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right resize-none"
            ></textarea>
          </div>

          {/* التنبيه الإرشادي المؤقت */}
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-2 space-x-reverse">
            <ShieldAlert class="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p class="text-[11px] text-amber-700 leading-normal">
              النموذج يعمل حالياً في وضع الفحص والتدقيق المحلي المحمي. الضغط على حفظ سيقوم بالتحقق من جودة الإدخال برمجياً دون تخزين سحابي في هذه المرحلة.
            </p>
          </div>

          {/* أزرار التحكم والعمليات */}
          <div class="pt-2 flex space-x-3 space-x-reverse">
            <button 
              type="submit"
              class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-200 transition-all"
            >
              <Save class="h-4 w-4" />
              <span>اختبار وحفظ اللاعب</span>
            </button>
            <button 
              type="button"
              onClick={() => setView('list')}
              class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    );
  }

  // --- الشاشة الثانية: شاشة العرض الرئيسية للاعبين (عندما تكون الحالة 'list') ---
  return (
    <div class="space-y-6 animate-fade-in">
      
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-xl font-black text-slate-900">إدارة اللاعبين</h2>
          <p class="text-xs text-slate-500 mt-1">هنا يمكنك إدارة ملفات اللاعبين المشتركين، مستوياتهم، وبياناتهم الطبية.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8 space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
          <Users class="h-8 w-8" />
        </div>
        <div class="space-y-1">
          <h3 class="font-bold text-base text-slate-900">قائمة اللاعبين فارغة حالياً</h3>
          <p class="text-slate-500 text-xs leading-relaxed px-4">
            ابدأ بتجربة واجهة الإدخال الجديدة والتأكد من انسيابية حركة الحقول على شاشة هاتفك.
          </p>
        </div>
        
        {/* تفعيل الزر بربطه بـ تفعيل شاشة الإدخال */}
        <button 
          onClick={() => setView('add')}
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 space-x-reverse shadow-sm shadow-emerald-100 transition-all"
        >
          <UserPlus class="h-4 w-4" />
          <span>إضافة لاعب جديد</span>
        </button>
      </div>

    </div>
  );
      }
