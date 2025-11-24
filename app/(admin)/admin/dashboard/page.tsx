'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
    getAdminDashboardMetrics,
    getExpiringPoliciesAdmin,
    getRecentActivity,
    getPoliciesByLOB,
    getDuplicateAlerts,
    getDocumentVerificationPending,
    getRMPerformance,
    AdminMetrics,
    ExpiryOverview,
    ActivityLog
} from '@/lib/admin-db';

import KPIGrid from '@/components/admin/dashboard/KPIGrid';
import ExpiringPoliciesWidget from '@/components/admin/dashboard/ExpiringPoliciesWidget';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import LOBChart from '@/components/admin/dashboard/LOBChart';
import OperationalWidgets from '@/components/admin/dashboard/OperationalWidgets';
import { AlertTriangle, Users, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [expiryData, setExpiryData] = useState<ExpiryOverview | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [lobData, setLobData] = useState<any[]>([]);
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [docPending, setDocPending] = useState<any[]>([]);
    const [rmPerformance, setRmPerformance] = useState<any>(null);

    useEffect(() => {
        console.log('[AdminDashboard] useEffect triggered', { loading, user: user?.role });
        if (!loading && (!user || user.role !== 'admin')) {
            console.log('[AdminDashboard] Redirecting to login');
            router.push('/login');
        } else if (user?.role === 'admin') {
            console.log('[AdminDashboard] Loading data...');
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]);

    const loadData = async () => {
        try {
            const [metricsData, expiry, activity, lob, dups, docs, rm] = await Promise.all([
                getAdminDashboardMetrics(),
                getExpiringPoliciesAdmin(),
                getRecentActivity(),
                getPoliciesByLOB(),
                getDuplicateAlerts(),
                getDocumentVerificationPending(),
                getRMPerformance()
            ]);

            setMetrics(metricsData);
            setExpiryData(expiry);
            setActivities(activity);
            setLobData(lob);
            setDuplicates(dups);
            setDocPending(docs);
            setRmPerformance(rm);
        } catch (error) {
            console.error('Failed to load admin dashboard:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (loading || isLoadingData || !metrics || !expiryData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleRefresh = async () => {
        setIsLoadingData(true);
        await loadData();
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
                    <p className="text-sm text-gray-500">System Overview & Health</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 1. KPI Cards */}
            <KPIGrid metrics={metrics} />

            {/* 2. Main Grid: Expiry & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExpiringPoliciesWidget data={expiryData} />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed activities={activities} />
                </div>
            </div>

            {/* 3. Charts & Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <LOBChart data={lobData} />
                </div>
                <div className="lg:col-span-2">
                    <OperationalWidgets metrics={metrics} docVerificationData={docPending} />
                </div>
            </div>

            {/* 4. Alerts & RM Performance (Row 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duplicate Alerts */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">Duplicate Detection</h3>
                        {duplicates.length > 0 ? (
                            <>
                                <p className="text-sm text-red-700 mb-2">{duplicates.length} possible duplicate policies detected.</p>
                                <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors">
                                    Review Duplicates
                                </button>
                            </>
                        ) : (
                            <p className="text-sm text-red-700">No duplicates detected. System healthy.</p>
                        )}
                    </div>
                </div>

                {/* RM Performance Snapshot */}
                {rmPerformance && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                RM Performance
                            </h3>
                            <span className="text-xs text-gray-500">Top Performer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                                {rmPerformance.topPerformer.initials}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{rmPerformance.topPerformer.name}</p>
                                <p className="text-xs text-gray-500">
                                    {rmPerformance.topPerformer.policies} Policies • {rmPerformance.topPerformer.claims} Claims
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

