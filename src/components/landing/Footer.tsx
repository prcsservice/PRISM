"use client";

import Link from "next/link";

const QUICK_LINKS = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#solution" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Disclaimer", href: "#" },
];

export default function Footer() {
    return (
        <footer className="bg-bg-secondary border-t border-border-primary pt-16 md:pt-20">
            <div className="max-w-[1440px] mx-auto px-8 md:px-20 pb-16 md:pb-20">
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-10">
                    {/* Logo & Tagline */}
                    <div className="flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-7 h-7 border-2 border-black rotate-45 flex items-center justify-center">
                                <div className="w-2 h-2 bg-bg-primary" />
                            </div>
                            <span className="text-lg font-extrabold text-text-primary tracking-tight">
                                PRISM
                            </span>
                        </Link>
                        <p className="text-sm text-[#666666] leading-relaxed max-w-[260px]">
                            Predictive Risk Identification System for Mentoring. AI-powered
                            academic early-warning.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-5">
                        <h4 className="label-uppercase tracking-widest text-[#999999] text-xs">
                            Quick Links
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-text-primary hover:text-[#666666] font-medium transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="flex flex-col gap-5">
                        <h4 className="label-uppercase tracking-widest text-[#999999] text-xs">Legal</h4>
                        <ul className="flex flex-col gap-3">
                            {LEGAL_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-text-primary hover:text-[#666666] font-medium transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-5">
                        <h4 className="label-uppercase tracking-widest text-[#999999] text-xs">
                            Contact
                        </h4>
                        <ul className="flex flex-col gap-3">
                            <li className="text-sm font-medium text-text-primary">support@prism.edu</li>
                            <li className="text-sm text-[#666666]">Academic Support Division</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-border-primary text-center flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#999999]">
                        © 2026 PRISM — Academic Support Tool.
                    </p>
                    <p className="text-xs text-[#999999]">
                        Not a medical diagnostic tool.
                    </p>
                </div>
            </div>
        </footer>
    );
}
