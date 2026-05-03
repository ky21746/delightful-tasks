import { MessageSquare, Paperclip, Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import type { Task, Status } from "@/data/tasks";
import { statusConfig, priorityConfig } from "@/lib/task-config";

const ORDER: Status[] = ["todo", "progress", "review", "done", "blocked"];

export function KanbanView({
  tasks,
  onOpen,
  onStatusChange,
}: {
  tasks: Task[];
  onOpen: (t: Task) => void;
  onStatusChange?: (id: string, status: Status) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const target = e.over?.id ? String(e.over.id) : null;
    if (target && ORDER.includes(target as Status)) {
      onStatusChange?.(id, target as Status);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {ORDER.map((s) => (
          <Column key={s} status={s} tasks={tasks.filter((t) => t.status === s)} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskMini task={activeTask} dragging />}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, tasks, onOpen }: { status: Status; tasks: Task[]; onOpen: (t: Task) => void }) {
  const cfg = statusConfig[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-col rounded-2xl border bg-muted/30 p-3 transition-colors ${
        isOver ? "border-primary/60 bg-primary/5" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
          <h3 className="text-sm font-semibold">{cfg.label}</h3>
          <span className="rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 space-y-2">
        {tasks.map((t) => (
          <DraggableCard key={t.id} task={t} onOpen={onOpen} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed py-6 text-center text-[11px] text-muted-foreground">
            גרור משימה לכאן
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Click only triggers if not dragging
        if (!isDragging) onOpen(task);
        e.preventDefault();
      }}
      className={`cursor-grab touch-none active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
    >
      <TaskMini task={task} />
    </div>
  );
}

function TaskMini({ task, dragging }: { task: Task; dragging?: boolean }) {
  const pri = priorityConfig[task.priority];
  const done = task.subtasks.filter((x) => x.status === "done").length;
  const total = task.subtasks.length;
  return (
    <div
      className={`hover-lift soft-shadow block w-full rounded-xl border bg-card p-3 text-right ${
        dragging ? "rotate-2 shadow-2xl ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: task.projectColor }} />
      <div className="mb-1 flex items-center gap-2">
        <span
          className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklab, ${task.projectColor} 15%, transparent)`,
            color: task.projectColor,
          }}
        >
          {task.code}
        </span>
        <span className="text-[11px] text-muted-foreground">{task.project}</span>
      </div>
      <div className="text-sm font-medium leading-snug text-foreground line-clamp-2">{task.title}</div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pri.color }} />
          {task.due}
        </span>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="tabular-nums">
              {done}/{total}
            </span>
          )}
          {task.comments > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {task.attachments}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex -space-x-2 space-x-reverse">
        {task.assignees.map((a, i) => (
          <span
            key={i}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-[9px] font-semibold text-white"
            style={{ backgroundColor: a.color }}
          >
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
