import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { rephraseText } from "@/server/rephrase.functions";
import { cn } from "@/lib/utils";

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
  const rephrase = useServerFn(rephraseText);

  const tooShort = value.trim().length < minLength;
  const isDisabled = disabled || loading || tooShort;

  const handleClick = async () => {
    if (isDisabled) return;
    const original = value;
    setLoading(true);
    try {
      const result = await rephrase({ data: { text: original, tone } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onChange(result.text);
      toast.success("הטקסט נוסח מחדש", {
        action: {
          label: "בטל",
          onClick: () => onChange(original),
        },
        duration: 6000,
      });
    } catch (e) {
      console.error(e);
      toast.error("שגיאה בעת ניסוח מחדש");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="נסח מחדש את הטקסט בעזרת בינה מלאכותית"
      aria-busy={loading}
      title={tooShort ? "כתוב לפחות מספר תווים כדי לנסח מחדש" : "נסח מחדש בעזרת AI"}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border bg-background/80 px-2 py-1 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur transition-all",
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
  );
}
