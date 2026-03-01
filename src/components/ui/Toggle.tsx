"use client";

interface ToggleProps {
    label?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}

export default function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-accent" : "bg-bg-tertiary"
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
            {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
        </label>
    );
}
