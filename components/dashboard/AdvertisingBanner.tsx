'use client';

import React from 'react';
import { ArrowRight, Stethoscope } from 'lucide-react';

export default function AdvertisingBanner() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/25 relative overflow-hidden transition-transform hover:-translate-y-1 h-full flex flex-col justify-center">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100 bg-white/10 px-2 py-1 rounded-full">Partner Offer</span>
                </div>

                <h3 className="font-bold text-2xl mb-3 leading-tight">
                    Your imaging exams have never been so uncomplicated.
                </h3>

                <div className="mt-6">
                    <button className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center hover:bg-blue-50 transition-colors shadow-sm">
                        Book Now <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/30 rounded-full blur-2xl -ml-12 -mb-12"></div>

            {/* Abstract lines/dots similar to reference */}
            <svg className="absolute right-0 bottom-0 opacity-20" width="200" height="200" viewBox="0 0 200 200">
                <path d="M0 200 C 50 200 100 150 100 100 C 100 50 150 0 200 0" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            </svg>
        </div>
    );
}
