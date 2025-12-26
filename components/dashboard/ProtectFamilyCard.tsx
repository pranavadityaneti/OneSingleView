'use client';

import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';


interface ProtectFamilyCardProps {
    onGetQuote?: () => void;
}

export default function ProtectFamilyCard({ onGetQuote }: ProtectFamilyCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 h-full overflow-hidden group cursor-pointer relative" onClick={onGetQuote}>
            <img
                src="/images/dashboard/ad-card-main.png"
                alt="Lowest Price Full Protection"
                className="w-full h-full object-cover"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                {/* Optional: Add a button or hint on hover if needed, keeping it clean for now as per image request */}
            </div>
        </div>
    );
}


