import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend: number; // Percentage, positive or negative
    trendLabel: string;
    icon: ReactNode;
    invertColors?: boolean; // If true, positive trend is red, negative is green (e.g. for Stress)
}

export default function MetricCard({
    title,
    value,
    trend,
    trendLabel,
    icon,
    invertColors = false,
}: MetricCardProps) {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    // Determine trend color based on context
    let trendColor = "text-text-secondary";
    let TrendIcon = Minus;

    if (!isNeutral) {
        if (invertColors) {
            trendColor = isPositive ? "text-red-500" : "text-green-500";
        } else {
            trendColor = isPositive ? "text-green-500" : "text-red-500";
        }
        TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    }

    return (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 md:p-6 transition-all hover:border-border-hover">
            <div className="flex items-start justify-between mb-3 md:mb-4">
                <h3 className="text-xs md:text-sm font-medium text-text-secondary">{title}</h3>
                <div className="p-1.5 md:p-2 bg-bg-hover rounded-lg text-text-primary">
                    {icon}
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1.5 md:mb-2">
                <span className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{value}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className={`flex items-center font-semibold ${trendColor}`}>
                    <TrendIcon size={14} className="mr-0.5" />
                    {Math.abs(trend)}%
                </span>
                <span className="truncate">{trendLabel}</span>
            </div>
        </div>
    );
}
