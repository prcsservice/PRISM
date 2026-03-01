"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileWarning } from "lucide-react";

const FEATURES = [
    {
        title: "Consent-First",
        description:
            "Data collection only begins after explicit student consent. Every data point is opt-in and transparent.",
        icon: ShieldCheck,
    },
    {
        title: "Encrypted Data",
        description:
            "All data is encrypted in transit and at rest. Firestore security rules enforce strict role-based access control.",
        icon: Lock,
    },
    {
        title: "No Medical Claims",
        description:
            "PRISM is an academic support tool. It does not diagnose medical or psychological conditions.",
        icon: FileWarning,
    },
];

export default function SecuritySection() {
    return (
        <section id="security" className="bg-bg-primary py-28 md:py-36">
            <div className="max-w-[1440px] mx-auto px-8 md:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-16 md:mb-20 flex flex-col gap-5"
                >
                    <span className="label-uppercase tracking-widest text-text-primary">
                        Trust & Security
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-[-0.02em]">
                        Built on Privacy,
                        <br />
                        Powered by Consent
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
                                className="bg-bg-primary border border-border-primary shadow-sm rounded-[10px] p-8 md:p-10 hover:border-(--accent) hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-6"
                            >
                                <div className="w-14 h-14 border border-border-primary bg-bg-secondary rounded-[8px] flex items-center justify-center">
                                    <Icon
                                        size={28}
                                        className="text-text-primary"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-text-primary">
                                    {feature.title}
                                </h3>
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
