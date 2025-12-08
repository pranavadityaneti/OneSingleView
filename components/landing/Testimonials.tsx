'use client';

import { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
    const testimonials = [
        {
            name: 'Rahul Sharma',
            role: 'Business Owner, Mumbai',
            content:
                'OneSingleView has transformed how I manage my family\'s insurance. I used to forget renewals all the time. Now everything is in one place with timely alerts.',
            rating: 5,
            avatar: 'RS',
        },
        {
            name: 'Priya Patel',
            role: 'IT Professional, Bangalore',
            content:
                'The claims tracking feature is a lifesaver. When I had a car accident, the RM guided me through the entire process. Claim was settled in just 10 days!',
            rating: 5,
            avatar: 'PP',
        },
        {
            name: 'Amit Verma',
            role: 'Doctor, Delhi',
            content:
                'Managing health policies for my clinic staff was a nightmare. OneSingleView made it simple. I can see all 20+ policies in one dashboard.',
            rating: 5,
            avatar: 'AV',
        },
    ];

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' as const },
        },
    };

    return (
        <section className="py-16 md:py-24 bg-blue-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={headerVariants}
                >
                    <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        Testimonials
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                        Loved by Thousands of Users
                    </h2>
                </motion.div>

                {/* Testimonials Carousel */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg min-h-[300px]">
                        <Quote className="w-12 h-12 text-blue-200 mb-6" />

                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={current}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
                                    &quot;{testimonials[current].content}&quot;
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {testimonials[current].avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {testimonials[current].name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {testimonials[current].role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {[...Array(testimonials[current].rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <motion.button
                            onClick={prev}
                            className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > current ? 1 : -1);
                                        setCurrent(index);
                                    }}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${current === index ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>

                        <motion.button
                            onClick={next}
                            className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
}
