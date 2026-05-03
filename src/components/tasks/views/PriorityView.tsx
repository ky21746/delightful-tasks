import type { Task, Priority } from "@/data/tasks";
import { priorityConfig } from "@/lib/task-config";
import { TaskCard } from "@/components/tasks/TaskCard";

const ORDER: Priority[] = ["high", "med", "low"];

export function PriorityView({ tasks, onOpen }: { tasks: Task[]; onOpen: (t: Task) => void }) {
  return (
    <div className="space-y-8">
      {ORDER.map((p) => {
        const list = tasks.filter((t) => t.priority === p);
        if (!list.length) return null;
        const cfg = priorityConfig[p];
        return (
          <section key={p}>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <h2 className="text-base font-semibold">עדיפות {cfg.label}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {list.length}
              </span>
            </div>
            <div className="space-y-3">
              {list.map((t) => (
                <TaskCard key={t.id} task={t} onOpen={onOpen} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
