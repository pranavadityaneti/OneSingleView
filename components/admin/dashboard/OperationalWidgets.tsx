import React from 'react';
import { Shield, MessageSquare, FileCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AdminMetrics } from '@/lib/admin-db';

interface OperationalWidgetsProps {
    metrics: AdminMetrics;
    docVerificationData: any[];
}

export default function OperationalWidgets({ metrics, docVerificationData }: OperationalWidgetsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Claims Overview */}
            <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Claims Overview
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                    <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center">
                        <p className="text-xs text-gray-500">New</p>
                        <p className="text-xl font-bold text-gray-900">{metrics.claims.pending}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg flex flex-col justify-center">
                        <p className="text-xs text-green-600">Settled</p>
                        <p className="text-xl font-bold text-green-700">{metrics.claims.settled}</p>
                    </div>
                </div>
                <div className="space-y-3 mt-auto">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Recent Actionables</p>
                    {/* Mock List - in real app would come from props too */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">CLM-2024-001</span>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">In Review</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">CLM-2024-002</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">New</span>
                    </div>
                </div>
            </div>

            {/* Quote Requests */}
            <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Quote Pipeline
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                    <div className="bg-blue-50 p-3 rounded-lg flex flex-col justify-center">
                        <p className="text-xs text-blue-600">New Requests</p>
                        <p className="text-xl font-bold text-blue-700">{metrics.quotes.pending}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center">
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="text-xl font-bold text-gray-900">{metrics.quotes.completed}</p>
                    </div>
                </div>
                <button className="w-full py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors mt-auto">
                    View All Requests
                </button>
            </div>

            {/* Document Verification */}
            <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-purple-600" />
                        Doc Verification
                    </h3>
                    {docVerificationData.length > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                            {docVerificationData.length} Pending
                        </span>
                    )}
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] scrollbar-hide">
                    {docVerificationData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500">No pending verifications</p>
                        </div>
                    ) : (
                        docVerificationData.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{doc.customerName}</p>
                                    <p className="text-xs text-gray-500">{doc.docType} • {doc.lob}</p>
                                </div>
                                <button className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">
                                    Verify
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
