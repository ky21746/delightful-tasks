import { useEffect, useState } from "react";
import { ChevronDown, MessageSquare, Paperclip, Plus, MoreHorizontal, Calendar } from "lucide-react";
import type { Task } from "@/data/tasks";
import { StatusPill } from "./StatusPill";
import { priorityConfig, statusConfig } from "@/lib/task-config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TaskCard({
  task,
  onOpen,
  expandSignal,
}: {
  task: Task;
  onOpen: (t: Task) => void;
  expandSignal?: { value: boolean; nonce: number };
}) {
  const [open, setOpen] = useState(task.subtasks.length > 0 && task.status === "progress");

  useEffect(() => {
    if (expandSignal) setOpen(expandSignal.value);
  }, [expandSignal?.nonce]);
  const done = task.subtasks.filter((s) => s.status === "done").length;
  const total = task.subtasks.length;
  const pct = total ? (done / total) * 100 : 0;
  const pri = priorityConfig[task.priority];

  return (
    <div className="group glass-card soft-shadow hover-lift overflow-hidden rounded-2xl border">
      <div
        className="absolute right-0 top-0 h-full w-1"
        style={{ backgroundColor: task.projectColor }}
      />
      <div className="relative flex items-start gap-3 p-4 pr-5">
        <button
          onClick={() => onOpen(task)}
          className="mt-1 h-5 w-5 shrink-0 rounded-md border-2 border-border transition-colors hover:border-primary"
          aria-label="סמן כהושלם"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button onClick={() => onOpen(task)} className="text-right">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                  style={{ backgroundColor: `${task.projectColor.replace(")", " / 0.12)").replace("oklch(", "oklch(")}`, color: task.projectColor }}
                >
                  {task.code}
                </span>
                <span className="text-xs text-muted-foreground">{task.project}</span>
              </div>
              <h3 className="text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
                {task.title}
              </h3>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <StatusPill status={task.status} />
              {total > 0 && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-lg border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
                        aria-label={open ? "כווץ תת-משימות" : "פתח תת-משימות"}
                        aria-expanded={open}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
                        {open ? "כווץ" : "פתח"}
                        <span className="tabular-nums">({done}/{total})</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px] bg-popover p-3 text-popover-foreground shadow-lg">
                      <div className="space-y-2 text-right">
                        <div className="text-[12px] font-semibold">
                          {done} מתוך {total} תת-משימות הושלמו ({Math.round(pct)}%)
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          לחץ כדי {open ? "לכווץ" : "לפתוח"} את רשימת תת-המשימות
                        </div>
                        <div className="space-y-1 border-t pt-2">
                          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((k) => {
                            const count = task.subtasks.filter((s) => s.status === k).length;
                            if (!count) return null;
                            return (
                              <div key={k} className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusConfig[k].color }} />
                                  {statusConfig[k].label}
                                </span>
                                <span className="tabular-nums text-muted-foreground">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <button className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pri.color }} />
              עדיפות {pri.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {task.due}
            </span>
            {task.comments > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {task.comments}
              </span>
            )}
            {task.attachments > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                {task.attachments}
              </span>
            )}
            <div className="flex -space-x-2 space-x-reverse">
              {task.assignees.map((a, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white"
                  style={{ backgroundColor: a.color }}
                  title={a.name}
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>

          {total > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
                  {done}/{total} תת-משימות
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="relative h-2.5 w-32 overflow-hidden rounded-full bg-border/70 ring-1 ring-inset ring-border shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_color-mix(in_oklab,var(--status-done)_60%,transparent)]"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, var(--status-progress), var(--status-done))",
                      }}
                    />
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-foreground">{Math.round(pct)}%</span>
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-out ${open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <ul className="overflow-hidden space-y-1 border-r-2 border-dashed border-border pr-4">
                  {task.subtasks.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                    >
                      <button
                        className="h-4 w-4 shrink-0 rounded border-2 border-border transition-colors hover:border-primary"
                        style={s.status === "done" ? { backgroundColor: "var(--status-done)", borderColor: "var(--status-done)" } : {}}
                      />
                      <span className={`flex-1 text-sm ${s.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {s.title}
                      </span>
                      {s.due && <span className="text-[11px] text-muted-foreground">{s.due}</span>}
                      <StatusPill status={s.status} size="xs" />
                    </li>
                  ))}
                  <li>
                    <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-primary">
                      <Plus className="h-3.5 w-3.5" />
                      הוסף תת-משימה
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
