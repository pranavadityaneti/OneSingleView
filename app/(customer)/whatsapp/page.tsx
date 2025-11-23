'use client';

import React from 'react';
import { MessageCircle, Phone, Mail, ArrowRight } from 'lucide-react';

export default function WhatsAppPage() {
    const handleWhatsAppClick = () => {
        // Replace with actual WhatsApp number
        window.open('https://wa.me/919876543210', '_blank');
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect with Us</h1>
                <p className="text-gray-500 text-lg">
                    Get instant support and updates directly on WhatsApp
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-green-500 p-8 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <MessageCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Chat on WhatsApp</h2>
                    <p className="text-green-100">
                        Available 24/7 for claims and policy support
                    </p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 font-bold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Instant Policy Copies</h3>
                                <p className="text-gray-500 text-sm">Get your policy documents instantly via chat</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 font-bold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Claim Assistance</h3>
                                <p className="text-gray-500 text-sm">Register and track claims with simple messages</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 font-bold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Renewal Reminders</h3>
                                <p className="text-gray-500 text-sm">Never miss a renewal with timely alerts</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleWhatsAppClick}
                        className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 flex items-center justify-center"
                    >
                        <MessageCircle className="w-6 h-6 mr-2" />
                        Start Chatting Now
                        <ArrowRight className="w-5 h-5 ml-2 opacity-80" />
                    </button>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Phone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Call Support</h3>
                    <p className="text-sm text-gray-500">+91 98765 43210</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Mail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p className="text-sm text-gray-500">support@onesingleview.com</p>
                </div>
            </div>
        </div>
    );
}
