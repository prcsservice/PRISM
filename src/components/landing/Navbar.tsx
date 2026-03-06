"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Security", href: "/security" },
    { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        // Lock body scroll when menu is open
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => window.removeEventListener("scroll", handleScroll);
    }, [menuOpen]);

    return (
        <>
            {/* Overlay background when menu is open */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-90 bg-bg-primary/80 backdrop-blur-sm"
                        onClick={() => setMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Expanding Navbar Container */}
            <motion.nav
                layout // Automatically animates width, height, and position changes smoothly
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                }}
                className={cn(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col overflow-hidden",
                    "bg-bg-secondary border border-border-secondary shadow-2xl",
                    menuOpen ? "w-[95%] max-w-6xl rounded-[10px]" : "w-[95%] md:w-[640px] lg:w-[760px] rounded-[10px]"
                )}
            >
                {/* Header Row (Always visible) */}
                <motion.div layout="position" className="h-14 shrink-0 flex items-center justify-between px-2 md:px-6 py-2 w-full gap-4 md:gap-12">
                    {/* Left side: Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="h-full flex items-center gap-2 px-3 md:pl-4 md:pr-6 rounded-[8px] text-text-primary hover:bg-bg-primary/5 transition-colors group shrink-0"
                    >
                        <div className="flex flex-col gap-[4px] justify-center w-5">
                            <span className={cn("block h-[2px] bg-text-primary transition-transform duration-300", menuOpen ? "rotate-45 translate-y-[6px]" : "")} />
                            <span className={cn("block h-[2px] bg-text-primary transition-opacity duration-300", menuOpen ? "opacity-0" : "")} />
                            <span className={cn("block h-[2px] w-4 bg-text-primary transition-transform duration-300", menuOpen ? "-rotate-45 -translate-y-[6px] w-5" : "group-hover:w-5")} />
                        </div>
                        <span className="font-medium tracking-wide hidden sm:block">Menu</span>
                    </button>

                    {/* Center: Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 pr-4 md:pr-0" onClick={() => setMenuOpen(false)}>
                        <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white rotate-45 flex items-center justify-center">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-text-primary rotate-0" />
                        </div>
                        <span className="text-lg md:text-xl font-extrabold text-text-primary tracking-tight">PRISM</span>
                    </Link>

                    {/* Right side: Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2 h-full shrink-0">
                        <Link href="/auth/student" className="h-full flex items-center">
                            <button className="px-6 h-full text-text-primary bg-bg-tertiary hover:bg-bg-hover rounded-[8px] font-medium transition-colors">
                                Login
                            </button>
                        </Link>
                        <Link href="/auth/teacher" className="h-full flex items-center pr-2">
                            <button className="px-6 h-full text-black bg-accent hover:brightness-90 rounded-[8px] font-medium transition-colors">
                                Join
                            </button>
                        </Link>
                    </div>

                    {/* Mobile minimal right side */}
                    <div className="md:hidden flex h-full pr-1 shrink-0">
                        <Link href="/auth/teacher" className="h-full flex items-center">
                            <button className="px-4 h-full text-black bg-accent hover:brightness-90 rounded-[8px] font-medium transition-colors">
                                Join
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Dropdown Content */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full text-text-primary"
                        >
                            <div className="px-6 md:px-12 pb-12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-border-secondary">
                                {/* Navigation Links Column */}
                                <div className="flex flex-col justify-center gap-2">
                                    <span className="text-text-muted text-sm font-bold tracking-widest uppercase mb-4">Navigation</span>
                                    {NAV_LINKS.map((link, i) => (
                                        <motion.div
                                            key={link.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 + 0.2 }}
                                        >
                                            <Link
                                                href={link.href}
                                                className="text-3xl md:text-5xl font-medium hover:text-[#A3E635] transition-colors py-2 md:py-3 block"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Additional Info Column */}
                                <div className="flex flex-col justify-center md:pt-8">
                                    <span className="text-text-muted text-sm font-bold tracking-widest uppercase mb-4">Quick Actions</span>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/auth/student" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full p-4 rounded-[10px] text-left text-xl md:text-2xl text-text-primary hover:bg-bg-hover transition-colors">
                                                Student Login
                                            </button>
                                        </Link>
                                        <Link href="/auth/teacher" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full text-left text-xl md:text-2xl text-black bg-accent p-4 rounded-[10px] font-medium hover:brightness-90 transition-colors flex justify-between items-center group">
                                                <span>Teacher Login</span>
                                                <span className="group-hover:translate-x-2 transition-transform">→</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
}
