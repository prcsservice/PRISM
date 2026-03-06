import Navbar from "@/components/landing/Navbar";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function FAQPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-24" />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    );
}
