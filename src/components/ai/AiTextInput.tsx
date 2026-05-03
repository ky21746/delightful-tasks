import * as React from "react";
import { AiRephraseButton } from "./AiRephraseButton";
import { cn } from "@/lib/utils";

interface AiTextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (next: string) => void;
  tone?: "clear" | "formal" | "friendly" | "concise";
  wrapperClassName?: string;
}

export const AiTextInput = React.forwardRef<HTMLInputElement, AiTextInputProps>(
  ({ value, onChange, tone, className, wrapperClassName, disabled, ...rest }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn("pl-28", className)}
          {...rest}
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <AiRephraseButton value={value} onChange={onChange} tone={tone} disabled={disabled} />
        </div>
      </div>
    );
  },
);
AiTextInput.displayName = "AiTextInput";
