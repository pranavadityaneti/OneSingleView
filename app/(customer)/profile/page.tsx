'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User, UserPreferences } from '@/types';
import { getUserPreferences, updateUserPreferences } from '@/lib/db';

import { User as UserIcon, Mail, Phone, MapPin, Shield, Lock, Bell, Edit2 } from 'lucide-react';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import TwoFactorSetup from '@/components/profile/TwoFactorSetup';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');

    // Modals state
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                // Load preferences independently so it doesn't block profile loading
                if (currentUser) {
                    try {
                        const userPrefs = await getUserPreferences(currentUser.id);
                        setPreferences(userPrefs);
                    } catch (prefError) {
                        console.error('Error loading preferences:', prefError);
                        // Set defaults if loading fails (e.g. table doesn't exist yet)
                        setPreferences({
                            id: 'temp-id', // Temporary ID until saved
                            user_id: currentUser.id,
                            email_notifications: true,
                            sms_notifications: true,
                            whatsapp_notifications: true,
                            marketing_emails: false,
                            policy_expiry_alerts: true,
                            claim_updates: true,
                            created_at: new Date(),
                            updated_at: new Date()
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
        if (!user || !preferences) return;

        try {
            const updated = await updateUserPreferences(user.id, { [key]: value });
            setPreferences(updated);
        } catch (error) {
            console.error('Error updating preference:', error);
        }
    };

    const handleProfileUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Please log in to view your profile.</div>;
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: UserIcon },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'preferences', label: 'Preferences', icon: Bell },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                            <p className="text-gray-500">{user.email}</p>
                                            <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md capitalize">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{user.email}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{user.mobile || 'Not provided'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                                        <span className="text-gray-900">{user.company_name || 'Not provided'}</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Customer ID</label>
                                        <span className="text-gray-900 font-mono text-sm">{user.customer_id || 'N/A'}</span>
                                    </div>
                                </div>

                                {user.address && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                                        <div className="flex items-start gap-2 text-gray-900">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                            <span>{user.address}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Password</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Keep your account secure by using a strong password.
                                    </p>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="btn-secondary"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <TwoFactorSetup userId={user.id} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && preferences && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                                <p className="text-xs text-gray-500">Receive policy updates via email</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.email_notifications}
                                                onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                                                <p className="text-xs text-gray-500">Receive policy updates via SMS</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.sms_notifications}
                                                onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Policy Expiry Alerts</p>
                                                <p className="text-xs text-gray-500">Get notified when policies are expiring</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.policy_expiry_alerts}
                                                onChange={(e) => handlePreferenceChange('policy_expiry_alerts', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Claim Updates</p>
                                                <p className="text-xs text-gray-500">Receive updates on your claims status</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={preferences.claim_updates}
                                                onChange={(e) => handlePreferenceChange('claim_updates', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onSuccess={handleProfileUpdate}
            />

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    alert('Password changed successfully! Please log in again.');
                }}
            />
        </div>
    );
}
