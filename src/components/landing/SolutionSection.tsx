"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Bell, Users } from "lucide-react";

const FEATURES = [
    {
        title: "Predictive Analytics",
        description:
            "Gemini 2.0 Flash AI analyzes behavioral and academic data to predict stress levels, failure probability, and attendance decline.",
        icon: TrendingUp,
        span: "md:col-span-2 md:row-span-2",
    },
    {
        title: "Real-Time Monitoring",
        description: "Continuous tracking of student wellness indicators through daily self-reported logs.",
        icon: Activity,
        span: "",
    },
    {
        title: "Smart Alerts",
        description: "Priority-based notifications alert faculty when students cross risk thresholds.",
        icon: Bell,
        span: "",
    },
    {
        title: "Faculty Intervention Tools",
        description:
            "Teachers can track interventions, add notes, update academic records, and monitor outcomes for at-risk students.",
        icon: Users,
        span: "md:col-span-2",
    },
];

export default function SolutionSection() {
    return (
        <section id="solution" className="bg-bg-primary py-16 md:py-28 lg:py-36">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-16 md:mb-20 flex flex-col gap-5"
                >
                    <span className="label-uppercase tracking-widest text-text-primary">
                        The Solution
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-[-0.02em]">
                        AI That Watches, So
                        <br />
                        Teachers Can Act
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-4">
                    {FEATURES.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`bg-bg-primary border border-border-primary shadow-sm rounded-[10px] p-8 md:p-10 hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-5 ${feature.span}`}
                            >
                                <div className="w-14 h-14 border border-border-primary bg-bg-secondary rounded-[8px] flex items-center justify-center">
                                    <Icon size={24} className="text-text-primary" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-text-primary">{feature.title}</h3>
                                <p className="text-sm md:text-base text-[#666666] leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
