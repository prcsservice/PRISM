"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-semibold transition-all duration-300 cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary:
                "bg-(--accent) text-black hover:bg-(--accent-hover) hover:-translate-y-[1px] uppercase tracking-[0.02em]",
            secondary:
                "bg-transparent text-(--text-primary) border border-(--border-color) hover:border-(--accent) hover:text-(--accent)",
            ghost:
                "bg-transparent text-(--text-secondary) hover:text-(--text-primary)",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs rounded-[6px]",
            md: "px-8 py-3.5 text-sm rounded-[8px]",
            lg: "px-10 py-4 text-sm rounded-[8px]",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
export default Button;
