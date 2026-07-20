import { UserPlus, Users } from 'lucide-react';

export default function Players() {
  return (
    <div class="space-y-6 animate-fade-in">
      
      {/* هيدر الصفحة وعنوانها */}
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-xl font-black text-slate-900">إدارة اللاعبين</h2>
          <p class="text-xs text-slate-500 mt-1">هنا يمكنك إدارة ملفات اللاعبين المشتركين، مستوياتهم، وبياناتهم الطبية.</p>
        </div>
      </div>

      {/* بطاقة الواجهة الفارغة والجاهزة للتطوير القادم */}
      <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8 space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
          <Users class="h-8 w-8" />
        </div>
        <div class="space-y-1">
          <h3 class="font-bold text-base text-slate-900">قائمة اللاعبين فارغة حالياً</h3>
          <p class="text-slate-500 text-xs leading-relaxed px-4">
            في الخطوة القادمة، سنقوم ببناء نموذج إضافة الكابتن للاعبين الجدد وربط القائمة بقواعد بيانات Firestore المعزولة.
          </p>
        </div>
        
        {/* زر تجريبي غير مفعل لإعطاء انطباع بالـ UI النهائي */}
        <button class="w-full py-3 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse transition-all">
          <UserPlus class="h-4 w-4" />
          <span>إضافة لاعب جديد (قريباً)</span>
        </button>
      </div>

    </div>
  );
}
