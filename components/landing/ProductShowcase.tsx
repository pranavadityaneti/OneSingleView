'use client';

import { Shield, Bell, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductShowcase() {
    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    const showcaseVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
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
                        Product Preview
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                        Your Dashboard, Reimagined
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A powerful yet simple interface to manage all your insurance needs
                    </p>
                </motion.div>

                {/* Dashboard Preview Mock */}
                <motion.div
                    className="relative"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={showcaseVariants}
                >
                    <motion.div
                        className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {/* Browser chrome */}
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border border-gray-200 w-64 text-center">
                                    app.onesingleview.com
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {/* Stats Cards */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Active Policies</span>
                                        <Shield className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">7</div>
                                    <div className="text-xs text-green-600 mt-1">All up to date</div>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Upcoming Renewals</span>
                                        <Bell className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">2</div>
                                    <div className="text-xs text-yellow-600 mt-1">Within 30 days</div>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Total Premium</span>
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">₹1.2L</div>
                                    <div className="text-xs text-gray-500 mt-1">This year</div>
                                </div>
                            </div>

                            {/* Policy List Preview */}
                            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Recent Policies</h3>
                                    <span className="text-sm text-blue-600 cursor-pointer">View All</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'HDFC ERGO Motor', type: 'Car Insurance', expiry: 'Mar 2025', status: 'Active' },
                                        { name: 'ICICI Lombard Health', type: 'Family Floater', expiry: 'Jun 2025', status: 'Active' },
                                        { name: 'LIC Term Plan', type: 'Life Insurance', expiry: 'Dec 2034', status: 'Active' },
                                    ].map((policy, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{policy.name}</div>
                                                    <div className="text-xs text-gray-500">{policy.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {policy.status}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {policy.expiry}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Decorative elements */}
                    <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl" />
                    <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-teal-100 rounded-full opacity-50 blur-3xl" />
                </motion.div>
            </div>
        </section>
    );
}
