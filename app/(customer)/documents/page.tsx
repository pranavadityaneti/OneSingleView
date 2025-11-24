'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserMotorPolicies, getUserHealthPolicies, getUserCommercialPolicies, getUserClaims } from '@/lib/db';

interface DocumentItem {
    id: string;
    title: string;
    type: string;
    url: string;
    date: Date;
    source: string; // 'Motor', 'GMC', 'Commercial', 'Claim'
    sourceId: string;
}

export default function DocumentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        const fetchDocuments = async () => {
            if (authLoading) return;
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [motor, gmc, commercial, claims] = await Promise.all([
                    getUserMotorPolicies(user.id),
                    getUserHealthPolicies(user.id),
                    getUserCommercialPolicies(user.id),
                    getUserClaims(user.id)
                ]);

                const docs: DocumentItem[] = [];

                // Process Motor Policies
                motor.forEach(p => {
                    p.rc_docs?.forEach((url, idx) => {
                        docs.push({
                            id: `motor-rc-${p.id}-${idx}`,
                            title: `RC - ${p.vehicle_number}`,
                            type: 'RC',
                            url,
                            date: p.created_at,
                            source: 'Motor',
                            sourceId: p.id
                        });
                    });
                    p.previous_policy_docs?.forEach((url, idx) => {
                        docs.push({
                            id: `motor-prev-${p.id}-${idx}`,
                            title: `Previous Policy - ${p.policy_number}`,
                            type: 'Policy',
                            url,
                            date: p.created_at,
                            source: 'Motor',
                            sourceId: p.id
                        });
                    });
                });

                // Process GMC Policies
                gmc.forEach(p => {
                    p.policy_docs?.forEach((url, idx) => {
                        docs.push({
                            id: `gmc-${p.id}-${idx}`,
                            title: `Policy - ${p.policy_number}`,
                            type: 'Policy',
                            url,
                            date: p.created_at,
                            source: 'GMC',
                            sourceId: p.id
                        });
                    });
                });

                // Process Commercial Policies
                commercial.forEach(p => {
                    p.policy_docs?.forEach((url, idx) => {
                        docs.push({
                            id: `comm-${p.id}-${idx}`,
                            title: `Policy - ${p.policy_number}`,
                            type: 'Policy',
                            url,
                            date: p.created_at,
                            source: 'Commercial',
                            sourceId: p.id
                        });
                    });
                });

                // Process Claims
                claims.forEach(c => {
                    c.supporting_docs?.forEach((url, idx) => {
                        docs.push({
                            id: `claim-${c.id}-${idx}`,
                            title: `Claim Doc - ${c.claim_type}`,
                            type: 'Claim',
                            url,
                            date: c.created_at,
                            source: 'Claim',
                            sourceId: c.id
                        });
                    });
                });

                setDocuments(docs.sort((a, b) => b.date.getTime() - a.date.getTime()));
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [user, authLoading]);

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All' || doc.source === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-gray-500">Access all your insurance related documents in one place</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Add Document
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px]">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-transparent"
                        >
                            <option value="All">All Sources</option>
                            <option value="Motor">Motor Policies</option>
                            <option value="GMC">GMC Policies</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Claim">Claims</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents Found</h3>
                    <p className="text-gray-500">Upload documents when adding policies or claims.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {doc.source}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={doc.title}>
                                {doc.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Added on {doc.date.toLocaleDateString()}
                            </p>

                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group-hover:border-primary-200 group-hover:text-primary-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                View / Download
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
