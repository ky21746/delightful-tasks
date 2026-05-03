import { MessageSquare, Paperclip, Plus } from "lucide-react";
import type { Task, Status } from "@/data/tasks";
import { statusConfig, priorityConfig } from "@/lib/task-config";

const ORDER: Status[] = ["todo", "progress", "review", "done", "blocked"];

export function KanbanView({ tasks, onOpen }: { tasks: Task[]; onOpen: (t: Task) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {ORDER.map((s) => {
        const cfg = statusConfig[s];
        const list = tasks.filter((t) => t.status === s);
        return (
          <div key={s} className="flex min-h-[200px] flex-col rounded-2xl border bg-muted/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <h3 className="text-sm font-semibold">{cfg.label}</h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                  {list.length}
                </span>
              </div>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              {list.map((t) => {
                const pri = priorityConfig[t.priority];
                const done = t.subtasks.filter((x) => x.status === "done").length;
                const total = t.subtasks.length;
                return (
                  <button
                    key={t.id}
                    onClick={() => onOpen(t)}
                    className="hover-lift soft-shadow group block w-full rounded-xl border bg-card p-3 text-right"
                  >
                    <div className="absolute" />
                    <div
                      className="mb-2 h-1 w-10 rounded-full"
                      style={{ backgroundColor: t.projectColor }}
                    />
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${t.projectColor} 15%, transparent)`,
                          color: t.projectColor,
                        }}
                      >
                        {t.code}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{t.project}</span>
                    </div>
                    <div className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                      {t.title}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pri.color }} />
                        {t.due}
                      </span>
                      <div className="flex items-center gap-2">
                        {total > 0 && (
                          <span className="tabular-nums">
                            {done}/{total}
                          </span>
                        )}
                        {t.comments > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {t.comments}
                          </span>
                        )}
                        {t.attachments > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Paperclip className="h-3 w-3" />
                            {t.attachments}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex -space-x-2 space-x-reverse">
                      {t.assignees.map((a, i) => (
                        <span
                          key={i}
                          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-[9px] font-semibold text-white"
                          style={{ backgroundColor: a.color }}
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
              {list.length === 0 && (
                <div className="rounded-xl border border-dashed py-6 text-center text-[11px] text-muted-foreground">
                  אין משימות
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
