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
                        <p className="text-lg font-semibold text-gray-900">{policy.manufacturer} {policy.model}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.vehicle_type}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.fuel_type}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Manufacturing Year</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.manufacturing_year}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Number Plate</p>
                        <p className="text-lg font-semibold text-gray-900">{policy.number_plate_type}</p>
                    </div>
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
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Documents
                </h2>
                <div className="grid gap-3">
                    {policy.rc_docs && policy.rc_docs.map((doc: string, index: number) => (
                        <a
                            key={`rc-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                RC Document {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {policy.previous_policy_docs && policy.previous_policy_docs.map((doc: string, index: number) => (
                        <a
                            key={`prev-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                Previous Policy {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {policy.dl_docs && policy.dl_docs.map((doc: string, index: number) => (
                        <a
                            key={`dl-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                Driving License {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {!policy.rc_docs?.length && !policy.previous_policy_docs?.length && !policy.dl_docs?.length && (
                        <p className="text-gray-500 italic">No documents uploaded</p>
                    )}
                </div>
            </div>
        </div>
    );
}
