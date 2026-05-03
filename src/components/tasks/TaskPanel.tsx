import { useEffect } from "react";
import { X, Calendar, User, Flag, Plus, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import type { Task } from "@/data/tasks";
import { StatusPill } from "./StatusPill";
import { priorityConfig, statusConfig } from "@/lib/task-config";

export function TaskPanel({ task, onClose }: { task: Task | null; onClose: () => void }) {
  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  if (!task) return null;
  const done = task.subtasks.filter((s) => s.status === "done").length;
  const total = task.subtasks.length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <>
      <div
        data-testid="task-panel-overlay"
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <aside
        data-testid="task-panel"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-e bg-card shadow-2xl animate-in slide-in-from-right duration-300 ease-out"
      >
        <header className="flex items-start justify-between gap-3 border-b p-5">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
                style={{ backgroundColor: `color-mix(in oklab, ${task.projectColor} 14%, transparent)`, color: task.projectColor }}
              >
                {task.code}
              </span>
              <span className="text-xs text-muted-foreground">{task.project}</span>
            </div>
            <h2 className="text-lg font-bold leading-snug text-foreground">{task.title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <section className="grid grid-cols-2 gap-x-4 gap-y-3 border-b p-5 text-sm">
            <Field icon={<Flag className="h-3.5 w-3.5" />} label="סטטוס">
              <StatusPill status={task.status} />
            </Field>
            <Field icon={<Flag className="h-3.5 w-3.5" />} label="עדיפות">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priorityConfig[task.priority].color }} />
                {priorityConfig[task.priority].label}
              </span>
            </Field>
            <Field icon={<User className="h-3.5 w-3.5" />} label="שייך לאדם">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: task.assignees[0]?.color }}
                >
                  {task.assignees[0]?.name}
                </span>
                <span className="text-foreground">{task.assignees[0]?.name}</span>
              </div>
            </Field>
            <Field icon={<Calendar className="h-3.5 w-3.5" />} label="תאריך יעד">
              <span className="text-foreground">{task.due}</span>
            </Field>
          </section>

          {task.description && (
            <section className="border-b p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">תיאור</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{task.description}</p>
            </section>
          )}

          <section className="border-b p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                תת-משימות
              </h3>
              <span className="text-xs tabular-nums text-muted-foreground">{done}/{total}</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--status-progress), var(--status-done))" }}
              />
            </div>
            <ul className="space-y-1">
              {task.subtasks.map((s) => (
                <li key={s.id} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60">
                  <button
                    className="h-4 w-4 shrink-0 rounded border-2 border-border hover:border-primary"
                    style={s.status === "done" ? { backgroundColor: "var(--status-done)", borderColor: "var(--status-done)" } : {}}
                  />
                  <span className={`flex-1 text-sm ${s.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {s.title}
                  </span>
                  <StatusPill status={s.status} size="xs" />
                </li>
              ))}
            </ul>
            <button className="mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-primary">
              <Plus className="h-4 w-4" />
              הוסף תת-משימה
            </button>
          </section>

          <section className="p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              הערות ({task.comments})
            </h3>
            <textarea
              placeholder="הוסף הערה…"
              className="min-h-24 w-full resize-none rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded p-1.5 hover:bg-muted"><Paperclip className="h-4 w-4" /></button>
                <button className="rounded p-1.5 hover:bg-muted"><MessageSquare className="h-4 w-4" /></button>
              </div>
              <button className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                שמור הערה
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
