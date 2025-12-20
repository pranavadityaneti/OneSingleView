'use client';

import React from 'react';
import { Phone, Mail, MessageCircle, User } from 'lucide-react';

export default function RelationshipManagerHeader() {
    const rm = {
        name: "Naveen Venigalla",
        role: "Your Dedicated Advisor",
        phone: "+91 70754 22949",
        email: "naveen@onesingleview.com"
    };

    return (
        <div className="hidden lg:flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-soft border border-gray-100 mr-2">
            <div className="flex items-center gap-3 border-r border-gray-100 pr-4">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-600/20">
                    <User className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 leading-none">Your Advisor</p>
                    <p className="text-[10px] font-medium text-primary-600 mt-0.5">Priority Support</p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <a
                    href={`tel:${rm.phone}`}
                    title="Call Relationship Manager"
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                >
                    <Phone className="w-4 h-4" />
                </a>
                <a
                    href={`https://wa.me/${rm.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat on WhatsApp"
                    className="p-2 text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded-lg transition-all"
                >
                    <MessageCircle className="w-4 h-4" />
                </a>
                <a
                    href={`mailto:${rm.email}`}
                    title="Email Relationship Manager"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                    <Mail className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
