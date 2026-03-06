import Navbar from "@/components/landing/Navbar";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function HowItWorksPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-24" />
            <HowItWorksSection />
            <CTASection />
            <Footer />
        </main>
    );
}
