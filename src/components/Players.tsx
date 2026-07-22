import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Phone,
  Calendar,
  Filter,
  AlertTriangle,
  Check,
  User as UserIcon,
  Target,
  Stethoscope,
  Loader2,
  SortAsc,
  SortDesc,
} from 'lucide-react';

// ============ Types ============
interface Player {
  id: string;
  academyId: string;
  fullName: string;
  birthDate: string;
  position: string;
  parentPhone: string;
  medicalNotes: string;
  createdAt?: any;
  updatedAt?: any;
}

interface PlayerFormData {
  fullName: string;
  birthDate: string;
  position: string;
  parentPhone: string;
  medicalNotes: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface PlayersProps {
  academyId: string;
}

// ============ Constants ============
const POSITIONS = [
  {
    value: 'goalkeeper',
    label: 'حارس مرمى',
    short: 'حارس',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'defender',
    label: 'مدافع',
    short: 'مدافع',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'midfielder',
    label: 'لاعب وسط',
    short: 'وسط',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'forward',
    label: 'مهاجم',
    short: 'مهاجم',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

const POSITION_MAP: Record<string, (typeof POSITIONS)[number]> = POSITIONS.reduce(
  (acc, pos) => ({ ...acc, [pos.value]: pos }),
  {} as Record<string, (typeof POSITIONS)[number]>
);

const INITIAL_FORM: PlayerFormData = {
  fullName: '',
  birthDate: '',
  position: '',
  parentPhone: '',
  medicalNotes: '',
};

type SortField = 'fullName' | 'birthDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

// ============ Helpers ============
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============ Sub-Components ============

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 left-4 right-4 md:right-6 md:left-auto md:top-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border animate-slide-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/95 border-emerald-400 text-white'
              : 'bg-rose-500/95 border-rose-400 text-white'
          }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col animate-slide-up`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  onEdit,
  onDelete,
}: {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}) {
  const position = POSITION_MAP[player.position];
  const age = calculateAge(player.birthDate);
  const initials = getInitials(player.fullName);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`relative flex-shrink-0 w-14 h-14 rounded-2xl ${
              position?.color || 'bg-slate-500'
            } flex items-center justify-center text-white font-bold text-lg shadow-md`}
          >
            {initials}
            {player.medicalNotes && (
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                <Stethoscope className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base truncate">
              {player.fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {position ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${position.lightColor}`}
                >
                  {position.short}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  غير محدد
                </span>
              )}
              {age > 0 && (
                <span className="text-xs text-slate-500">{age} سنة</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {player.birthDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{formatDate(player.birthDate)}</span>
            </div>
          )}
          {player.parentPhone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href={`tel:${player.parentPhone}`}
                className="truncate hover:text-indigo-600 transition-colors"
                dir="ltr"
              >
                {player.parentPhone}
              </a>
            </div>
          )}
          {player.medicalNotes && (
            <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
              <Stethoscope className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{player.medicalNotes}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onEdit(player)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            تعديل
          </button>
          <button
            onClick={() => onDelete(player)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Main Component ============
export default function Players({ academyId }: PlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Partial<PlayerFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchPlayers = async () => {
    if (!academyId) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'players'),
        where('academyId', '==', academyId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Player, 'id'>),
      }));
      setPlayers(data);
    } catch (error: any) {
      console.error('Error fetching players:', error);
      showToast('error', error?.message || 'حدث خطأ أثناء تحميل اللاعبين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academyId]);

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(term) ||
          p.parentPhone.includes(term) ||
          p.medicalNotes.toLowerCase().includes(term)
      );
    }

    if (positionFilter !== 'all') {
      result = result.filter((p) => p.position === positionFilter);
    }

    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'birthDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortField === 'createdAt') {
        aVal = aVal?.toMillis?.() || aVal?.seconds || 0;
        bVal = bVal?.toMillis?.() || bVal?.seconds || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [players, search, positionFilter, sortField, sortDirection]);

  const stats = useMemo(() => {
    const byPosition: Record<string, number> = {};
    POSITIONS.forEach((p) => (byPosition[p.value] = 0));
    players.forEach((p) => {
      if (p.position && byPosition[p.position] !== undefined) {
        byPosition[p.position]++;
      }
    });
    return { total: players.length, byPosition };
  }, [players]);

  const openAddForm = () => {
    setSelectedPlayer(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      fullName: player.fullName || '',
      birthDate: player.birthDate || '',
      position: player.position || '',
      parentPhone: player.parentPhone || '',
      medicalNotes: player.medicalNotes || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<PlayerFormData> = {};
    if (!formData.fullName.trim()) errors.fullName = 'الاسم مطلوب';
    if (!formData.birthDate) errors.birthDate = 'تاريخ الميلاد مطلوب';
    if (!formData.position) errors.position = 'المركز مطلوب';
    if (!formData.parentPhone.trim()) errors.parentPhone = 'رقم ولي الأمر مطلوب';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!academyId) return;

    setSubmitting(true);
    try {
      const payload = {
        academyId,
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        position: formData.position,
        parentPhone: formData.parentPhone.trim(),
        medicalNotes: formData.medicalNotes.trim(),
        updatedAt: serverTimestamp(),
      };

      if (selectedPlayer) {
        await updateDoc(doc(db, 'players', selectedPlayer.id), payload);
        setPlayers((prev) =>
          prev.map((p) => (p.id === selectedPlayer.id ? { ...p, ...payload } : p))
        );
        showToast('success', 'تم تحديث بيانات اللاعب بنجاح');
      } else {
        const docRef = await addDoc(collection(db, 'players'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        const newPlayer: Player = {
          id: docRef.id,
          ...payload,
        };
        setPlayers((prev) => [newPlayer, ...prev]);
        showToast('success', 'تم إضافة اللاعب بنجاح');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving player:', error);
      showToast('error', error?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (player: Player) => {
    setSelectedPlayer(player);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPlayer) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'players', selectedPlayer.id));
      setPlayers((prev) => prev.filter((p) => p.id !== selectedPlayer.id));
      setIsDeleteOpen(false);
      setSelectedPlayer(null);
      showToast('success', 'تم حذف اللاعب بنجاح');
    } catch (error: any) {
      console.error('Error deleting player:', error);
      showToast('error', error?.message || 'حدث خطأ أثناء حذف اللاعب');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                اللاعبون
              </h1>
              <p className="text-sm text-slate-500 mt-1">إدارة لاعبي الأكاديمية</p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              إضافة لاعب
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">الإجمالي</p>
                <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>
          {POSITIONS.map((pos) => (
            <div key={pos.value} className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${pos.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{pos.short}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {stats.byPosition[pos.value]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم، رقم الهاتف، أو الملاحظات..."
                
