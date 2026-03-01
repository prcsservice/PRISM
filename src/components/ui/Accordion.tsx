"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionItem {
    question: string;
    answer: string;
}

interface AccordionProps {
    items: AccordionItem[];
    className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className={cn("w-full", className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border-b border-border-light"
                >
                    <button
                        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="text-lg font-semibold text-text-dark group-hover:text-(--accent) transition-colors duration-200 pr-4">
                            {item.question}
                        </span>
                        <motion.span
                            animate={{ rotate: openIndex === index ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0"
                        >
                            {openIndex === index ? (
                                <Minus size={20} className="text-(--accent)" />
                            ) : (
                                <Plus size={20} className="text-text-dark-muted" />
                            )}
                        </motion.span>
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <p className="pb-6 text-sm text-text-dark-muted leading-relaxed max-w-2xl">
                                    {item.answer}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
