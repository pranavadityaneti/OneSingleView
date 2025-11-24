'use client';

import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';


interface ProtectFamilyCardProps {
    onGetQuote?: () => void;
}

export default function ProtectFamilyCard({ onGetQuote }: ProtectFamilyCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
                        Recommended
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">Protect your Family</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Get comprehensive health coverage with cashless claims.
                </p>
            </div>

            <div className="flex items-end justify-between mt-4">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting from</p>
                    <p className="text-lg font-bold text-gray-900">₹500<span className="text-sm text-gray-400 font-medium">/mo</span></p>
                </div>

                <button
                    onClick={onGetQuote}
                    className="flex items-center text-primary-600 text-sm font-bold hover:text-primary-700 transition-colors group-hover:translate-x-1 duration-300"
                >
                    Get a Quote
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
            </div>

            {/* subtle decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-50 rounded-full opacity-50 blur-2xl group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
}
