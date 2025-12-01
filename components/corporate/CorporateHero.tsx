'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface CorporateHeroProps {
    onGetStarted: () => void;
}

export default function CorporateHero({ onGetStarted }: CorporateHeroProps) {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 md:p-12 shadow-soft border border-gray-100">
            <div className="max-w-4xl mx-auto text-center">
                {/* Hero Text */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Health insurance that works.
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 mb-8">
                    For you and your team.
                </p>

                {/* Simplified Illustration */}
                <div className="mb-8 flex justify-center items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">👨‍💼</span>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">👩‍💼</span>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">👩‍⚕️</span>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onGetStarted}
                    className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Get Started with GMC
                </button>

                {/* Benefits */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                    <div className="text-center">
                        <div className="text-2xl mb-2">🏥</div>
                        <p className="text-sm font-semibold text-gray-900">Your own team</p>
                        <p className="text-xs text-gray-600">Dedicated concierge</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">⚕️</div>
                        <p className="text-sm font-semibold text-gray-900">Quality doctors</p>
                        <p className="text-xs text-gray-600">Network of hospitals</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">📞</div>
                        <p className="text-sm font-semibold text-gray-900">Doctor on Call</p>
                        <p className="text-xs text-gray-600">24/7 support</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">📱</div>
                        <p className="text-sm font-semibold text-gray-900">All in our app</p>
                        <p className="text-xs text-gray-600">Easy to use</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
