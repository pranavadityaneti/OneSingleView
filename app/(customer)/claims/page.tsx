'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Claim } from '@/types';
import { getUserClaims } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import ClaimForm from '@/components/forms/ClaimForm';

export default function ClaimsPage() {
    const { user } = useAuth();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchClaims = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserClaims(user.uid);
            setClaims(data);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Settled': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Settled': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'Rejected': return <XCircle className="w-4 h-4 mr-1" />;
            case 'In Progress': return <Clock className="w-4 h-4 mr-1" />;
            default: return <AlertCircle className="w-4 h-4 mr-1" />;
        }
    };

    const filteredClaims = claims.filter(claim =>
        claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claim_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
                    <p className="text-gray-500">Track and manage your insurance claims</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Register New Claim
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredClaims.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Claims Found</h3>
                    <p className="text-gray-500 mb-4">You haven't registered any claims yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-600 font-medium hover:text-primary-700"
                    >
                        Register your first claim
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredClaims.map((claim) => (
                        <div key={claim.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                            {getStatusIcon(claim.status)}
                                            {claim.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(claim.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {claim.claim_type}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {claim.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Incident: {new Date(claim.incident_date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>LOB: {claim.lob_type}</span>
                                    </div>
                                </div>
                                {claim.supporting_docs && claim.supporting_docs.length > 0 && (
                                    <div className="flex items-start">
                                        <a
                                            href={claim.supporting_docs[0]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && user && (
                <ClaimForm
                    userId={user.uid}
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchClaims}
                />
            )}
        </div>
    );
}
