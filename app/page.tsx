import Link from 'next/link';
import { Shield, FileText, Bell, Users, TrendingUp, Lock } from 'lucide-react';

export default function LandingPage() {
    const benefits = [
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Single View of All Policies",
            description: "Manage all your insurance policies across multiple insurers in one unified dashboard"
        },
        {
            icon: <Bell className="w-8 h-8" />,
            title: "Track Expiries in Advance",
            description: "Get timely alerts and reminders before your policies expire, never miss a renewal"
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Centralized Document Storage",
            description: "Securely store and access all policy documents, RCs, and claims in one place"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Claim Support & Reminders",
            description: "Simplified claim registration process with status tracking and support"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Dedicated RM Support",
            description: "Get personalized assistance from your dedicated Relationship Manager"
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: "Secure & Compliant",
            description: "Enterprise-grade security with role-based access and audit trails"
        }
    ];

    const clientLogos = [
        "ICICI Lombard", "HDFC ERGO", "Bajaj Allianz", "Reliance General",
        "TATA AIG", "Future Generali", "SBI General", "New India"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-8 h-8 text-primary-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                One Single View
                            </h1>
                        </div>
                        <Link href="/login" className="btn-primary btn-sm">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-5xl font-bold mb-6 leading-tight">
                            Your Complete{" "}
                            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Insurance Portfolio
                            </span>{" "}
                            in One Place
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Simplify insurance management for corporate and individual customers.
                            Track policies, manage claims, and never miss an expiry.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login" className="btn-primary text-lg px-8 py-4">
                                Get Started
                            </Link>
                            <Link
                                href="/signup"
                                className="btn-outline text-lg px-8 py-4"
                            >
                                Sign Up Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Client Logos Section */}
            <section className="py-12 bg-white/60 backdrop-blur-sm">
                <div className="container">
                    <h3 className="text-center text-sm font-medium text-gray-500 uppercase tracking-wide mb-8">
                        Trusted by Customers with Policies from
                    </h3>
                    <div className="grid grid-cols-2 MD:grid-cols-4 lg:grid-cols-8 gap-8">
                        {clientLogos.map((logo, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-center p-4 rounded-lg bg-white shadow-soft hover:shadow-card transition-shadow"
                            >
                                <span className="text-xs font-medium text-gray-600 text-center">{logo}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose One Single View?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to simplify your insurance management
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="card group hover:scale-105 transition-transform">
                                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="container text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Simplify Your Insurance Management?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join hundreds of customers managing their policies efficiently
                    </p>
                    <Link href="/signup" className="btn-lg bg-white text-primary-600 hover:bg-gray-50 shadow-xl">
                        Start Your Free Trial
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-6 h-6" />
                                <span className="font-bold text-lg">One Single View</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Comprehensive insurance policy management platform
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">Features</Link></li>
                                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-white">Security</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">About</Link></li>
                                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-white">Terms</Link></li>
                                <li><Link href="#" className="hover:text-white">Compliance</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                        © 2024 One Single View. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
