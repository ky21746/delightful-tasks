import * as React from "react";
import { AiRephraseButton } from "./AiRephraseButton";
import { cn } from "@/lib/utils";

interface AiTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> {
  value: string;
  onChange: (next: string) => void;
  tone?: "clear" | "formal" | "friendly" | "concise";
  wrapperClassName?: string;
}

export const AiTextArea = React.forwardRef<HTMLTextAreaElement, AiTextAreaProps>(
  ({ value, onChange, tone, className, wrapperClassName, disabled, ...rest }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn("pb-10", className)}
          {...rest}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-start px-2">
          <div className="pointer-events-auto">
            <AiRephraseButton value={value} onChange={onChange} tone={tone} disabled={disabled} />
          </div>
        </div>
      </div>
    );
  },
);
AiTextArea.displayName = "AiTextArea";
