/**
 * TaskPageUI — Isolated frontend-only rebuild of Syncore TaskListView + TaskSlideOver.
 *
 * - React + TypeScript + Tailwind CSS
 * - Hebrew RTL
 * - Mock data only, in-memory mutations
 * - No fetch / axios / next-intl / Next.js APIs
 * - Native HTML5 drag-and-drop (no @dnd-kit dependency)
 *
 * Drop this file into a route or page and render <TaskPageUI />.
 * It does NOT touch the existing production app.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Flag,
  GripVertical,
  ListTodo,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Unlock,
  User,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "in-progress" | "review" | "blocked" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  assignedTo?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}

interface TaskNote {
  id: string;
  taskId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  authorName: string;
}

interface Member {
  userId: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hebrew strings (replaces next-intl)
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  pageTitle: "משימות",
  pageSubtitle: "ניהול וצפייה בכל המשימות שלך",
  searchPlaceholder: "חפש משימה או אדם…",
  myTasksOnly: "שלי בלבד",
  newTask: "משימה חדשה",
  noTasks: "אין משימות להצגה",
  noProject: "ללא פרויקט",

  tabAll: "הכל",
  tabTodo: "לביצוע",
  tabInProgress: "בתהליך",
  tabCompleted: "הושלמו",

  kpiTotal: "סה״כ",
  kpiTodo: "לביצוע",
  kpiInProgress: "בתהליך",
  kpiCompleted: "הושלמו",
  kpiOverdue: "באיחור",
  kpiDueThisWeek: "השבוע",

  sortDefault: "מיון מותאם",
  sortDueDate: "לפי תאריך יעד",
  sortPriority: "לפי עדיפות",
  sortUpdated: "עודכן לאחרונה",

  priorityAll: "כל העדיפויות",
  priorityLow: "נמוכה",
  priorityMedium: "רגילה",
  priorityHigh: "גבוהה",
  priorityUrgent: "דחוף",

  statusTodo: "לביצוע",
  statusInProgress: "בתהליך",
  statusReview: "בבדיקה",
  statusBlocked: "חסום",
  statusDone: "הושלם",

  fieldStatus: "סטטוס",
  fieldPriority: "עדיפות",
  fieldAssignee: "שייך לאדם",
  fieldDueDate: "תאריך יעד",
  fieldDescription: "תיאור",
  unassigned: "ללא שיוך",

  subtasks: "תת-משימות",
  addSubtask: "הוסף תת-משימה",
  subtaskPlaceholder: "כותרת תת-משימה…",

  notes: "הערות",
  addNote: "הוסף הערה",
  notePlaceholder: "כתוב הערה…",
  noteSave: "שמור",
  notePrivate: "פרטית",
  notePublic: "ציבורית",

  deleteTask: "מחק משימה",
  confirmDelete: "מחק",
  cancel: "ביטול",
  descriptionPlaceholder: "הוסף תיאור למשימה…",
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  { userId: "u1", label: "דנה כהן" },
  { userId: "u2", label: "יואב לוי" },
  { userId: "u3", label: "מיכל אברהם" },
  { userId: "u4", label: "אורי שמש" },
];

const CURRENT_USER_ID = "u1";

const today = new Date();
const day = (offset: number) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset).toISOString();

const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "עיצוב מסך התחברות חדש",
    description: "לעדכן את הלוגו, להוסיף אופציה של Google ולהתאים ל-RTL.",
    status: "in-progress",
    priority: "high",
    projectId: "p1",
    projectName: "Syncore Web",
    assignedTo: "u1",
    assigneeName: "דנה כהן",
    dueDate: day(2),
    createdAt: day(-10),
    updatedAt: day(-1),
    order: 0,
  },
  {
    id: "t2",
    title: "כתיבת מדיניות פרטיות",
    status: "todo",
    priority: "medium",
    projectId: "p1",
    projectName: "Syncore Web",
    assignedTo: "u2",
    assigneeName: "יואב לוי",
    dueDate: day(5),
    createdAt: day(-7),
    updatedAt: day(-3),
    order: 1,
  },
  {
    id: "t3",
    title: "אינטגרציה עם מערכת התשלומים",
    description: "Stripe + Webhook לעדכון סטטוס מנוי",
    status: "blocked",
    priority: "urgent",
    projectId: "p1",
    projectName: "Syncore Web",
    assignedTo: "u3",
    assigneeName: "מיכל אברהם",
    dueDate: day(-1),
    createdAt: day(-14),
    updatedAt: day(-2),
    order: 2,
  },
  {
    id: "t4",
    title: "בדיקות QA לגרסת מובייל",
    status: "review",
    priority: "high",
    projectId: "p2",
    projectName: "Syncore Mobile",
    assignedTo: "u4",
    assigneeName: "אורי שמש",
    dueDate: day(3),
    createdAt: day(-6),
    updatedAt: day(0),
    order: 0,
  },
  {
    id: "t5",
    title: "תיעוד API למפתחים",
    status: "done",
    priority: "low",
    projectId: "p2",
    projectName: "Syncore Mobile",
    assignedTo: "u1",
    assigneeName: "דנה כהן",
    dueDate: day(-3),
    createdAt: day(-20),
    updatedAt: day(-4),
    order: 1,
  },
  {
    id: "t6",
    title: "הקמת סביבת staging",
    status: "todo",
    priority: "medium",
    projectId: "p3",
    projectName: "DevOps",
    assignedTo: "u2",
    assigneeName: "יואב לוי",
    dueDate: day(7),
    createdAt: day(-2),
    updatedAt: day(-2),
    order: 0,
  },
  // Subtasks
  {
    id: "t1-s1",
    title: "עיצוב כפתור Google",
    status: "done",
    priority: "medium",
    projectId: "p1",
    projectName: "Syncore Web",
    assignedTo: "u1",
    assigneeName: "דנה כהן",
    parentId: "t1",
    createdAt: day(-5),
    updatedAt: day(-2),
    order: 0,
  },
  {
    id: "t1-s2",
    title: "התאמת שדות לעברית RTL",
    status: "in-progress",
    priority: "high",
    projectId: "p1",
    projectName: "Syncore Web",
    assignedTo: "u1",
    assigneeName: "דנה כהן",
    parentId: "t1",
    createdAt: day(-4),
    updatedAt: day(-1),
    order: 1,
  },
];

const MOCK_NOTES: TaskNote[] = [
  {
    id: "n1",
    taskId: "t1",
    content: "שלחתי את ה-mockups לדנה לאישור.",
    isPrivate: false,
    createdAt: day(-1),
    authorName: "דנה כהן",
  },
  {
    id: "n2",
    taskId: "t3",
    content: "ממתינים לאישור משפטי לפני המשך.",
    isPrivate: true,
    createdAt: day(-2),
    authorName: "מיכל אברהם",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<TaskStatus, { dot: string; label: string; ring: string }> = {
  todo: { dot: "bg-slate-400", label: T.statusTodo, ring: "ring-slate-300/50" },
  "in-progress": { dot: "bg-sky-500", label: T.statusInProgress, ring: "ring-sky-400/40" },
  review: { dot: "bg-amber-500", label: T.statusReview, ring: "ring-amber-400/40" },
  blocked: { dot: "bg-red-500", label: T.statusBlocked, ring: "ring-red-400/40" },
  done: { dot: "bg-emerald-500", label: T.statusDone, ring: "ring-emerald-400/40" },
};

const PRIORITY_STYLES: Record<
  TaskPriority,
  { label: string; classes: string }
> = {
  urgent: { label: T.priorityUrgent, classes: "bg-red-500/15 text-red-600 dark:text-red-400" },
  high:   { label: T.priorityHigh,   classes: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  medium: { label: T.priorityMedium, classes: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  low:    { label: T.priorityLow,    classes: "bg-slate-400/10 text-slate-500 dark:text-slate-400" },
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function avatarColor(name: string): string {
  const palette = [
    "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B",
    "#10B981", "#06B6D4", "#3B82F6", "#EF4444",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function AssigneeAvatar({ name, size = 24 }: { name?: string | null; size?: number }) {
  if (!name) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        style={{ width: size, height: size }}
      >
        <User size={size * 0.5} />
      </span>
    );
  }
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: size * 0.38,
      }}
      title={name}
    >
      {initials}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({
  value,
  label,
  accent,
  icon,
}: {
  value: number;
  label: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={`absolute inset-y-0 right-0 w-1 ${accent}`} />
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {label}
          </div>
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl text-white ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Row (with native HTML5 drag-and-drop)
// ─────────────────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  subCount: number;
  doneSubCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onSelect: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, targetId: string) => void;
  isBeingDragged: boolean;
}

function TaskRow({
  task,
  subCount,
  doneSubCount,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  isBeingDragged,
}: TaskRowProps) {
  const isDone = task.status === "done";
  const now = Date.now();
  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate).getTime() < now;
  const subProgress = subCount > 0 ? Math.round((doneSubCount / subCount) * 100) : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
      className={`group relative border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40 ${
        isBeingDragged ? "opacity-40" : ""
      }`}
    >
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={onSelect}
      >
        {/* Drag handle */}
        <span
          className="hidden shrink-0 cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600 sm:inline-flex"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </span>

        {/* Expand toggle for subtasks */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className={`hidden h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-700/60 dark:hover:text-slate-200 ${
            subCount > 0 ? "sm:flex" : "sm:invisible"
          }`}
          aria-label="הרחב תת-משימות"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} className="rtl:rotate-180" />}
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => { e.stopPropagation(); onToggleStatus(); }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 shrink-0 cursor-pointer rounded accent-emerald-500"
        />

        {/* Title + status dot */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLES[task.status].dot}`}
            aria-hidden
          />
          <span
            className={`truncate text-sm ${
              isDone
                ? "text-slate-400 line-through dark:text-slate-500"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {task.title}
          </span>
          {subCount > 0 && (
            <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">
              {doneSubCount}/{subCount}
            </span>
          )}
        </div>

        {/* Right cluster — desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          <PriorityBadge priority={task.priority} />
          <span
            className={`inline-flex items-center gap-1 text-xs tabular-nums ${
              isOverdue ? "font-semibold text-red-500" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <CalendarDays size={12} />
            {task.dueDate ? format(new Date(task.dueDate), "d/M") : "—"}
          </span>
          <AssigneeAvatar name={task.assigneeName} />
        </div>

        {/* Right cluster — mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <AssigneeAvatar name={task.assigneeName} size={22} />
        </div>
      </div>

      {/* Subtask progress bar (collapsed) */}
      {subCount > 0 && !isExpanded && subProgress > 0 && (
        <div className="h-0.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${subProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide-Over Panel
// ─────────────────────────────────────────────────────────────────────────────

interface SlideOverProps {
  task: Task | null;
  subtasks: Task[];
  notes: TaskNote[];
  members: Member[];
  onClose: () => void;
  onPatch: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subId: string) => void;
  onAddNote: (content: string, isPrivate: boolean) => void;
}

function SlideOver({
  task,
  subtasks,
  notes,
  members,
  onClose,
  onPatch,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onAddNote,
}: SlideOverProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showSubInput, setShowSubInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notePrivate, setNotePrivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const subInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(80, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    setNewSubtaskTitle("");
    setShowSubInput(false);
    setNewNote("");
    setNotePrivate(false);
    setConfirmDelete(false);
  }, [task?.id]);

  useEffect(() => {
    if (showSubInput) setTimeout(() => subInputRef.current?.focus(), 50);
  }, [showSubInput]);

  useEffect(() => {
    if (descRef.current) autoResize(descRef.current);
  }, [task?.id, autoResize]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!task) return null;

  const completedSubs = subtasks.filter((s) => s.status === "done").length;
  const subProgress = subtasks.length > 0 ? (completedSubs / subtasks.length) * 100 : 0;

  const handleAddSub = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    onAddSubtask(title);
    setNewSubtaskTitle("");
    setShowSubInput(false);
  };

  const handleAddNote = () => {
    const content = newNote.trim();
    if (!content) return;
    onAddNote(content, notePrivate);
    setNewNote("");
    setNotePrivate(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        dir="rtl"
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-e border-slate-200 bg-white shadow-2xl animate-in slide-in-from-left duration-300 dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <p className="mb-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {task.projectName}
            </p>
            <h2 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
              {task.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { onDelete(); onClose(); }}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  {T.confirmDelete}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {T.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                title={T.deleteTask}
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <Field icon={<Flag size={12} />} label={T.fieldStatus}>
              <select
                value={task.status}
                onChange={(e) => onPatch({ status: e.target.value as TaskStatus })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {(Object.keys(STATUS_STYLES) as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                ))}
              </select>
            </Field>
            <Field icon={<Flag size={12} />} label={T.fieldPriority}>
              <select
                value={task.priority}
                onChange={(e) => onPatch({ priority: e.target.value as TaskPriority })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_STYLES[p].label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Assignee */}
          <Field icon={<User size={12} />} label={T.fieldAssignee}>
            <select
              value={task.assignedTo ?? "unassigned"}
              onChange={(e) => {
                const v = e.target.value;
                const member = members.find((m) => m.userId === v);
                onPatch({
                  assignedTo: v === "unassigned" ? null : v,
                  assigneeName: v === "unassigned" ? null : member?.label ?? null,
                });
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="unassigned">{T.unassigned}</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.label}</option>
              ))}
            </select>
          </Field>

          {/* Due date */}
          <Field icon={<CalendarDays size={12} />} label={T.fieldDueDate}>
            <input
              type="date"
              defaultValue={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
              onChange={(e) => onPatch({ dueDate: e.target.value || null })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </Field>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {T.fieldDescription}
            </label>
            <textarea
              ref={descRef}
              key={task.id}
              defaultValue={task.description ?? ""}
              onInput={(e) => autoResize(e.currentTarget)}
              onBlur={(e) => {
                if (e.target.value !== (task.description ?? "")) {
                  onPatch({ description: e.target.value });
                }
              }}
              placeholder={T.descriptionPlaceholder}
              className="w-full resize-none overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              style={{ minHeight: 80 }}
            />
          </div>

          {/* Subtasks */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {T.subtasks}
                </span>
                {subtasks.length > 0 && (
                  <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                    {completedSubs}/{subtasks.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowSubInput(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/20"
              >
                <Plus size={12} /> {T.addSubtask}
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${subProgress}%` }}
                />
              </div>
            )}

            {showSubInput && (
              <div className="mb-2 flex items-center gap-2">
                <input
                  ref={subInputRef}
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSub();
                    if (e.key === "Escape") { setShowSubInput(false); setNewSubtaskTitle(""); }
                  }}
                  placeholder={T.subtaskPlaceholder}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={handleAddSub}
                  disabled={!newSubtaskTitle.trim()}
                  className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600 disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
            )}

            <ul className="space-y-1">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="group flex items-center gap-2.5 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <input
                    type="checkbox"
                    checked={sub.status === "done"}
                    onChange={() => onToggleSubtask(sub.id)}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-emerald-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      sub.status === "done"
                        ? "text-slate-400 line-through"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {sub.title}
                  </span>
                  <AssigneeAvatar name={sub.assigneeName} size={20} />
                </li>
              ))}
              {subtasks.length === 0 && !showSubInput && (
                <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-700">
                  אין תת-משימות עדיין
                </li>
              )}
            </ul>
          </section>

          {/* Notes */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare size={12} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {T.notes}
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {notes.length}
              </span>
            </div>

            <ul className="mb-3 space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AssigneeAvatar name={note.authorName} size={20} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {note.authorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      {note.isPrivate && <Lock size={10} />}
                      {format(new Date(note.createdAt), "d/M HH:mm")}
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-slate-700 dark:text-slate-200">
                    {note.content}
                  </p>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={T.notePlaceholder}
                rows={2}
                className="w-full resize-none rounded-lg bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setNotePrivate((p) => !p)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                    notePrivate
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {notePrivate ? <Lock size={11} /> : <Unlock size={11} />}
                  {notePrivate ? T.notePrivate : T.notePublic}
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-40"
                >
                  {T.noteSave}
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: TaskPageUI
// ─────────────────────────────────────────────────────────────────────────────

export default function TaskPageUI() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [notes, setNotes] = useState<TaskNote[]>(MOCK_NOTES);
  const [members] = useState<Member[]>(MOCK_MEMBERS);
  const [activeTab, setActiveTab] = useState<"all" | TaskStatus>("all");
  const [search, setSearch] = useState("");
  const [myOnly, setMyOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sortBy, setSortBy] = useState<"default" | "dueDate" | "priority" | "updatedAt">("default");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Derived
  const parentTasks = useMemo(() => tasks.filter((t) => !t.parentId), [tasks]);

  const kpi = useMemo(() => {
    const now = Date.now();
    const weekFromNow = now + 7 * 86400_000;
    return {
      total: parentTasks.length,
      todo: parentTasks.filter((t) => t.status === "todo").length,
      inProgress: parentTasks.filter((t) => t.status === "in-progress").length,
      done: parentTasks.filter((t) => t.status === "done").length,
      overdue: parentTasks.filter(
        (t) => t.dueDate && t