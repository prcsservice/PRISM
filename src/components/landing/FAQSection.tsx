"use client";

import { motion } from "framer-motion";
import Accordion from "@/components/ui/Accordion";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FAQSection() {
    return (
        <section id="faq" className="bg-bg-secondary py-28 md:py-36">
            <div className="max-w-[1440px] mx-auto px-8 md:px-20">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="mb-14 flex flex-col gap-5"
                    >
                        <span className="label-uppercase text-(--accent) tracking-widest">
                            FAQ
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-text-dark tracking-[-0.02em]">
                            Common Questions
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Accordion items={[...FAQ_ITEMS]} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
