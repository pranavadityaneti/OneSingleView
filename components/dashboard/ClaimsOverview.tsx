'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface ClaimsOverviewProps {
    activeCount: number;
    settledCount: number;
    rejectedCount: number;
}

export default function ClaimsOverview({ activeCount, settledCount, rejectedCount }: ClaimsOverviewProps) {
    const total = activeCount + settledCount + rejectedCount;
    const settledPercentage = total > 0 ? Math.round((settledCount / total) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-900 font-bold text-sm">Claims Overview</h3>
                <Link href="/claims" className="text-primary-600 text-xs font-bold hover:underline flex items-center">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-1 shadow-sm text-orange-500">
                        <AlertCircle className="w-3 h-3" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{activeCount}</p>
                    <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wide">In Progress</p>
                </div>

                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-1 shadow-sm text-green-500">
                        <CheckCircle className="w-3 h-3" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{settledCount}</p>
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-wide">Settled</p>
                </div>

                <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-1 shadow-sm text-red-500">
                        <XCircle className="w-3 h-3" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{rejectedCount}</p>
                    <p className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Rejected</p>
                </div>
            </div>

            <div className="mt-2 border-t border-dashed border-gray-200 pt-3 text-center">
                <p className="text-xs text-gray-400 font-medium mb-2">No active claims</p>
                <button className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95">
                    Register a New Claim
                </button>
            </div>
        </div>
    );
}
