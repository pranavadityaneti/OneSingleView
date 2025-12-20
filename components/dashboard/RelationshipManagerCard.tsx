'use client';

import React from 'react';
import { Phone, Mail, MessageCircle, User } from 'lucide-react';

// Interface props might not be needed if we hardcode or fetch generic info, 
// but keeping for compatibility if passed from parent
interface RelationshipManagerCardProps {
    name?: string;
    phone?: string;
    email?: string;
}

export default function RelationshipManagerCard({ name, phone, email }: RelationshipManagerCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-primary-50 rounded-lg">
                        <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Support</h3>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-4 mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-600/20">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-base text-gray-900">Your Advisor</p>
                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Dedicated Support
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-5">
                <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2.5 rounded-xl">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium text-sm">{phone}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2.5 rounded-xl">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium text-sm truncate">{email}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center px-4 py-2 border border-primary-200 text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-50 transition-all"
                >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                </a>
                <a
                    href={`https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20 transition-all hover:-translate-y-0.5"
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                </a>
            </div>
        </div>
    );
}
