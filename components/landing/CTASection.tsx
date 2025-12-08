import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function CTASection() {
    const benefits = [
        'Free forever for up to 5 policies',
        'No credit card required',
        'Set up in under 2 minutes',
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-30 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-700 rounded-full opacity-30 blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Ready to Simplify Your Insurance?
                </h2>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of Indians who have taken control of their insurance portfolio.
                    Start managing all your policies in one place today.
                </p>

                {/* CTA Button */}
                <div className="flex flex-col items-center gap-6">
                    <Link
                        href="/signup"
                        className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center"
                    >
                        Get Started for Free
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Benefits list */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/90 text-sm">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
