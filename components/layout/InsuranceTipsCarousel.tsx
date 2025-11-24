'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, Shield, Heart, Car, Plane, Building2, Users } from 'lucide-react';

const insuranceTips = [
    {
        icon: Car,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        title: 'Motor Insurance Tip',
        tip: 'Always compare NCB (No Claim Bonus) before renewal. You can save up to 50% on premiums!'
    },
    {
        icon: Heart,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        title: 'Health Insurance Tip',
        tip: 'Opt for family floater plans for better coverage at lower premiums. Sum insured of ₹10L+ recommended.'
    },
    {
        icon: Shield,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        title: 'Coverage Advisory',
        tip: 'Read policy exclusions carefully! Pre-existing diseases often have 2-4 year waiting periods.'
    },
    {
        icon: Plane,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        title: 'Travel Insurance Tip',
        tip: 'Buy travel insurance at least 7 days before departure for maximum coverage including trip cancellation.'
    },
    {
        icon: Users,
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50',
        iconColor: 'text-pink-600',
        title: 'Life Insurance Tip',
        tip: 'Term insurance gives maximum coverage at lowest cost. Buy early for better premiums!'
    },
    {
        icon: Building2,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
        title: 'Claim Smart',
        tip: 'Inform insurer within 24 hours of incident. Keep all bills & reports for smooth claim settlement.'
    },
    {
        icon: Lightbulb,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        title: 'Document Smart',
        tip: 'Keep digital copies of all policies in cloud storage. Quick access during emergencies saves time!'
    },
    {
        icon: Shield,
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-50',
        iconColor: 'text-teal-600',
        title: 'Renewal Reminder',
        tip: 'Set policy renewal alerts 30 days early. Avoid late fees & coverage gaps with timely renewals.'
    },
    {
        icon: Heart,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        title: 'Add-on Benefits',
        tip: 'Zero depreciation, roadside assistance & consumables cover are valuable add-ons for motors.'
    },
    {
        icon: Lightbulb,
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
        title: 'Pro Tip',
        tip: 'Compare quotes from 3+ insurers before buying. Your RM can help you find the best deal!'
    }
];

export default function InsuranceTipsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTip = () => {
        setCurrentIndex((prev) => (prev + 1) % insuranceTips.length);
    };

    const prevTip = () => {
        setCurrentIndex((prev) => (prev - 1 + insuranceTips.length) % insuranceTips.length);
    };

    const currentTip = insuranceTips[currentIndex];
    const Icon = currentTip.icon;

    return (
        <div className="px-4 py-3 pb-6">
            <div className={`relative ${currentTip.bgColor} rounded-xl p-5 border border-gray-100 overflow-hidden group min-h-[180px] flex flex-col`}>
                {/* Background gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentTip.color} opacity-10 rounded-full -mr-10 -mt-10`} />

                {/* Content */}
                <div className="relative flex-1 flex flex-col">
                    {/* Icon and Progress */}
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 bg-white rounded-lg shadow-sm`}>
                            <Icon className={`w-6 h-6 ${currentTip.iconColor}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            {insuranceTips.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-5 bg-gray-400' : 'w-1.5 bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className={`text-sm font-bold ${currentTip.iconColor} mb-3`}>
                        {currentTip.title}
                    </h4>

                    {/* Tip Text */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">
                        {currentTip.tip}
                    </p>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-auto">
                        <button
                            onClick={prevTip}
                            className="p-1.5 hover:bg-white rounded-full transition-colors"
                            aria-label="Previous tip"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                            {currentIndex + 1} / {insuranceTips.length}
                        </span>
                        <button
                            onClick={nextTip}
                            className="p-1.5 hover:bg-white rounded-full transition-colors"
                            aria-label="Next tip"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
