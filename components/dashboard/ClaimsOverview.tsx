'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface ClaimsOverviewProps {
    activeCount: number;
    settledCount: number;
    rejectedCount: number;
}

export default function ClaimsOverview({ activeCount, settledCount, rejectedCount }: ClaimsOverviewProps) {
    const total = activeCount + settledCount + rejectedCount;
    const settledPercentage = total > 0 ? Math.round((settledCount / total) * 100) : 0;
    const successRate = total > 0 ? Math.round(((settledCount) / (settledCount + rejectedCount || 1)) * 100) : 100;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-bold text-sm">Claims Overview</h3>
                <Link href="/claims" className="text-primary-600 text-xs font-bold hover:underline flex items-center">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="bg-orange-50 rounded-xl p-6 text-center border border-orange-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-orange-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{activeCount}</p>
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">In Progress</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-green-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{settledCount}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Settled</p>
                </div>

                <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100">
                    <div className="w-6 h-6 mx-auto bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-red-500">
                        <XCircle className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{rejectedCount}</p>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Rejected</p>
                </div>
            </div>

            {/* Success Rate Progress Bar - NEW */}
            <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-gray-700">Success Rate</span>
                    </div>
                    <span className={`text-sm font-bold ${successRate >= 70 ? 'text-green-600' : successRate >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                        {successRate}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${successRate >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            successRate >= 40 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                        style={{ width: `${successRate}%` }}
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                    {total === 0 ? 'No claims filed yet' : `Based on ${settledCount + rejectedCount} resolved claims`}
                </p>
            </div>

            {/* Register New Claim Button */}
            <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
                <Link href="/claims?action=new" className="block w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95 text-center">
                    Register a New Claim
                </Link>
            </div>
        </div>
    );
}

