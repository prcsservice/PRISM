"use client";

import { useState } from "react";

interface TabsProps {
    tabs: string[];
    defaultIndex?: number;
    onChange?: (index: number) => void;
    children: React.ReactNode[];
}

export default function Tabs({ tabs, defaultIndex = 0, onChange, children }: TabsProps) {
    const [activeIndex, setActiveIndex] = useState(defaultIndex);

    const handleChange = (idx: number) => {
        setActiveIndex(idx);
        onChange?.(idx);
    };

    return (
        <div>
            <div className="flex gap-1 border-b border-border-primary mb-6">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab}
                        onClick={() => handleChange(idx)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeIndex === idx
                                ? "text-text-primary"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                    >
                        {tab}
                        {activeIndex === idx && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />
                        )}
                    </button>
                ))}
            </div>
            <div>{children[activeIndex]}</div>
        </div>
    );
}
