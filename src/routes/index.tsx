import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Plus, ChevronDown, ChevronsDownUp, ChevronsUpDown, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { tasks as ALL_TASKS, stats, projects, type Task, type Status } from "@/data/tasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskPanel } from "@/components/tasks/TaskPanel";
import { statusConfig } from "@/lib/task-config";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [expandSignal, setExpandSignal] = useState<{ value: boolean; nonce: number }>({ value: false, nonce: 0 });

  const toggleAll = () => {
    const next = !allOpen;
    setAllOpen(next);
    setExpandSignal({ value: next, nonce: Date.now() });
  };

  const filtered = useMemo(() => {
    return ALL_TASKS.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (query && !`${t.title} ${t.code}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      if (!map.has(t.project)) map.set(t.project, []);
      map.get(t.project)!.push(t);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">משימות</h1>
            <p className="text-sm text-muted-foreground">העסק שלך, עובד חכם יותר ✨</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש פרויקטים, משימות, לידים…"
                className="w-72 rounded-xl border bg-card py-2 pr-9 pl-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90">
              <Plus className="h-4 w-4" /> משימה חדשה
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
        <div className="glass-card soft-shadow mb-6 flex flex-wrap items-center gap-2 rounded-2xl border p-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>הכל · 80</FilterChip>
          <FilterChip active={filter === "todo"} onClick={() => setFilter("todo")} dot="var(--status-todo)">לביצוע · 52</FilterChip>
          <FilterChip active={filter === "progress"} onClick={() => setFilter("progress")} dot="var(--status-progress)">בתהליך · 6</FilterChip>
          <FilterChip active={filter === "review"} onClick={() => setFilter("review")} dot="var(--status-review)">בבדיקה · 2</FilterChip>
          <FilterChip active={filter === "done"} onClick={() => setFilter("done")} dot="var(--status-done)">הושלם · 21</FilterChip>
          <FilterChip active={filter === "blocked"} onClick={() => setFilter("blocked")} dot="var(--status-blocked)">חסום · 16</FilterChip>

          <div className="mr-auto flex items-center gap-1">
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted"
              title={allOpen ? "כווץ את כל תת-המשימות" : "פתח את כל תת-המשימות"}
            >
              {allOpen ? <ChevronsDownUp className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
              {allOpen ? "כווץ הכל" : "פתח הכל"}
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted">
              <ArrowUpDown className="h-3.5 w-3.5" /> מיון
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted">
              <SlidersHorizontal className="h-3.5 w-3.5" /> סינון
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
            <div className="flex rounded-lg bg-muted p-0.5">
              <button className="rounded-md bg-card p-1.5 shadow-sm">
                <List className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Groups */}
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
                    <TaskCard key={t.id} task={t} onOpen={setOpenTask} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <TaskPanel task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  dot,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      {children}
    </button>
  );
}
