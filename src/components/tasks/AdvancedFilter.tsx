import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { statusConfig, priorityConfig } from "@/lib/task-config";
import type { Status, Priority } from "@/data/tasks";
import { projects } from "@/data/tasks";

export type AdvancedFilters = {
  statuses: Status[];
  priorities: Priority[];
  projects: string[];
  from?: Date;
  to?: Date;
};

export const EMPTY_FILTERS: AdvancedFilters = {
  statuses: [],
  priorities: [],
  projects: [],
};

export function countActive(f: AdvancedFilters) {
  return f.statuses.length + f.priorities.length + f.projects.length + (f.from ? 1 : 0) + (f.to ? 1 : 0);
}

export function AdvancedFilter({
  value,
  onChange,
}: {
  value: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = countActive(value);

  const toggle = <K extends "statuses" | "priorities" | "projects">(key: K, item: AdvancedFilters[K][number]) => {
    const set = new Set(value[key] as string[]);
    if (set.has(item as string)) set.delete(item as string);
    else set.add(item as string);
    onChange({ ...value, [key]: Array.from(set) as AdvancedFilters[K] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted">
          <SlidersHorizontal className="h-3.5 w-3.5" /> סינון
          {active > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {active}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0" dir="rtl">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <h4 className="text-sm font-semibold">סינון מתקדם</h4>
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3 w-3" /> נקה הכל
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
          <Section title="סטטוס">
            {(Object.keys(statusConfig) as Status[]).map((k) => (
              <Chip
                key={k}
                active={value.statuses.includes(k)}
                onClick={() => toggle("statuses", k)}
                color={statusConfig[k].color}
              >
                {statusConfig[k].label}
              </Chip>
            ))}
          </Section>

          <Section title="עדיפות">
            {(Object.keys(priorityConfig) as Priority[]).map((k) => (
              <Chip
                key={k}
                active={value.priorities.includes(k)}
                onClick={() => toggle("priorities", k)}
                color={priorityConfig[k].color}
              >
                {priorityConfig[k].label}
              </Chip>
            ))}
          </Section>

          <Section title="פרויקט">
            {projects.map((p) => (
              <Chip
                key={p.name}
                active={value.projects.includes(p.name)}
                onClick={() => toggle("projects", p.name)}
                color={p.color}
              >
                {p.name}
              </Chip>
            ))}
          </Section>

          <Section title="טווח תאריכים">
            <div className="flex w-full flex-col gap-2">
              <DateField
                label="מתאריך"
                date={value.from}
                onChange={(d) => onChange({ ...value, from: d })}
              />
              <DateField
                label="עד תאריך"
                date={value.to}
                onChange={(d) => onChange({ ...value, to: d })}
              />
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-2.5">
          <Button size="sm" onClick={() => setOpen(false)}>
            סגור
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  );
}

function DateField({
  label,
  date,
  onChange,
}: {
  label: string;
  date?: Date;
  onChange: (d?: Date) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-muted-foreground">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 justify-start text-xs font-normal">
            {date ? date.toLocaleDateString("he-IL") : "בחר תאריך"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          onClick={() => onChange(undefined)}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
