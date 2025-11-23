'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { User as UserIcon, Mail, Phone, Shield, Lock, MapPin, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Mock user for development
        const mockUser: User = {
            uid: 'mock-user-id',
            email: 'pranav.n@ideaye.in',
            name: 'Pranav N',
            mobile: '+91 9959777027',
            role: 'individual',
            created_at: new Date(),
            updated_at: new Date(),
        };
        setUser(mockUser);
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Identity Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500 capitalize mb-2">{user.role} Account</p>
                        {user.customer_id && (
                            <p className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block mb-4">
                                ID: {user.customer_id}
                            </p>
                        )}

                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium block mx-auto w-fit">
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            KYC Verified
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Settings */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                    <div className="p-2.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-200">
                                        {user.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                                    <div className="flex items-center p-2.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-200">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {user.mobile}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                    <div className="flex items-center p-2.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-200">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Management (Placeholder) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                                Saved Addresses
                            </h3>
                            <button className="text-sm text-primary-600 font-medium hover:underline">
                                + Add New
                            </button>
                        </div>
                        <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-500 text-sm">
                            No addresses saved yet.
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-primary-600" />
                            Security
                        </h3>
                        <button className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <Lock className="w-5 h-5 mr-3 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Change Password</span>
                            </div>
                            <span className="text-xs text-gray-400">Last changed 30 days ago</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
