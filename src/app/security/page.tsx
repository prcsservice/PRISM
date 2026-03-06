import Navbar from "@/components/landing/Navbar";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function SecurityPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-24" />
            <SecuritySection />
            <CTASection />
            <Footer />
        </main>
    );
}
