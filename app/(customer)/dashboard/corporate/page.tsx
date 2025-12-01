'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCompanyGMCPolicy } from '@/lib/db';
import { HealthPolicy } from '@/types';
import CorporateHero from '@/components/corporate/CorporateHero';
import GMCPolicyCard from '@/components/corporate/GMCPolicyCard';
import GMCMembersManager from '@/components/corporate/GMCMembersManager';
import HealthPolicyForm from '@/components/forms/HealthPolicyForm';

export default function CorporateDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gmcPolicy, setGmcPolicy] = useState<HealthPolicy | null>(null);
    const [showPolicyForm, setShowPolicyForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            // Only allow corporate users
            if (currentUser.role !== 'corporate_employee' && currentUser.role !== 'corporate_admin') {
                router.push('/dashboard');
                return;
            }

            setUser(currentUser);

            // Try to fetch company GMC policy
            if (currentUser.company_name) {
                const policy = await getCompanyGMCPolicy(currentUser.company_name);
                setGmcPolicy(policy);
            }
        } catch (error) {
            console.error('Error loading corporate dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartClaim = () => {
        router.push('/claims?action=new');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {user?.role === 'corporate_admin' ? 'Corporate Dashboard' : 'My Benefits'}
                </h1>
                <p className="text-gray-600">
                    {gmcPolicy ? 'Manage your group medical coverage' : 'Get started with your group health insurance'}
                </p>
            </div>

            {/* Main Content */}
            {!gmcPolicy ? (
                /* Show Hero for first-time users */
                <CorporateHero onGetStarted={() => setShowPolicyForm(true)} />
            ) : (
                /* Show GMC Policy Card for returning users */
                <>
                    <GMCPolicyCard
                        policy={gmcPolicy}
                        isAdmin={user?.role === 'corporate_admin'}
                        onStartClaim={handleStartClaim}
                    />

                    {/* Admin-only: Members Management */}
                    {user?.role === 'corporate_admin' && gmcPolicy && (
                        <GMCMembersManager
                            policyId={gmcPolicy.id}
                            companyName={gmcPolicy.company_name || ''}
                        />
                    )}
                </>
            )}

            {/* Policy Form Modal */}
            {showPolicyForm && user && (
                <HealthPolicyForm
                    userId={user.id}
                    onClose={() => setShowPolicyForm(false)}
                    onSuccess={() => {
                        setShowPolicyForm(false);
                        loadData(); // Reload to show the new policy
                    }}
                />
            )}
        </div>
    );
}
