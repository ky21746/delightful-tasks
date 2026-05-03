import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { rephraseText } from "@/server/rephrase.functions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AiRephraseButtonProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
  tone?: "clear" | "formal" | "friendly" | "concise";
  minLength?: number;
}

export function AiRephraseButton({
  value,
  onChange,
  disabled,
  className,
  tone = "clear",
  minLength = 3,
}: AiRephraseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [original, setOriginal] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const rephrase = useServerFn(rephraseText);

  const tooShort = value.trim().length < minLength;
  const isDisabled = disabled || loading || tooShort;

  const handleClick = async () => {
    if (isDisabled) return;
    const text = value;
    setOriginal(text);
    setSuggestion("");
    setOpen(true);
    setLoading(true);
    try {
      const result = await rephrase({ data: { text, tone } });
      if (!result.ok) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      setSuggestion(result.text);
    } catch (e) {
      console.error(e);
      toast.error("שגיאה בעת ניסוח מחדש");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    onChange(suggestion);
    setOpen(false);
    toast.success("הטקסט הוחלף בגרסה המנוסחת");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label="נסח מחדש את הטקסט בעזרת בינה מלאכותית"
        aria-busy={loading}
        title={tooShort ? "כתוב לפחות מספר תווים כדי לנסח מחדש" : "נסח מחדש בעזרת AI"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border bg-background/80 px-3 py-1.5 ms-2 my-1 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur transition-all",
          "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        )}
        <span>{loading ? "מנסח…" : "נסח מחדש"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              ניסוח מחדש בעזרת AI
            </DialogTitle>
            <DialogDescription className="text-right">
              השווה בין הטקסט המקורי לגרסה המוצעת. אישור יחליף את התוכן בתיבה.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border bg-muted/40 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                לפני (מקור)
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {original}
              </p>
            </section>
            <section className="rounded-xl border-2 border-primary/40 bg-primary/5 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                אחרי (מוצע)
              </h4>
              {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  מנסח…
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {suggestion}
                </p>
              )}
            </section>
          </div>

          <DialogFooter className="flex-row-reverse justify-start gap-2 sm:justify-start">
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading || !suggestion}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              אשר והחלף
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              ביטול
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
