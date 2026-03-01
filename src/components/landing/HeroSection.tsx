"use client";

import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CARDS = [
    {
        title: "Data Integration",
        description: "Seamlessly connects with your existing LMS and SIS platforms.",
        color: "bg-[#A855F7]", // Purple
        rotation: "-rotate-3",
        delay: 0.2
    },
    {
        title: "AI Analysis",
        description: "Monitors behavior patterns to predict stress and academic risk.",
        color: "bg-[#EAB308]", // Yellow
        rotation: "rotate-2",
        delay: 0.4
    },
    {
        title: "Early Warning",
        description: "Alerts faculty instantly before academic deterioration occurs.",
        color: "bg-[#F97316]", // Orange
        rotation: "-rotate-2",
        delay: 0.6
    }
];

export default function HeroSection() {
    return (
        <section
            id="hero"
            className="relative min-h-screen bg-bg-primary flex flex-col items-center justify-center pt-28 pb-24 overflow-hidden selection:bg-[#A3E635] selection:text-text-primary"
        >
            <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col items-center text-center z-10">

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl flex flex-col items-center text-center gap-3"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-[60px] lg:text-[76px] font-medium leading-tight tracking-tight flex flex-row items-center justify-center gap-2 md:gap-4 text-text-primary whitespace-nowrap">
                        <span>Detect Risk</span>

                        {/* Purple SVG Star inspired by reference */}
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A1FF62" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 shrink-0 mx-1 md:mx-2">
                            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                        </svg>

                        <span className="text-text-muted">Before Failure</span>
                    </h1>

                    <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed mt-4 text-center">
                        AI-powered{" "}
                        <span className="inline-flex items-center bg-bg-secondary px-3 py-1 rounded-full text-text-primary text-xs sm:text-sm font-medium mx-1 border border-border-primary translate-y-[-2px]">
                            early warning system
                        </span>{" "}
                        that provides{" "}
                        <span className="inline-flex items-center bg-bg-secondary px-3 py-1 rounded-full text-text-primary text-xs sm:text-sm font-medium mx-1 border border-border-primary translate-y-[-2px]">
                            faculty
                        </span>{" "}
                        with actionable insights to improve student outcomes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Link href="/auth/teacher">
                            <button className="px-6 py-3 bg-bg-tertiary text-text-primary rounded-full font-medium hover:bg-bg-hover transition-colors text-sm shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                                Get Started <span className="font-normal">→</span>
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Floating Feature Cards */}
                <div className="mt-24 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 perspective-1000">
                    {CARDS.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 100, rotateX: 20 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ duration: 0.8, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                                "group relative p-8 h-[280px] flex flex-col justify-between shadow-2xl transition-transform duration-500",
                                card.color,
                                card.rotation,
                                "hover:rotate-0 hover:scale-105 hover:-translate-y-4 cursor-pointer" // User requested hover effects
                            )}
                            style={{
                                // Sticky note styling
                                boxShadow: "2px 10px 30px rgba(0,0,0,0.15)",
                                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)"
                            }}
                        >
                            {/* Tape effect on top center */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-bg-primary/40 rotate-[-5deg] backdrop-blur-sm" />

                            <div className="flex justify-between items-start">
                                <span className="font-mono text-text-primary/70 font-semibold text-lg max-w-[60%] leading-tight">
                                    {card.title}
                                </span>
                                <span className="text-text-primary/50 text-sm font-mono tracking-widest">0{idx + 1}</span>
                            </div>

                            <div className="mt-auto">
                                <p className="text-text-primary font-medium text-lg leading-snug">
                                    {card.description}
                                </p>
                            </div>

                            {/* Folded corner bottom right */}
                            <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-bg-primary/10"
                                style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-linear-to-br from-[#A3E635]/10 to-transparent blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-linear-to-tl from-[#A855F7]/10 to-transparent blur-[120px] rounded-full" />

                {/* Faded grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-size-[40px_40px] opacity-[0.03]" />
            </div>

            {/* Scroll hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown size={24} className="text-[#999999]" />
                </motion.div>
            </motion.div>
        </section>
    );
}
