'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, FileText, Car, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MotorPolicy } from '@/types';

export default function MotorPolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [policy, setPolicy] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data, error } = await supabase
                    .from('motor_policies')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setPolicy(data as MotorPolicy);
            } catch (error) {
                console.error('Error fetching policy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                    <p className="text-gray-500">Policy not found</p>
                    <button
                        onClick={() => router.push('/policies')}
                        className="mt-4 btn btn-primary"
                    >
                        Back to Policies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${policy.status === 'Active' ? 'bg-green-100 text-green-700' :
                    policy.status === 'Expired' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                    }`}>
                    {policy.status}
                </span>
            </div>

            {/* Policy Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-soft">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {policy.policy_number}
                        </h1>
                        <p className="text-gray-600">Motor Insurance Policy</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <Car className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Premium Amount</p>
                        <p className="text-2xl font-bold text-gray-900">₹{policy.premium_amount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Policy Type</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.policy_type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Insurer</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.insurer_name}</p>
                    </div>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Vehicle Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.vehicle_number}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Make & Model</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.vehicle_make} {policy.vehicle_model}</p>
                    </div>
                    {policy.vehicle_variant && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Variant</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.vehicle_variant}</p>
                        </div>
                    )}
                    {policy.year_of_manufacture && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Year of Manufacture</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.year_of_manufacture}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Policy Details */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Policy Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Start Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {new Date(policy.policy_start_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">End Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {new Date(policy.policy_end_date).toLocaleDateString()}
                        </p>
                    </div>
                    {policy.idv && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">IDV (Insured Declared Value)</p>
                            <p className="text-lg font-semibold text-gray-900">₹{policy.idv.toLocaleString()}</p>
                        </div>
                    )}
                    {policy.ncb_percentage !== undefined && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">NCB Percentage</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.ncb_percentage}%</p>
                        </div>
                    )}
                    {policy.addon_covers && (
                        <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                            <p className="text-sm text-gray-600 mb-1">Add-on Covers</p>
                            <p className="text-sm text-gray-900">{policy.addon_covers}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Documents */}
            {policy.document_url && (
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Documents
                    </h2>
                    <a
                        href={policy.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        View Policy Document
                    </a>
                </div>
            )}
        </div>
    );
}
