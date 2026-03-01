"use client";

interface PeriodSelectorProps {
    periods: { label: string; value: number }[];
    selected: number;
    onChange: (value: number) => void;
}

const DEFAULT_PERIODS = [
    { label: "7D", value: 7 },
    { label: "14D", value: 14 },
    { label: "30D", value: 30 },
];

export default function PeriodSelector({
    periods = DEFAULT_PERIODS,
    selected,
    onChange,
}: PeriodSelectorProps) {
    return (
        <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 border border-border-primary">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selected === p.value
                            ? "bg-accent text-black"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
