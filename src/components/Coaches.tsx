import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  doc,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  UserCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Award,
  Briefcase,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// TypeScript Interfaces
interface Coach {
  id: string;
  academyId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  certificates: string[];
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CoachFormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  certificates: string;
  notes: string;
}

// Sub-components

// Loading Skeleton
const CoachCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

// Empty State
const EmptyState: React.FC = () => (
  <div className="text-center py-16 px-4">
    <div className="w-24 h-24 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
      <UserCircle className="w-12 h-12 text-emerald-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">لا يوجد مدربين بعد</h3>
    <p className="text-gray-600 mb-8">ابدأ بإضافة أول مدرب لأكاديميتك</p>
  </div>
);

// Error State
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="text-center py-16 px-4">
    <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
      <AlertCircle className="w-12 h-12 text-red-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
    >
      إعادة المحاولة
    </button>
  </div>
);

// Coach Card Component
interface CoachCardProps {
  coach: Coach;
  onEdit: (coach: Coach) => void;
  onDelete: (coach: Coach) => void;
}

const CoachCard: React.FC<CoachCardProps> = ({ coach, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {coach.fullName.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{coach.fullName}</h3>
          <p className="text-sm text-emerald-600 font-medium">{coach.specialization}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(coach)}
          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          aria-label="تعديل"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(coach)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="حذف"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <Mail className="w-4 h-4" />
        <span dir="ltr">{coach.email}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="w-4 h-4" />
        <span dir="ltr">{coach.phone}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Briefcase className="w-4 h-4" />
        <span>{coach.experience} سنوات خبرة</span>
      </div>
      {coach.certificates.length > 0 && (
        <div className="flex items-start gap-2 text-gray-600">
          <Award className="w-4 h-4 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {coach.certificates.slice(0, 2).map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium"
              >
                {cert}
              </span>
            ))}
            {coach.certificates.length > 2 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs">
                +{coach.certificates.length - 2}
              </span>
            )}
          </div>
        </div>
      )}
      {coach.notes && (
        <div className="flex items-start gap-2 text-gray-600 pt-2 border-t border-gray-100">
          <FileText className="w-4 h-4 mt-0.5" />
          <p className="text-xs leading-relaxed">{coach.notes}</p>
        </div>
      )}
    </div>
  </div>
);

// Coach Form Modal
interface CoachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoachFormData) => Promise<void>;
  initialData?: Coach;
  isLoading: boolean;
}

const CoachFormModal: React.FC<CoachFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const [formData, setFormData] = useState<CoachFormData>({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: 0,
    certificates: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CoachFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        email: initialData.email,
        phone: initialData.phone,
        specialization: initialData.specialization,
        experience: initialData.experience,
        certificates: initialData.certificates.join(', '),
        notes: initialData.notes
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        specialization: '',
        experience: 0,
        certificates: '',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CoachFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'بريد إلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[\d\s+-]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم هاتف غير صحيح';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'التخصص مطلوب';
    }

    if (formData.experience < 0) {
      newErrors.experience = 'سنوات الخبرة يجب أن تكون رقم موجب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  errors.fullName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="أدخل اسم المدرب"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="coach@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="+966 50 123 4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  التخصص *
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.specialization ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="مدرب حراس، مدرب لياقة، إلخ"
                />
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  سنوات الخبرة
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.experience ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الشهادات (مفصولة بفاصلة)
              </label>
              <input
                type="text"
                value={formData.certificates}
                onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="UEFA Pro License, AFC A License"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="أي ملاحظات إضافية عن المدرب..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>{initialData ? 'تحديث' : 'إضافة'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteModalProps {
  isOpen: boolean;
  coach: Coach | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  coach,
  onConfirm,
  onCancel,
  isLoading
}) => {
  if (!isOpen || !coach) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">حذف المدرب</h3>
        <p className="text-gray-600 text-center mb-6">
          هل أنت متأكد من حذف المدرب <span className="font-semibold">{coach.fullName}</span>؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <span>حذف</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Toast
interface SuccessToastProps {
  message: string;
  isVisible: boolean;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
};// Main Coaches Component
const Coaches: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Get academyId from authenticated user
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAcademyId(userData.academyId || null);
          } else {
            setError('لم يتم العثور على بيانات المستخدم');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('فشل في تحميل بيانات المستخدم');
        }
      } else {
        setError('يجب تسجيل الدخول أولاً');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load coaches from Firestore
  const loadCoaches = async () => {
    if (!academyId) return;

    try {
      setLoading(true);
      setError(null);
      
      const coachesQuery = query(
        collection(db, 'coaches'),
        where('academyId', '==', academyId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(coachesQuery);
      const coachesData: Coach[] = [];
      
      querySnapshot.forEach((doc) => {
        coachesData.push({
          id: doc.id,
          ...doc.data()
        } as Coach);
      });
      
      setCoaches(coachesData);
    } catch (err) {
      console.error('Error loading coaches:', err);
      setError('فشل في تحميل المدربين. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (academyId) {
      loadCoaches();
    }
  }, [academyId]);

  // Show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Add new coach
  const handleAddCoach = async (formData: CoachFormData) => {
    if (!academyId) return;

    try {
      setIsSubmitting(true);
      
      const certificatesArray = formData.certificates
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0);
      
      const coachData = {
        academyId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        experience: formData.experience,
        certificates: certificatesArray,
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'coaches'), coachData);
      
      setIsFormModalOpen(false);
      await loadCoaches();
      showSuccessMessage('تم إضافة المدرب بنجاح');
    } catch (err) {
      console.error('Error adding coach:', err);
      throw new Error('فشل في إضافة المدرب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update coach
  const handleUpdateCoach = async (formData: CoachFormData) => {
    if (!selectedCoach) return;
    
    try {
      setIsSubmitting(true);
      
      const certificatesArray = formData.certificates
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0);
      
      const coachData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        experience: formData.experience,
        certificates: certificatesArray,
        notes: formData.notes.trim(),
        updatedAt: serverTimestamp()
      };
      
      const coachDocRef = doc(db, 'coaches', selectedCoach.id);
      await updateDoc(coachDocRef, coachData);
      
      setIsFormModalOpen(false);
      setSelectedCoach(null);
      await loadCoaches();
      showSuccessMessage('تم تحديث بيانات المدرب بنجاح');
    } catch (err) {
      console.error('Error updating coach:', err);
      throw new Error('فشل في تحديث بيانات المدرب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete coach
  const handleDeleteCoach = async () => {
    if (!selectedCoach) return;
    
    try {
      setIsSubmitting(true);
      
      const coachDocRef = doc(db, 'coaches', selectedCoach.id);
      await deleteDoc(coachDocRef);
      
      setIsDeleteModalOpen(false);
      setSelectedCoach(null);
      await loadCoaches();
      showSuccessMessage('تم حذف المدرب بنجاح');
    } catch (err) {
      console.error('Error deleting coach:', err);
      throw new Error('فشل في حذف المدرب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsFormModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsDeleteModalOpen(true);
  };

  // Close form modal
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCoach(null);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCoach(null);
  };

  // Filter coaches by search query
  const filteredCoaches = coaches.filter((coach) => {
    const query = searchQuery.toLowerCase();
    return (
      coach.fullName.toLowerCase().includes(query) ||
      coach.email.toLowerCase().includes(query) ||
      coach.phone.includes(query) ||
      coach.specialization.toLowerCase().includes(query)
    );
  });

  // Auth loading state
  if (authLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CoachCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
        <ErrorState message={error} onRetry={loadCoaches} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Success Toast */}
      <SuccessToast message={successMessage} isVisible={showSuccess} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المدربين</h1>
            <p className="text-gray-600">إدارة مدربي الأكاديمية</p>
          </div>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مدرب</span>
          </button>
        </div>

        {/* Search Bar */}
        {coaches.length > 0 && (
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مدرب بالاسم، البريد، الهاتف، أو التخصص..."
              className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {coaches.length === 0 && <EmptyState />}

      {/* Coaches Grid */}
      {coaches.length > 0 && (
        <>
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">لا توجد نتائج مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <CoachFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={selectedCoach ? handleUpdateCoach : handleAddCoach}
        initialData={selectedCoach || undefined}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        coach={selectedCoach}
        onConfirm={handleDeleteCoach}
        onCancel={handleCloseDeleteModal}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Coaches;
