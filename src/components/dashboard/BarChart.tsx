"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface BarChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    color?: string;
    height?: number;
    highlightThreshold?: number; // E.g., highlight bars above 50 in red
}

export default function BarChart({
    data,
    xKey,
    yKey,
    color = "#A3E635", // Default Lime
    height = 300,
    highlightThreshold,
}: BarChartProps) {
    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--border-primary)', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-primary)",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                        }}
                    />
                    <Bar
                        dataKey={yKey}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => {
                            // Highlight bars above a certain threshold (e.g. for high risk scores)
                            let barColor = color;
                            if (highlightThreshold !== undefined && entry[yKey] >= highlightThreshold) {
                                barColor = "#EF4444"; // Red
                            }
                            return <Cell key={`cell-${index}`} fill={barColor} />;
                        })}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}
