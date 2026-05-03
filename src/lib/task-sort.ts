import type { Task, Priority, Status } from "@/data/tasks";

export type SortField = "due" | "priority" | "subtasks" | "title" | "updated";
export type SortDir = "asc" | "desc";

export const SORT_OPTIONS: { id: SortField; label: string }[] = [
  { id: "due", label: "דדליין" },
  { id: "priority", label: "עדיפות" },
  { id: "subtasks", label: "מספר תת-משימות" },
  { id: "title", label: "שם" },
  { id: "updated", label: "עודכן לאחרונה" },
];

const PRIO_RANK: Record<Priority, number> = { high: 0, med: 1, low: 2 };
const STATUS_RANK: Record<Status, number> = { progress: 0, review: 1, todo: 2, blocked: 3, done: 4 };

export function sortTasks(tasks: Task[], field: SortField, dir: SortDir): Task[] {
  const arr = [...tasks];
  arr.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "due":
        cmp = a.dueDate.localeCompare(b.dueDate);
        break;
      case "priority":
        cmp = PRIO_RANK[a.priority] - PRIO_RANK[b.priority];
        break;
      case "subtasks":
        cmp = a.subtasks.length - b.subtasks.length;
        break;
      case "title":
        cmp = a.title.localeCompare(b.title, "he");
        break;
      case "updated":
        cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return arr;
}
