'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { QuoteRequest } from '@/types';
import { getUserQuoteRequests } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';

export default function QuotesPage() {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchQuotes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserQuoteRequests(user.uid);
            setQuotes(data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Closed': return 'bg-green-100 text-green-800';
            case 'Contacted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
                    <p className="text-gray-500">Get the best insurance rates from our partners</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Request New Quote
                </button>
            </div>

            {/* Quotes List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : quotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Requests Yet</h3>
                    <p className="text-gray-500 mb-4">Request a quote to get started.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-600 font-medium hover:text-primary-700"
                    >
                        Request your first quote
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {quotes.map((quote) => (
                        <div key={quote.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {quote.lob_type} Insurance
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {quote.details}
                                    </p>
                                    {quote.has_better_quote && (
                                        <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Has existing quote
                                        </div>
                                    )}
                                </div>
                                {quote.uploaded_quote && (
                                    <div className="flex items-start">
                                        <a
                                            href={quote.uploaded_quote}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Upload
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && user && (
                <QuoteRequestForm
                    userId={user.uid}
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchQuotes}
                />
            )}
        </div>
    );
}
