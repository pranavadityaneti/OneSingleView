'use client';

import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';


interface ProtectFamilyCardProps {
    onGetQuote?: () => void;
}

export default function ProtectFamilyCard({ onGetQuote }: ProtectFamilyCardProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-card border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                        <Shield className="w-4 h-4" />
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                        Recommended
                    </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5">Protect your Family</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Get comprehensive health coverage with cashless claims.
                </p>
            </div>

            <div className="flex items-end justify-between mt-3">
                <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting from</p>
                    <p className="text-base font-bold text-gray-900">₹500<span className="text-xs text-gray-400 font-medium">/mo</span></p>
                </div>

                <button
                    onClick={onGetQuote}
                    className="flex items-center text-primary-600 text-xs font-bold hover:text-primary-700 transition-colors group-hover:translate-x-1 duration-300"
                >
                    Get a Quote
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
            </div>

            {/* subtle decoration */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-red-50 rounded-full opacity-50 blur-2xl group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
}
