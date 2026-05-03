import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus, ChevronsDownUp, ChevronsUpDown, List, Columns3, CalendarRange, Flame, Rows3, X } from "lucide-react";
import { tasks as ALL_TASKS, stats, projects, type Task, type Status } from "@/data/tasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskPanel } from "@/components/tasks/TaskPanel";
import { KanbanView } from "@/components/tasks/views/KanbanView";
import { TimelineView } from "@/components/tasks/views/TimelineView";
import { CompactView } from "@/components/tasks/views/CompactView";
import { PriorityView } from "@/components/tasks/views/PriorityView";
import { AdvancedFilter, EMPTY_FILTERS, countActive, type AdvancedFilters } from "@/components/tasks/AdvancedFilter";
import { SortMenu } from "@/components/tasks/SortMenu";
import { sortTasks, type SortField, type SortDir } from "@/lib/task-sort";

type ViewMode = "list" | "kanban" | "timeline" | "compact" | "priority";
const VIEWS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: "list", label: "רשימה", icon: List },
  { id: "kanban", label: "קאנבן", icon: Columns3 },
  { id: "timeline", label: "ציר זמן", icon: CalendarRange },
  { id: "priority", label: "לפי עדיפות", icon: Flame },
  { id: "compact", label: "טבלה", icon: Rows3 },
];

export const Route = createFileRoute("/")({
  component: Index,
});

export function Index() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("due");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [taskList, setTaskList] = useState<Task[]>(ALL_TASKS);
  const [expandSignal, setExpandSignal] = useState<{ value: boolean; nonce: number }>({ value: false, nonce: 0 });

  const searchRef = useRef<HTMLInputElement>(null);
  const statusGroupRef = useRef<HTMLDivElement>(null);
  const viewGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Roving arrow-key navigation inside a group of focusable buttons.
  // In RTL: ArrowRight = previous (visually right is "back"), ArrowLeft = next.
  const handleRovingKeys = (ref: React.RefObject<HTMLDivElement | null>) => (e: React.KeyboardEvent) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    if (items.length === 0) return;
    const current = document.activeElement as HTMLElement | null;
    const idx = items.findIndex((i) => i === current);
    if (idx === -1) return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = (idx + 1) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    items[next].focus();
  };

  const toggleAll = () => {
    const next = !allOpen;
    setAllOpen(next);
    setExpandSignal({ value: next, nonce: Date.now() });
  };

  const handleStatusChange = (id: string, status: Status) => {
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const filtered = useMemo(() => {
    const fromIso = advanced.from?.toISOString().slice(0, 10);
    const toIso = advanced.to?.toISOString().slice(0, 10);
    const list = taskList.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${t.title} ${t.code} ${t.project} ${t.assignees.map((a) => a.name).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (advanced.statuses.length && !advanced.statuses.includes(t.status)) return false;
      if (advanced.priorities.length && !advanced.priorities.includes(t.priority)) return false;
      if (advanced.projects.length && !advanced.projects.includes(t.project)) return false;
      if (fromIso && t.dueDate < fromIso) return false;
      if (toIso && t.dueDate > toIso) return false;
      return true;
    });
    return sortTasks(list, sortField, sortDir);
  }, [query, filter, advanced, taskList, sortField, sortDir]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      if (!map.has(t.project)) map.set(t.project, []);
      map.get(t.project)!.push(t);
    }
    return [...map.entries()];
  }, [filtered]);

  const advancedCount = countActive(advanced);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl" role="banner">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">משימות</h1>
            <p className="text-sm text-muted-foreground">העסק שלך, עובד חכם יותר ✨</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="צור משימה חדשה"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> משימה חדשה
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => {
            const accent = s.tone === "neutral" ? "var(--primary)" : `var(--status-${s.tone})`;
            return (
              <button
                key={s.label}
                className="glass-card hover-lift soft-shadow group relative overflow-hidden rounded-2xl border p-4 text-right"
              >
                <div
                  className="absolute right-0 top-0 h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                />
                <div className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: accent }}>
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </button>
            );
          })}
        </section>

        {/* Toolbar */}
        <div
          className="glass-card soft-shadow mb-6 overflow-hidden rounded-2xl border"
          role="toolbar"
          aria-label="סרגל כלים לסינון, מיון ותצוגה של משימות"
        >
          {/* Row 0 — search */}
          <div className="border-b bg-card/50 px-3 py-2.5">
            <label htmlFor="task-search" className="sr-only">
              חיפוש משימות לפי טקסט, קוד, פרויקט או שם משובץ
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="task-search"
                ref={searchRef}
                type="search"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="חיפוש משימות, פרויקטים או שמות…  (לחץ / לפוקוס)"
                aria-label="חיפוש משימות"
                className="w-full rounded-xl border bg-background py-2 pr-9 pl-20 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="pointer-events-auto inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-foreground hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="נקה חיפוש"
                  >
                    <X className="h-3 w-3" aria-hidden="true" /> נקה
                  </button>
                ) : (
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
                )}
              </span>
            </div>
          </div>

          {/* Row 1 — status filters */}
          <div
            ref={statusGroupRef}
            onKeyDown={handleRovingKeys(statusGroupRef)}
            className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-3 py-2.5"
            role="group"
            aria-label="סינון משימות לפי סטטוס"
          >
            <span className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground" aria-hidden="true">
              סינון לפי סטטוס
            </span>
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={80} ariaLabel="הצג את כל המשימות (80)">הכל</FilterChip>
            <FilterChip active={filter === "todo"} onClick={() => setFilter("todo")} dot="var(--status-todo)" count={52} ariaLabel="סנן משימות בסטטוס לביצוע (52)">לביצוע</FilterChip>
            <FilterChip active={filter === "progress"} onClick={() => setFilter("progress")} dot="var(--status-progress)" count={6} ariaLabel="סנן משימות בתהליך (6)">בתהליך</FilterChip>
            <FilterChip active={filter === "review"} onClick={() => setFilter("review")} dot="var(--status-review)" count={2} ariaLabel="סנן משימות בבדיקה (2)">בבדיקה</FilterChip>
            <FilterChip active={filter === "done"} onClick={() => setFilter("done")} dot="var(--status-done)" count={21} ariaLabel="סנן משימות שהושלמו (21)">הושלם</FilterChip>
            <FilterChip active={filter === "blocked"} onClick={() => setFilter("blocked")} dot="var(--status-blocked)" count={16} ariaLabel="סנן משימות חסומות (16)">חסום</FilterChip>
          </div>

          {/* Row 2 — actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
            <div className="flex items-center gap-1" role="group" aria-label="פעולות מיון וסינון מתקדם">
              <SortMenu field={sortField} dir={sortDir} onChange={(f, d) => { setSortField(f); setSortDir(d); }} />
              <AdvancedFilter value={advanced} onChange={setAdvanced} />
              <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={allOpen ? "כווץ את כל תת-המשימות בכל הכרטיסים" : "פתח את כל תת-המשימות בכל הכרטיסים"}
                aria-pressed={allOpen}
              >
                {allOpen ? <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />}
                {allOpen ? "כווץ הכל" : "פתח הכל"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline" aria-hidden="true">
                תצוגה
              </span>
              <div
                className="flex rounded-xl border bg-muted/60 p-1"
                role="radiogroup"
                aria-label="בחירת מצב תצוגה"
              >
                {VIEWS.map((v) => {
                  const Icon = v.icon;
                  const active = view === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      onClick={() => setView(v.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                      }`}
                      aria-label={`תצוגת ${v.label}`}
                      aria-checked={active}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="hidden md:inline">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Live region — announces filtered count to screen readers */}
        <div
          data-testid="results-live"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          נמצאו {filtered.length} משימות{query ? ` עבור החיפוש "${query}"` : ""}
          {advancedCount > 0 ? ` עם ${advancedCount} סינונים מתקדמים` : ""}
        </div>

        {/* Active filter summary */}
        {(advancedCount > 0 || query) && (
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>הצגה: <span className="font-semibold text-foreground">{filtered.length}</span> משימות</span>
            {advancedCount > 0 && (
              <button
                onClick={() => setAdvanced(EMPTY_FILTERS)}
                className="rounded-md bg-muted px-2 py-1 hover:bg-muted/70"
              >
                נקה {advancedCount} סינונים מתקדמים
              </button>
            )}
          </div>
        )}

        {/* Views */}
        {view === "list" && (
          <div className="space-y-8">
            {grouped.map(([project, list]) => {
              const proj = projects.find((p) => p.name === project);
              return (
                <section key={project}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: proj?.color }} />
                    <h2 className="text-base font-semibold">{project}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{list.length}</span>
                  </div>
                  <div className="space-y-3">
                    {list.map((t) => (
                      <TaskCard key={t.id} task={t} onOpen={setOpenTask} expandSignal={expandSignal} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        {view === "kanban" && <KanbanView tasks={filtered} onOpen={setOpenTask} onStatusChange={handleStatusChange} />}
        {view === "timeline" && <TimelineView tasks={filtered} onOpen={setOpenTask} />}
        {view === "priority" && <PriorityView tasks={filtered} onOpen={setOpenTask} />}
        {view === "compact" && <CompactView tasks={filtered} onOpen={setOpenTask} />}
      </main>

      <TaskPanel task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  dot,
  count,
  ariaLabel,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  dot?: string;
  count?: number;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active
          ? "border-foreground bg-foreground text-background shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground"
      }`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      <span>{children}</span>
      {typeof count === "number" && (
        <span
          className={`tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? "bg-background/20 text-background" : "bg-muted text-foreground/70 group-hover:bg-background/60"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
