import { statusConfig } from "@/lib/task-config";
import type { Status } from "@/data/tasks";

export function StatusPill({ status, size = "sm" }: { status: Status; size?: "sm" | "xs" }) {
  const cfg = statusConfig[status];
  const padding = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}
