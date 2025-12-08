'use client';

import { FileCheck, Users, Shield } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Extract numeric value
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    const suffix = value.replace(/[0-9,]/g, '');

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Easing function for smooth end
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * numericValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, numericValue, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}

export default function TrustBar() {
    const stats = [
        {
            icon: FileCheck,
            value: '10,000+',
            label: 'Policies Managed',
        },
        {
            icon: Users,
            value: '5,000+',
            label: 'Happy Users',
        },
        {
            icon: Shield,
            value: '50+',
            label: 'Insurance Partners',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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

    return (
        <section className="py-8 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center justify-center gap-4 p-4"
                            variants={itemVariants}
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    <AnimatedCounter value={stat.value} />
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
