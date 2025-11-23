'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Phone, Mail, Calendar } from 'lucide-react';
import { Referral } from '@/types';
import { getUserReferrals } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import ReferralForm from '@/components/forms/ReferralForm';

export default function ReferralsPage() {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchReferrals = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserReferrals(user.id);
            setReferrals(data);
        } catch (error) {
            console.error('Error fetching referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
                    <p className="text-gray-500">Refer friends and family to earn rewards</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Referral
                </button>
            </div>

            {/* Referrals List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : referrals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Referrals Yet</h3>
                    <p className="text-gray-500 mb-4">Start referring friends to see them here.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-600 font-medium hover:text-primary-700"
                    >
                        Add your first referral
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {referrals.map((referral) => (
                        <div key={referral.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                                    {referral.friend_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-gray-400 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(referral.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {referral.friend_name}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    {referral.friend_mobile}
                                </div>
                                {referral.friend_email && (
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {referral.friend_email}
                                    </div>
                                )}
                            </div>

                            {referral.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <p className="text-xs text-gray-500 italic">
                                        "{referral.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showForm && user && (
                <ReferralForm
                    userId={user.id}
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchReferrals}
                />
            )}
        </div>
    );
}
