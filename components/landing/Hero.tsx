'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
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

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
                delay: 0.4,
            },
        },
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Eyebrow */}
                    <motion.div
                        className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6"
                        variants={itemVariants}
                    >
                        <span className="text-blue-700 text-sm font-medium">
                            India&apos;s Policy Management Platform
                        </span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
                        variants={itemVariants}
                    >
                        All Your Insurance Policies,{' '}
                        <span className="text-blue-600">One Single View</span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
                        variants={itemVariants}
                    >
                        Track, manage, and never miss a renewal. From motor to health to life
                        — simplify your entire insurance journey in one powerful dashboard.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                        variants={itemVariants}
                    >
                        <Link
                            href="/signup"
                            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-200 flex items-center hover:scale-105"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#benefits"
                            className="text-gray-700 hover:text-blue-600 px-8 py-4 font-semibold text-lg transition-colors border-2 border-gray-200 hover:border-blue-200 rounded-full hover:scale-105"
                        >
                            See How It Works
                        </a>
                    </motion.div>

                    {/* Hero Illustration */}
                    <motion.div
                        className="relative max-w-3xl mx-auto"
                        variants={imageVariants}
                    >
                        <Image
                            src="/images/hero-illustration.png"
                            alt="Family protected by insurance - managing policies on digital devices"
                            width={800}
                            height={600}
                            className="w-full h-auto"
                            priority
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
