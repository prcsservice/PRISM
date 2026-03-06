"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { Database, Brain, Shield, BellRing, ArrowRight } from "lucide-react";

const STEP_ICONS = [Database, Brain, Shield, BellRing];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="bg-bg-primary py-16 md:py-24 lg:py-32">
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">

                {/* Header section inspired by Growwwkit reference */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
                    <div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-text-primary tracking-tight mb-6">
                            How It Works
                        </h2>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="px-5 py-2.5 bg-bg-primary text-text-primary rounded-full font-medium text-sm inline-flex items-center gap-2">
                                4-Step Process
                            </div>
                            <span className="text-[#666666] text-sm">Predicts risk before performance drops.</span>
                        </div>
                    </div>

                    <p className="text-lg md:text-xl text-[#333333] max-w-lg leading-relaxed">
                        PRISM is a comprehensive ML-driven platform that identifies unique behavioral patterns to give you context on student well-being.
                    </p>
                </div>

                {/* Grid of steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {HOW_IT_WORKS_STEPS.map((step, i) => {
                        const Icon = STEP_ICONS[i];
                        // Add some slight offsetting to middle cards for a dynamic look
                        const yOffset = i === 1 || i === 2 ? "md:translate-y-8" : "";

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className={`flex flex-col bg-bg-primary rounded-3xl p-8 border border-border-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all ${yOffset}`}
                            >
                                <div className="h-48 flex items-center justify-center mb-8 relative">
                                    {/* Placeholder for illustration/icon */}
                                    <div className="absolute inset-0 bg-bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-[#f0f0eb] transition-colors">
                                        <Icon size={64} className="text-text-primary/80" strokeWidth={1} />
                                    </div>
                                    <div className="absolute top-4 right-4 w-8 h-8 bg-bg-primary rounded-full flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                                        {i + 1}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-semibold text-text-primary">
                                            {step.title}
                                        </h3>
                                        <span className="px-2 py-0.5 bg-bg-primary text-text-primary text-[10px] font-bold rounded-full">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <p className="text-[#666666] text-sm leading-relaxed mb-6">
                                        {step.description}
                                    </p>

                                    <div className="flex justify-end">
                                        <ArrowRight size={20} className="text-[#999999]" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
