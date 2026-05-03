import { ArrowDown, ArrowUp, ArrowUpDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SORT_OPTIONS, type SortField, type SortDir } from "@/lib/task-sort";

export function SortMenu({
  field,
  dir,
  onChange,
}: {
  field: SortField;
  dir: SortDir;
  onChange: (field: SortField, dir: SortDir) => void;
}) {
  const current = SORT_OPTIONS.find((o) => o.id === field)?.label ?? "מיון";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-muted">
          <ArrowUpDown className="h-3.5 w-3.5" />
          מיון: <span className="font-medium">{current}</span>
          {dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" dir="rtl" className="w-52">
        <DropdownMenuLabel>מיון לפי</DropdownMenuLabel>
        {SORT_OPTIONS.map((o) => (
          <DropdownMenuItem key={o.id} onClick={() => onChange(o.id, dir)} className="justify-between">
            {o.label}
            {field === o.id && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>כיוון</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onChange(field, "asc")} className="justify-between">
          <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-3.5 w-3.5" /> עולה</span>
          {dir === "asc" && <Check className="h-3.5 w-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange(field, "desc")} className="justify-between">
          <span className="inline-flex items-center gap-1.5"><ArrowDown className="h-3.5 w-3.5" /> יורד</span>
          {dir === "desc" && <Check className="h-3.5 w-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
