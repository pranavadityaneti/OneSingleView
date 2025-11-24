'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Search,
    RefreshCw,
    Copy,
    ExternalLink,
    CheckCircle
} from 'lucide-react';
import {
    getAllMotorPolicies,
    getAllHealthPolicies,
    getAllCommercialPolicies
} from '@/lib/db';
import Link from 'next/link';

export default function DuplicatesPage() {
    const [loading, setLoading] = useState(true);
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [lastScanned, setLastScanned] = useState<Date | null>(null);

    useEffect(() => {
        scanForDuplicates();
    }, []);

    const scanForDuplicates = async () => {
        setLoading(true);
        try {
            const [motor, health, commercial] = await Promise.all([
                getAllMotorPolicies(),
                getAllHealthPolicies(),
                getAllCommercialPolicies()
            ]);

            // Filter for duplicates by policy number across all policy types
            const policyNumbers = new Map();
            const duplicateGroups = [];

            const allPolicies = [
                ...motor.map((p: any) => ({ ...p, type: 'Motor', key: p.policy_number })),
                ...health.map((p: any) => ({ ...p, type: 'Health', key: p.policy_number })),
                ...commercial.map((p: any) => ({ ...p, type: 'Commercial', key: p.policy_number }))
            ];

            const lookup: Record<string, any[]> = {};
            const dups: any[] = [];

            allPolicies.forEach(p => {
                if (!p.key) return;
                if (!lookup[p.key]) lookup[p.key] = [];
                lookup[p.key].push(p);
            });

            Object.values(lookup).forEach(group => {
                if (group.length > 1) {
                    dups.push({
                        key: group[0].key,
                        count: group.length,
                        items: group
                    });
                }
            });

            setDuplicates(dups);
            setLastScanned(new Date());
        } catch (error) {
            console.error('Failed to scan for duplicates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Duplicate Detection</h1>
                    <p className="text-gray-500">Identify and resolve duplicate policy entries</p>
                </div>
                <button
                    onClick={scanForDuplicates}
                    className="btn btn-secondary flex items-center"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Scan Now
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card bg-white p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <Copy className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Potential Duplicates</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{duplicates.length}</p>
                </div>
                <div className="card bg-white p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Last Scanned</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                        {lastScanned ? lastScanned.toLocaleTimeString() : 'Never'}
                    </p>
                </div>
            </div>

            {/* Duplicates List */}
            <div className="space-y-4">
                {duplicates.map((dup, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                        <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-red-800 font-medium">
                                <AlertTriangle className="w-4 h-4" />
                                Duplicate Policy Number: <span className="font-mono font-bold">{dup.key}</span>
                            </div>
                            <span className="text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-600 font-bold">
                                {dup.count} Matches
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4">
                                {dup.items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.type}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-sm font-medium text-gray-900">{item.insurer_name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                User: <Link href={`/admin/users/${item.user_id}`} className="text-primary-600 hover:underline">{item.user_name || 'Unknown'}</Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right text-xs text-gray-500">
                                                <p>Created: {new Date(item.created_at).toLocaleDateString()}</p>
                                                <p>ID: {item.id.slice(0, 8)}...</p>
                                            </div>
                                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {duplicates.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No Duplicates Found</h3>
                        <p className="text-gray-500">Your database appears to be clean!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
