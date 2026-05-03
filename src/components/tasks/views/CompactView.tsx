import type { Task } from "@/data/tasks";
import { StatusPill } from "@/components/tasks/StatusPill";
import { priorityConfig } from "@/lib/task-config";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";

export function CompactView({ tasks, onOpen }: { tasks: Task[]; onOpen: (t: Task) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <div>משימה</div>
        <div>עדיפות</div>
        <div>תת</div>
        <div>תאריך</div>
        <div>סטטוס</div>
      </div>
      {tasks.map((t) => {
        const pri = priorityConfig[t.priority];
        const done = t.subtasks.filter((x) => x.status === "done").length;
        const total = t.subtasks.length;
        return (
          <button
            key={t.id}
            onClick={() => onOpen(t)}
            className="grid w-full grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 text-right last:border-0 hover:bg-muted/40"
          >
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-2">
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
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pri.color }} />
              {pri.label}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {total ? `${done}/${total}` : "—"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {t.due}
            </span>
            <StatusPill status={t.status} size="xs" />
          </button>
        );
      })}
    </div>
  );
}
