import Navbar from "@/components/landing/Navbar";
import SolutionSection from "@/components/landing/SolutionSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function FeaturesPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-24" />
            <SolutionSection />
            <CTASection />
            <Footer />
        </main>
    );
}
