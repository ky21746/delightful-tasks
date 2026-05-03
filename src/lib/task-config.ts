import type { Status, Priority } from "@/data/tasks";

export const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  todo: { label: "לביצוע", color: "var(--status-todo)", bg: "color-mix(in oklab, var(--status-todo) 15%, transparent)" },
  progress: { label: "בתהליך", color: "var(--status-progress)", bg: "color-mix(in oklab, var(--status-progress) 15%, transparent)" },
  review: { label: "בבדיקה", color: "var(--status-review)", bg: "color-mix(in oklab, var(--status-review) 18%, transparent)" },
  done: { label: "הושלם", color: "var(--status-done)", bg: "color-mix(in oklab, var(--status-done) 16%, transparent)" },
  blocked: { label: "חסום", color: "var(--status-blocked)", bg: "color-mix(in oklab, var(--status-blocked) 14%, transparent)" },
};

export const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: "גבוהה", color: "var(--priority-high)" },
  med: { label: "בינונית", color: "var(--priority-med)" },
  low: { label: "נמוכה", color: "var(--priority-low)" },
};
