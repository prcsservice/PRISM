"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PROBLEM_STATS } from "@/lib/constants";

function AnimatedCounter({ target }: { target: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [value, setValue] = useState(0);

    const numericTarget = parseInt(target.replace(/\D/g, ""));
    const hasX = target.includes("x");

    useEffect(() => {
        if (!isInView) return;

        const duration = 1500;
        const start = performance.now();

        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(numericTarget * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, [isInView, numericTarget]);

    return (
        <span ref={ref} className="mono-number text-5xl md:text-6xl text-text-dark">
            {value}
            {hasX ? "x" : "%"}
        </span>
    );
}

export default function ProblemSection() {
    return (
        <section id="problem" className="bg-bg-primary py-16 md:py-28 lg:py-36">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-20 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                {/* Left — Text */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col gap-6"
                >
                    <span className="label-uppercase tracking-widest text-text-primary">
                        The Problem
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-[-0.02em]">
                        Students Struggle
                        <br />
                        in Silence
                    </h2>
                    <p className="text-base md:text-lg text-[#666666] leading-relaxed max-w-md">
                        Academic stress affects millions of students annually. Without early
                        detection systems, at-risk students go unnoticed until it is too late
                        for effective intervention. Faculty often lack the data to identify
                        warning signs before academic failure occurs.
                    </p>
                </motion.div>

                {/* Right — Bento Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="grid grid-cols-2 gap-4"
                >
                    {PROBLEM_STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            className="bg-bg-primary border border-border-primary shadow-sm rounded-[10px] p-8 md:p-10 hover:border-accent hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <AnimatedCounter target={stat.value} />
                            <p className="text-sm md:text-base text-[#666666] mt-4 leading-snug">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
