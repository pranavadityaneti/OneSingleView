'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
    const benefits = [
        'Free forever for up to 5 policies',
        'No credit card required',
        'Set up in under 2 minutes',
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' as const },
        },
    };

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-30 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-700 rounded-full opacity-30 blur-3xl" />
            </div>

            <motion.div
                className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
            >
                <motion.h2
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                    variants={itemVariants}
                >
                    Ready to Simplify Your Insurance?
                </motion.h2>
                <motion.p
                    className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
                    variants={itemVariants}
                >
                    Join thousands of Indians who have taken control of their insurance portfolio.
                    Start managing all your policies in one place today.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    className="flex flex-col items-center gap-6"
                    variants={itemVariants}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            href="/signup"
                            className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center"
                        >
                            Get Started for Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Benefits list */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/90 text-sm">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
