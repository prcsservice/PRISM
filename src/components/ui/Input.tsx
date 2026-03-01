"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-xs font-medium text-text-secondary uppercase tracking-[0.05em]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        "w-full bg-bg-tertiary border border-border rounded-[6px] px-4 py-3.5 text-sm text-text-primary placeholder:text-text-secondary transition-all duration-200 focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)",
                        error && "border-(--color-risk-high)",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-(--color-risk-high)">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;
