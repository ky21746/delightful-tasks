import type { Task } from "@/data/tasks";
import { StatusPill } from "@/components/tasks/StatusPill";
import { priorityConfig } from "@/lib/task-config";
import { Calendar } from "lucide-react";

export function TimelineView({ tasks, onOpen }: { tasks: Task[]; onOpen: (t: Task) => void }) {
  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!groups.has(t.due)) groups.set(t.due, []);
    groups.get(t.due)!.push(t);
  }

  return (
    <div className="relative">
      <div className="absolute right-[7px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-6">
        {[...groups.entries()].map(([date, list]) => (
          <div key={date} className="relative pr-8">
            <span className="absolute right-0 top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary" />
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{date}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {list.length}
              </span>
            </div>
            <div className="space-y-2">
              {list.map((t) => {
                const pri = priorityConfig[t.priority];
                return (
                  <button
                    key={t.id}
                    onClick={() => onOpen(t)}
                    className="hover-lift soft-shadow flex w-full items-center justify-between gap-3 rounded-xl border bg-card p-3 text-right"
                  >
                    <div className="min-w-0 flex-1">
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
                      <div className="truncate text-sm font-medium">{t.title}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pri.color }} />
                        {pri.label}
                      </span>
                      <StatusPill status={t.status} size="xs" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
