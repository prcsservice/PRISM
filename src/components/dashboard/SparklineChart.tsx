"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";

interface SparklineChartProps {
    data: number[];
    color?: string;
    height?: number;
}

export default function SparklineChart({ data, color = "var(--accent)", height = 40 }: SparklineChartProps) {
    const chartData = data.map((value, index) => ({ index, value }));

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
