import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import InsuranceLogoTicker from '@/components/landing/InsuranceLogoTicker';
import TrustBar from '@/components/landing/TrustBar';
import Features from '@/components/landing/Features';
import Benefits from '@/components/landing/Benefits';
import ProductShowcase from '@/components/landing/ProductShowcase';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 1. Header */}
            <Header />

            {/* 2. Hero Section */}
            <Hero />

            {/* 3. Trust Bar - Insurance Logos + Stats */}
            <InsuranceLogoTicker />
            <TrustBar />

            {/* 4. Features Section */}
            <Features />

            {/* 5. Benefits Section */}
            <Benefits />

            {/* 6. Product Showcase */}
            <ProductShowcase />

            {/* 7. Testimonials */}
            <Testimonials />

            {/* 8. FAQ */}
            <FAQ />

            {/* 9. CTA Section */}
            <CTASection />

            {/* 10. Footer */}
            <Footer />
        </div>
    );
}
