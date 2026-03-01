import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISM — Predictive Risk Identification System for Mentoring",
  description:
    "AI-powered academic early-warning system that monitors behavioral and academic indicators, predicts stress levels, and alerts teachers before academic deterioration occurs.",
  keywords: [
    "PRISM",
    "academic risk",
    "student monitoring",
    "AI prediction",
    "early warning",
    "stress detection",
  ],
  openGraph: {
    title: "PRISM — Predictive Risk Identification System for Mentoring",
    description:
      "AI-powered academic early-warning system for institutions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
