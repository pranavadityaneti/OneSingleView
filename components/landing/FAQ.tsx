'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            question: 'How does OneSingleView connect to my existing policies?',
            answer:
                'You can easily add your policies by uploading policy documents or entering basic details. Our system extracts key information automatically. You can also connect with your insurer if they support digital policy sync.',
        },
        {
            question: 'Is my data secure with OneSingleView?',
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
            question: 'Is OneSingleView free to use?',
            answer:
                'We offer a free plan that lets you manage up to 5 policies with basic features. For unlimited policies and premium features like dedicated RM support and priority claims assistance, check our pricing plans.',
        },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-16 md:py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600">
                        Got questions? We&apos;ve got answers.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 pr-4">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="px-5 md:px-6 pb-5 md:pb-6">
                                    <p className="text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
