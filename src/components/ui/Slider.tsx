"use client";

import { motion } from "framer-motion";

interface SliderProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
}

export default function Slider({
    label,
    value,
    onChange,
    min = 0,
    max = 10,
    step = 0.5,
    unit = "",
    disabled = false,
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">{label}</label>
                <span className="text-sm font-mono text-text-secondary">
                    {value}{unit}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-primary
                        [&::-webkit-slider-thumb]:shadow-md"
                    style={{
                        background: `linear-gradient(to right, var(--accent) ${percentage}%, var(--bg-tertiary) ${percentage}%)`,
                    }}
                />
            </div>
        </div>
    );
}
