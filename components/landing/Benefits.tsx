'use client';

import {
    LayoutDashboard,
    BellRing,
    HeadphonesIcon,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Benefits() {
    const benefits = [
        {
            eyebrow: 'UNIFIED VIEW',
            title: 'All Your Policies in One Place',
            description:
                'No more switching between insurer portals. Motor, health, life, travel — view and manage every policy from a single, intuitive dashboard.',
            features: [
                'Connect policies from 50+ insurers',
                'Instant policy sync and updates',
                'Family member policies included',
            ],
            icon: LayoutDashboard,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            reversed: false,
        },
        {
            eyebrow: 'SMART ALERTS',
            title: 'Never Miss a Renewal Again',
            description:
                'Get timely notifications via email, SMS, or WhatsApp before your policies expire. Set custom reminder schedules that work for you.',
            features: [
                '30, 15, and 7-day advance alerts',
                'WhatsApp and email notifications',
                'Custom renewal reminders',
            ],
            icon: BellRing,
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            reversed: true,
        },
        {
            eyebrow: 'DEDICATED SUPPORT',
            title: 'Hassle-Free Claims Experience',
            description:
                'When you need to file a claim, our dedicated relationship managers guide you through every step. Track claim status in real-time.',
            features: [
                'Personal RM for claims assistance',
                'Real-time claim status tracking',
                'Document upload and management',
            ],
            icon: HeadphonesIcon,
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            reversed: false,
        },
    ];

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    const getSlideVariants = (reversed: boolean) => ({
        hidden: { opacity: 0, x: reversed ? 50 : -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    });

    const getImageVariants = (reversed: boolean) => ({
        hidden: { opacity: 0, x: reversed ? -50 : 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 },
        },
    });

    return (
        <section id="benefits" className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={headerVariants}
                >
                    <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        Why OneSingleView
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                        Simplify Your Insurance Journey
                    </h2>
                </motion.div>

                {/* Benefits List */}
                <div className="space-y-16 md:space-y-24">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`flex flex-col ${benefit.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                                } items-center gap-8 lg:gap-16`}
                        >
                            {/* Visual Side */}
                            <motion.div
                                className="flex-1 w-full"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                                variants={getImageVariants(benefit.reversed)}
                            >
                                <div className={`${benefit.iconBg} rounded-3xl p-8 md:p-12 relative overflow-hidden`}>
                                    <div className="relative z-10 flex items-center justify-center">
                                        <motion.div
                                            className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center"
                                            whileHover={{ scale: 1.05, rotate: 2 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <benefit.icon className={`w-16 h-16 md:w-20 md:h-20 ${benefit.iconColor}`} />
                                        </motion.div>
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full" />
                                    <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/20 rounded-full" />
                                    <div className="absolute top-1/2 right-4 w-6 h-6 bg-white/25 rounded-full" />
                                </div>
                            </motion.div>

                            {/* Content Side */}
                            <motion.div
                                className="flex-1"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                                variants={getSlideVariants(benefit.reversed)}
                            >
                                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                                    {benefit.eyebrow}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-4">
                                    {benefit.title}
                                </h3>
                                <p className="text-lg text-gray-600 mb-6">
                                    {benefit.description}
                                </p>
                                <ul className="space-y-3">
                                    {benefit.features.map((feature, idx) => (
                                        <motion.li
                                            key={idx}
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.2 + idx * 0.1 }}
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
