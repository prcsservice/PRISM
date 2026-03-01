"use client";

import { Check } from "lucide-react";

interface ConsentCheckboxProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    title: string;
    description: string;
}

export default function ConsentCheckbox({
    id,
    checked,
    onChange,
    title,
    description,
}: ConsentCheckboxProps) {
    return (
        <label
            htmlFor={id}
            className={`group relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${checked
                ? "bg-accent/10 border-accent"
                : "bg-bg-secondary border-border-primary hover:border-gray-600"
                }`}
        >
            <div className="flex items-center h-6 mt-0.5">
                <div
                    className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${checked
                        ? "bg-accent border-accent text-black"
                        : "border-gray-500 group-hover:border-gray-400 bg-transparent text-transparent"
                        }`}
                >
                    <Check size={14} strokeWidth={3} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className={`font-semibold ${checked ? "text-text-primary" : "text-gray-200"}`}>
                    {title}
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">
                    {description}
                </span>
            </div>

            {/* Hidden native checkbox for accessibility/form submission */}
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
                aria-describedby={`${id}-description`}
            />
        </label>
    );
}
