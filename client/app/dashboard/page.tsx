'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, LogOut, CheckCircle2, Circle,
  Pencil, Trash2, X, ChevronLeft, ChevronRight,
  CheckSquare, AlertCircle, Loader2, ChevronDown,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../Hooks/useAuth';
import authApi from '../../lib/app';
import { API_ENDPOINTS } from '../../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'PENDING' | 'COMPLETED';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// GET /tasks returns: { page, limit, total, data: Task[] }
interface GetTasksResponse {
  page:  number;
  limit: number;
  total: number;
  data:  Task[];
}

interface Pagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

interface TaskFormData {
  title:       string;
  description: string;
  status:      TaskStatus;
}

const EMPTY_FORM: TaskFormData = {
  title:       '',
  description: '',
  status:      'PENDING',
};

const LIMIT = 2;

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  color: string;
  bg:    string;
  icon:  React.ReactNode;
}> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-600',
    bg:    'bg-amber-50 border-amber-200',
    icon:  <Circle className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-emerald-600',
    bg:    'bg-emerald-50 border-emerald-200',
    icon:  <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({
  task,
  onClose,
  onSaved,
}: {
  task:    Task | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!task;
  const [form, setForm] = useState<TaskFormData>(
    task
      ? { title: task.title, description: task.description ?? '', status: task.status }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        status:      form.status,
      };
      if (isEdit) {
        await authApi.patch(`${API_ENDPOINTS.TASKS}/${task!.id}`, payload);
        toast.success('Task updated');
      } else {
        // POST /tasks — backend returns { message, task }
        await authApi.post(API_ENDPOINTS.TASKS, payload);
        toast.success('Task created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,26,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add more details…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
              disabled={saving}
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                className="w-full appearance-none px-3.5 pr-9 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition bg-white"
                disabled={saving}
              >
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div> */}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 cursor-pointer py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 cursor-pointer py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  task,
  onClose,
  onDeleted,
}: {
  task:      Task;
  onClose:   () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authApi.delete(`${API_ENDPOINTS.TASKS}/${task.id}`);
      toast.success('Task deleted');
      onDeleted();
      onClose();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,26,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center ">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Delete task?</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5 ">
          "<span className="font-medium text-gray-700">{task.title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 cursor-pointer rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 cursor-pointer rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task:     Task;
  onEdit:   (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggle: (t: Task) => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);

  // Safe lookup — normalize status to uppercase in case backend sends lowercase
  const statusKey = task.status?.toUpperCase() as TaskStatus;
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['PENDING'];

  const handleToggle = async () => {
    setToggling(true);
    try { await onToggle(task); }
    finally { setToggling(false); }
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        statusKey === 'COMPLETED' ? 'border-gray-100 opacity-80' : 'border-gray-200'
      }`}
    >
      {/* Left accent */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${
          statusKey === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />

      <div className="px-5 py-4 pl-6">
        <div className="flex items-start justify-between gap-5">
          {/* Toggle */}

  {/*  TOGGLE BUTTON */}
  <button
    onClick={handleToggle}
    disabled={toggling}
    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
    title="Toggle status"
  >
    {toggling ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : statusKey === 'COMPLETED' ? (
      // <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      <ToggleRight size={30} className='text-emerald-500 cursor-pointer'/>
    ) : (
      // <Circle className="w-4 h-4" />
      <ToggleLeft size={30} className='cursor-pointer hover:text-amber-400'/>
    )}
  </button>
  {/* </div> */}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${
              statusKey === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900'
            }`}>
              {task.title}
            </p>
            {task.description && (
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="mt-2">
              <span className={`inline-flex items-center gap-2  px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                {cfg.icon }
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label:   string;
  value:   number;
  color:   string;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 rounded-xl px-4 py-3 text-left transition-all border ${
        active
          ? `${color} shadow-sm`
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs mt-0.5 font-medium ${active ? 'opacity-75' : 'text-gray-500'}`}>
        {label}
      </p>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered, onAdd }: { filtered: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <CheckSquare className="w-8 h-8 text-indigo-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {filtered ? 'No matching tasks' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">
        {filtered ? 'Try adjusting your search or filter.' : 'Create your first task to get started.'}
      </p>
      {!filtered && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add task
        </button>
      )}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout,user } = useAuth();

  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [counts,     setCounts]     = useState({ total: 0, pending: 0, completed: 0 });

  // Filters
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter,    setStatusFilter]    = useState<TaskStatus | ''>('');
  const [page,            setPage]            = useState(1);

  // Modals
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTask,    setEditTask]    = useState<Task | null>(null);
  const [deleteTask,  setDeleteTask]  = useState<Task | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  // ── Fetch tasks ──────────────────────────────────────────────────────────────
  // GET /tasks → { page, limit, total, data: Task[] }
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(LIMIT),
        ...(statusFilter    && { status: statusFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });


      const res  = await authApi.get<GetTasksResponse>(`${API_ENDPOINTS.TASKS}?${params}`,{
        headers: { 'Cache-Control': 'no-cache' }
       } 
      );
      const raw  = res.data;
      console.log('Fetched tasks:', raw);

      // raw.data is the Task[]
      setTasks(Array.isArray(raw.data) ? raw.data : []);

      // Build pagination from flat fields
      const totalPages = Math.ceil((raw.total ?? 0) / (raw.limit ?? LIMIT));
      setPagination({
        total:      raw.total ?? 0,
        page:       raw.page  ?? 1,
        limit:      raw.limit ?? LIMIT,
        totalPages,
        hasNext: (raw.page ?? 1) < totalPages,
        hasPrev: (raw.page ?? 1) > 1,
      });
    } catch {
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  // ── Fetch counts ─────────────────────────────────────────────────────────────
  // Each call returns { total, data: [] } — we only need total
  const fetchCounts = useCallback(async () => {
    try {
      const [all, pending, completed] = await Promise.all([
        authApi.get<GetTasksResponse>(`${API_ENDPOINTS.TASKS}?limit=1`),
        authApi.get<GetTasksResponse>(`${API_ENDPOINTS.TASKS}?limit=1&status=PENDING`),
        authApi.get<GetTasksResponse>(`${API_ENDPOINTS.TASKS}?limit=1&status=COMPLETED`),
      ]);
      setCounts({
        total:     all.data.total       ?? 0,
        pending:   pending.data.total   ?? 0,
        completed: completed.data.total ?? 0,
      });
    } catch { /* silent — counts are non-critical */ }
  }, []);

  // Trigger on auth ready
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchCounts();
    }
  }, [isAuthenticated, fetchTasks, fetchCounts]);

  // ── Toggle ───────────────────────────────────────────────────────────────────
 
  const handleToggle = async (task: Task) => {
  // Optimistic update first
  const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

  setTasks(prev =>
    prev.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    )
  );

  try {
    const res = await authApi.patch(`${API_ENDPOINTS.TASKS}/${task.id}/toggle`);

    const updated: Task =
      res.data?.task ?? res.data?.data ?? res.data;

    // Sync with backend (IMPORTANT)
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, ...updated } : t
      )
    );

    fetchCounts();

  } catch (err) {
    // Rollback if failed
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, status: task.status } : t
      )
    );

    toast.error('Failed to update task');
  }
};

  const handleSaved = () => { fetchTasks(); fetchCounts(); };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out Successfully');
    router.replace('/login');
  };

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isFiltered = !!debouncedSearch || !!statusFilter;

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);   }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900 hidden sm:block">TaskMate</span>
            </div>

         <div className="flex items-center gap-4">
         <p className='text-xs text-slate-400 bg-slate-50 p-3 rounded'>{user?.email}</p>
        
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
           </div>
        </header>

        {/* ── Main ── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Title + Add */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My tasks</h1>
              <p className="text-sm text-gray-400 mt-0.5">{counts.total} total tasks</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="flex gap-3 overflow-x-auto pb-1 ">
            <StatCard
              label="All tasks"
              value={counts.total}
              color="bg-indigo-50 text-indigo-700 border-indigo-200"
              active={statusFilter === ''}
              onClick={() => setStatusFilter('')}
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              
              color="bg-amber-50 text-amber-700 border-amber-200"
              active={statusFilter === 'PENDING'}
              onClick={() => setStatusFilter('PENDING')}
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              color="bg-emerald-50 text-emerald-700 border-emerald-200"
              active={statusFilter === 'COMPLETED'}
              onClick={() => setStatusFilter('COMPLETED')}
            />
          </div>

          {/* Search + Status filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as TaskStatus | '')}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white text-gray-600 cursor-pointer"
              >
                <option value="">All statuses</option>
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Task list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState filtered={isFiltered} onAdd={() => setShowCreate(true)} />
          ) : (
            <div className="space-y-2.5">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditTask}
                  onDelete={setDeleteTask}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.hasPrev}
                  className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 cursor-pointer" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(n => Math.abs(n - pagination.page) <= 2)
                  .map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 cursor-pointer rounded-lg text-xs font-medium transition-colors ${
                        n === pagination.page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNext}
                  className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreate && (
        <TaskModal task={null} onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {editTask && (
        <TaskModal task={editTask} onClose={() => setEditTask(null)} onSaved={handleSaved} />
      )}
      {deleteTask && (
        <DeleteModal task={deleteTask} onClose={() => setDeleteTask(null)} onDeleted={handleSaved} />
      )}
    </>
  );
}