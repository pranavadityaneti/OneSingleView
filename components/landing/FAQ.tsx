'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
    const faqs = [
        {
            question: 'How does 1SingleView connect to my existing policies?',
            answer:
                'You can easily add your policies by uploading policy documents or entering basic details. Our system extracts key information automatically. You can also connect with your insurer if they support digital policy sync.',
        },
        {
            question: 'Is my data secure with 1SingleView?',
            answer:
                'Absolutely. We use bank-grade encryption (AES-256) to protect your data. Your documents are stored securely in the cloud with multi-factor authentication. We never share your data with third parties without your consent.',
        },
        {
            question: 'Can I add policies for my family members?',
            answer:
                'Yes! You can add and manage policies for your entire family under one account. Each family member can have their own profile with their respective policies, making it easy to track everyone\'s coverage.',
        },
        {
            question: 'How do renewal reminders work?',
            answer:
                'We send you reminders via email, SMS, and WhatsApp (based on your preference) at 30 days, 15 days, and 7 days before policy expiry. You can customize these reminder schedules from your account settings.',
        },
        {
            question: 'Do you help with claim filing?',
            answer:
                'Yes! Our dedicated relationship managers assist you throughout the claim process. You can register a claim through the app, upload required documents, and track the claim status in real-time.',
        },
        {
            question: 'Is 1SingleView free to use?',
            answer:
                'Yes! 1SingleView is completely free to use. Manage all your policies with full features including dedicated RM support and priority claims assistance.',
        },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' as const },
        },
    };

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
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <section id="faq" className="py-16 md:py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={headerVariants}
                >
                    <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600">
                        Got questions? We&apos;ve got answers.
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                            variants={itemVariants}
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 pr-4">
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className={`w-5 h-5 flex-shrink-0 ${openIndex === index ? 'text-blue-600' : 'text-gray-400'}`} />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 md:px-6 pb-5 md:pb-6">
                                            <p className="text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
