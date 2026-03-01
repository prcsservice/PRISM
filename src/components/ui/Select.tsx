"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    options: Option[];
    error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label className="text-sm font-medium text-text-secondary">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            "w-full h-12 px-4 bg-bg-secondary border rounded-lg text-text-primary text-base appearance-none transition-colors focus:outline-none focus:ring-1 focus:ring-accent",
                            error ? "border-red-500" : "border-border-primary hover:border-border-hover",
                            className
                        )}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-bg-secondary text-text-primary">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                        <ChevronDown size={18} />
                    </div>
                </div>
                {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
