"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import RotatingPrism from "@/components/geometric/RotatingPrism";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    roleText: string;
    roleLink: string;
    roleLinkText: string;
    accentColor: "yellow" | "lime" | "purple";
}

export default function AuthCard({
    title,
    subtitle,
    children,
    roleText,
    roleLink,
    roleLinkText,
    accentColor,
}: AuthCardProps) {
    const accentHsl =
        accentColor === "yellow"
            ? "var(--accent)"
            : accentColor === "lime"
                ? "#A3E635"
                : "#A855F7";

    return (
        <div className="min-h-screen bg-bg-primary flex lg:grid lg:grid-cols-2">
            {/* Left Column — Form */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 w-full lg:w-auto">
                <Link href="/" className="absolute top-8 left-8 sm:left-16 lg:left-24 flex items-center gap-2.5">
                    <div
                        className="w-6 h-6 border-2 rotate-45 flex items-center justify-center"
                        style={{ borderColor: accentHsl }}
                    >
                        <div className="w-1.5 h-1.5 rotate-0" style={{ backgroundColor: accentHsl }} />
                    </div>
                    <span className="text-lg font-extrabold text-text-primary tracking-tight">PRISM</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md mx-auto mt-16 lg:mt-0"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-3">
                        {title}
                    </h1>
                    <p className="text-base text-text-secondary mb-10 leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="space-y-6">
                        {children}

                        <div className="pt-6 border-t border-border-primary text-center">
                            <p className="text-sm text-text-secondary">
                                {roleText}{" "}
                                <Link
                                    href={roleLink}
                                    className="font-medium hover:underline focus:outline-none"
                                    style={{ color: accentHsl }}
                                >
                                    {roleLinkText}
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Column — Geometric Pattern */}
            <div className="hidden lg:flex relative overflow-hidden bg-bg-secondary border-l border-border-primary">
                {/* Subtle gradient overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${accentHsl} 0%, transparent 60%)`,
                    }}
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-70">
                    <RotatingPrism size={280} />
                </div>

                <div className="absolute bottom-12 left-12 right-12">
                    <div className="p-6 bg-bg-primary/40 backdrop-blur-md border border-border-primary rounded-xl">
                        <p className="text-lg font-medium text-text-primary mb-2">
                            Predictive Risk Identification System
                        </p>
                        <p className="text-sm text-text-secondary">
                            Built with privacy-first architecture and explainable AI insights.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
