import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                low: "border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20",
                medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                high: "border-orange-500/20 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
                critical: "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20",
                default: "border-border-primary bg-bg-hover text-text-secondary hover:bg-[#2A2A2A]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface RiskBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function RiskBadge({ className, variant, ...props }: RiskBadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
