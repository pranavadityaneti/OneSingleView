'use client';

import {
    LayoutDashboard,
    Bell,
    ClipboardCheck,
    FolderOpen,
    HeadphonesIcon,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features() {
    const features = [
        {
            icon: LayoutDashboard,
            title: 'Unified Dashboard',
            description: 'All your policies from multiple insurers in one beautiful view',
        },
        {
            icon: Bell,
            title: 'Expiry Alerts',
            description: 'Timely reminders before your policies expire, never miss a renewal',
        },
        {
            icon: ClipboardCheck,
            title: 'Claims Tracking',
            description: 'Register and track claims with real-time status updates',
        },
        {
            icon: FolderOpen,
            title: 'Document Storage',
            description: 'Securely store all policy documents, RCs, and receipts',
        },
        {
            icon: HeadphonesIcon,
            title: 'RM Support',
            description: 'Dedicated relationship manager for personalized assistance',
        },
        {
            icon: Lock,
            title: 'Secure & Compliant',
            description: 'Enterprise-grade security with encrypted data storage',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section id="features" className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={headerVariants}
                >
                    <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        Features
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                        Everything You Need to Manage Insurance
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Powerful features designed to simplify your insurance management across all policy types
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
                            variants={itemVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
