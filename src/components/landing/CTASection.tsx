"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import MorphingHexagons from "@/components/geometric/MorphingHexagons";
import Link from "next/link";

export default function CTASection() {
    return (
        <section className="relative bg-[#A3E635] py-28 md:py-36 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-size-[40px_40px] opacity-[0.05]" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col items-center gap-8"
                >
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-text-primary tracking-[-0.04em]">
                        Ready to Protect
                        <br />
                        Your Students?
                    </h2>
                    <p className="text-lg md:text-xl text-text-primary/80 max-w-lg leading-relaxed">
                        Join institutions already using AI-powered early warning systems to
                        improve student outcomes and reduce academic failure rates.
                    </p>
                    <div className="flex gap-4 flex-wrap justify-center pt-8">
                        <Link href="/auth/teacher">
                            <button className="px-8 py-4 bg-bg-primary text-text-primary rounded-full font-medium hover:bg-[#333333] transition-colors text-lg shadow-xl shadow-black/10">
                                Get Started <span className="ml-2 font-normal">→</span>
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
