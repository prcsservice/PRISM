"use client";

import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

interface LineChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    color?: string;
    height?: number;
    showGrid?: boolean;
    referenceLine?: { y: number; label: string; color?: string };
}

export default function LineChart({
    data,
    xKey,
    yKey,
    color = "var(--accent)", // Default yellow
    height = 300,
    showGrid = true,
    referenceLine,
}: LineChartProps) {
    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    )}
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
                        contentStyle={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-primary)",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                        }}
                        itemStyle={{ color: "var(--text-primary)" }}
                    />

                    {referenceLine && (
                        <ReferenceLine
                            y={referenceLine.y}
                            label={{ position: 'insideTopLeft', value: referenceLine.label, fill: referenceLine.color || '#F87171', fontSize: 12 }}
                            stroke={referenceLine.color || "#F87171"}
                            strokeDasharray="3 3"
                        />
                    )}

                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#000", stroke: color, strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: color, stroke: "#000", strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}
