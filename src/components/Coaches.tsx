import { useState, useEffect, FormEvent } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  Award,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ==================== Types ====================
interface Coach {
  id: string;
  academyId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  certificates: string;
  notes: string;
  createdAt: { seconds: number } | null;
  updatedAt: { seconds: number } | null;
}

interface CoachFormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  certificates: string;
  notes: string;
}

const initialFormData: CoachFormData = {
  fullName: "",
  email: "",
  phone: "",
  specialization: "",
  experience: "",
  certificates: "",
  notes: "",
};

// ==================== Component ====================
export default function Coaches() {
  // ==================== States ====================
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState<CoachFormData>(initialFormData);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [academyId, setAcademyId] = useState<string>("");
  const [academyLoading, setAcademyLoading] = useState<boolean>(true);

  // ==================== Get Academy ID ====================
  useEffect(() => {
    let isMounted = true;

    const fetchAcademyId = async (): Promise<void> => {
      try {
        setAcademyLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          if (isMounted) {
            setError("يجب تسجيل الدخول أولاً");
            setAcademyLoading(false);
            setLoading(false);
          }
          return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDocs(
          query(collection(db, "users"), where("__name__", "==", currentUser.uid))
        );

        if (userSnap.empty) {
          if (isMounted) {
            setError("لم يتم العثور على بيانات المستخدم");
            setAcademyLoading(false);
            setLoading(false);
          }
          return;
        }

        const userData = userSnap.docs[0].data();
        const academy = userData?.academyId as string | undefined;

        if (!academy) {
          if (isMounted) {
            setError("لم يتم العثور على academyId للمستخدم");
            setAcademyLoading(false);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setAcademyId(academy);
          setAcademyLoading(false);
        }
      } catch (err) {
        console.error("Error fetching academyId:", err);
        if (isMounted) {
          setError("حدث خطأ أثناء جلب بيانات الأكاديمية");
          setAcademyLoading(false);
          setLoading(false);
        }
      }
    };

    void fetchAcademyId();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==================== Load Coaches ====================
  useEffect(() => {
    let isMounted = true;

    const loadCoaches = async (): Promise<void> => {
      if (!academyId) return;

      try {
        setLoading(true);
        setError("");

        const coachesRef = collection(db, "coaches");
        const q = query(coachesRef, where("academyId", "==", academyId));
        const querySnapshot = await getDocs(q);

        const coachesList: Coach[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          coachesList.push({
            id: docSnap.id,
            academyId: data.academyId || "",
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            experience: data.experience || "",
            certificates: data.certificates || "",
            notes: data.notes || "",
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          });
        });

        if (isMounted) {
          setCoaches(coachesList);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading coaches:", err);
        if (isMounted) {
          setError("حدث خطأ أثناء تحميل المدربين");
          setLoading(false);
        }
      }
    };

    void loadCoaches();

    return () => {
      isMounted = false;
    };
  }, [academyId]);

  // ==================== Auto Clear Messages ====================
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error && error !== "يجب تسجيل الدخول أولاً") {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ==================== Reset Form ====================
  const resetForm = (): void => {
    setFormData(initialFormData);
    setEditingCoach(null);
    setShowModal(false);
  };

  // ==================== Handle Form Submit ====================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError("الاسم الكامل مطلوب");
      return;
    }

    if (!formData.email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const coachData = {
        academyId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        experience: formData.experience.trim(),
        certificates: formData.certificates.trim(),
        notes: formData.notes.trim(),
        updatedAt: serverTimestamp(),
      };

      if (editingCoach) {
        const coachDocRef = doc(db, "coaches", editingCoach.id);
        await updateDoc(coachDocRef, coachData);
        setSuccess("تم تحديث بيانات المدرب بنجاح");
      } else {
        const coachesRef = collection(db, "coaches");
        await addDoc(coachesRef, {
          ...coachData,
          createdAt: serverTimestamp(),
        });
        setSuccess("تم إضافة المدرب بنجاح");
      }

      resetForm();

      // Reload coaches
      const q = query(collection(db, "coaches"), where("academyId", "==", academyId));
      const querySnapshot = await getDocs(q);
      const coachesList: Coach[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        coachesList.push({
          id: docSnap.id,
          academyId: data.academyId || "",
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          experience: data.experience || "",
          certificates: data.certificates || "",
          notes: data.notes || "",
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      });
      setCoaches(coachesList);
    } catch (err) {
      console.error("Error saving coach:", err);
      setError("حدث خطأ أثناء حفظ بيانات المدرب");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== Handle Edit ====================
  const handleEdit = (coach: Coach): void => {
    setEditingCoach(coach);
    setFormData({
      fullName: coach.fullName,
      email: coach.email,
      phone: coach.phone,
      specialization: coach.specialization,
      experience: coach.experience,
      certificates: coach.certificates,
      notes: coach.notes,
    });
    setShowModal(true);
  };

  // ==================== Handle Delete ====================
  const handleDelete = async (coachId: string, coachName: string): Promise<void> => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المدرب "${coachName}"؟\nلا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmed) return;

    try {
      setError("");
      const coachDocRef = doc(db, "coaches", coachId);
      await deleteDoc(coachDocRef);

      setCoaches((prev) => prev.filter((c) => c.id !== coachId));
      setSuccess("تم حذف المدرب بنجاح");
    } catch (err) {
      console.error("Error deleting coach:", err);
      setError("حدث خطأ أثناء حذف المدرب");
    }
  };

  // ==================== Filtered Coaches ====================
  const filteredCoaches = coaches.filter((coach) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      coach.fullName.toLowerCase().includes(q) ||
      coach.email.toLowerCase().includes(q) ||
      coach.phone.includes(q) ||
      coach.specialization.toLowerCase().includes(q)
    );
  });
  // ==================== Render ====================
  if (academyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">إدارة المدربين</h1>
        </div>
        <p className="text-gray-600">إدارة مدربي الأكاديمية ومتابعة بياناتهم</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">{success}</p>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، الهاتف، أو التخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          إضافة مدرب جديد
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">جاري تحميل المدربين...</p>
          </div>
        </div>
      ) : filteredCoaches.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد مدربين حالياً"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "جرب البحث بكلمات مختلفة"
              : "ابدأ بإضافة أول مدرب للأكاديمية"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              إضافة مدرب
            </button>
          )}
        </div>
      ) : (
        /* Coaches Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Coach Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {coach.fullName}
                  </h3>
                  {coach.specialization && (
                    <p className="text-sm text-blue-600 font-medium">
                      {coach.specialization}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(coach)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(coach.id, coach.fullName)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Coach Info */}
              <div className="space-y-3 mb-4">
                {coach.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{coach.email}</span>
                  </div>
                )}
                {coach.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span dir="ltr">{coach.phone}</span>
                  </div>
                )}
                {coach.experience && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{coach.experience}</span>
                  </div>
                )}
                {coach.certificates && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{coach.certificates}</span>
                  </div>
                )}
                {coach.notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{coach.notes}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                {coach.createdAt && (
                  <p>
                    أضيف في:{" "}
                    {new Date(coach.createdAt.seconds * 1000).toLocaleDateString(
                      "ar-EG"
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCoach ? "تعديل بيانات المدرب" : "إضافة مدرب جديد"}
                </h2>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="أدخل الاسم الكامل للمدرب"
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="example@email.com"
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+20 123 456 7890"
                      dir="ltr"
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Specialization & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التخصص
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="مثال: مدرب حراس، مدرب لياقة..."
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنوات الخبرة
                  </label>
                  <div className="relative">
                    <Award className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: e.target.value,
                        })
                      }
                      placeholder="مثال: 5 سنوات"
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشهادات والبطاقات
                </label>
                <div className="relative">
                  <Award className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.certificates}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificates: e.target.value,
                      })
                    }
                    placeholder="اذكر الشهادات والبطاقات المهنية..."
                    rows={3}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="أي ملاحظات إضافية عن المدرب..."
                    rows={3}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingCoach ? "تحديث" : "إضافة"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
              }
