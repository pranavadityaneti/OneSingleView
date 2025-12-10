'use client';

import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';


interface ProtectFamilyCardProps {
    onGetQuote?: () => void;
}

export default function ProtectFamilyCard({ onGetQuote }: ProtectFamilyCardProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-card border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group">
            {/* Top section */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <Shield className="w-4.5 h-4.5" />
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                        Recommended
                    </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">Protect your Family</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Get comprehensive health coverage with cashless claims.
                </p>
            </div>

            {/* Bottom section */}
            <div className="flex items-end justify-between mt-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting from</p>
                    <p className="text-lg font-bold text-gray-900">₹500<span className="text-xs text-gray-400 font-medium">/mo</span></p>
                </div>

                <button
                    onClick={onGetQuote}
                    className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    Get Quote
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* subtle decoration */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-red-50 rounded-full opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
}


