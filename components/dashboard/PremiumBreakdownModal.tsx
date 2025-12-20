'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PremiumBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyType: 'Motor' | 'Health' | 'Commercial' | 'Travel' | 'Life' | 'Cyber';
    policies: any[];
    userRole?: string;
}

export default function PremiumBreakdownModal({
    isOpen,
    onClose,
    policyType,
    policies,
    userRole
}: PremiumBreakdownModalProps) {
    const isCorporate = userRole === 'corporate_employee' || userRole === 'corporate_admin';

    // Get unique companies from policies
    const companies = useMemo(() => {
        if (!isCorporate) return [];
        const uniqueCompanies = [...new Set(policies
            .map(p => p.company_name)
            .filter(Boolean)
        )];
        return uniqueCompanies;
    }, [policies, isCorporate]);

    const [selectedCompany, setSelectedCompany] = useState<string>('all');

    if (!isOpen) return null;

    // Filter policies by selected company AND exclude Expired policies (case-insensitive)
    const filteredPolicies = (selectedCompany === 'all'
        ? policies
        : policies.filter(p => p.company_name === selectedCompany)
    ).filter(p => p.status?.toLowerCase() !== 'expired');

    // Calculate breakdown based on policy type
    const getBreakdown = () => {
        switch (policyType) {
            case 'Motor':
                return getMotorBreakdown();
            case 'Health':
                return getHealthBreakdown();
            case 'Commercial':
                return getCommercialBreakdown();
            case 'Travel':
                return getTravelBreakdown();
            case 'Life':
                return getLifeBreakdown();
            case 'Cyber':
                return getCyberBreakdown();
            default:
                return [];
        }
    };

    const getMotorBreakdown = () => {
        const breakdown: Record<string, { count: number; total: number; icon: string }> = {};

        filteredPolicies.forEach(policy => {
            const type = policy.vehicle_type || 'Misc';
            if (!breakdown[type]) {
                breakdown[type] = { count: 0, total: 0, icon: getVehicleIcon(type) };
            }
            breakdown[type].count++;
            breakdown[type].total += policy.premium_amount || 0;
        });

        return Object.entries(breakdown).map(([key, value]) => ({
            category: key,
            ...value
        }));
    };

    const getHealthBreakdown = () => {
        const ranges = [
            { label: 'Up to ₹5 Lakh', min: 0, max: 500000, icon: '💚' },
            { label: '₹5L - ₹10L', min: 500000, max: 1000000, icon: '💛' },
            { label: '₹10L - ₹25L', min: 1000000, max: 2500000, icon: '🧡' },
            { label: 'Above ₹25L', min: 2500000, max: Infinity, icon: '❤️' }
        ];

        return ranges.map(range => {
            const policiesInRange = filteredPolicies.filter(p => {
                const sumInsured = p.sum_insured || 0;
                return sumInsured >= range.min && sumInsured < range.max;
            });

            return {
                category: range.label,
                count: policiesInRange.length,
                total: policiesInRange.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                icon: range.icon
            };
        }).filter(item => item.count > 0);
    };

    const getCommercialBreakdown = () => {
        const lobTypes = ['GPA', 'Fire', 'Other'];
        const icons: Record<string, string> = { 'GPA': '🏢', 'Fire': '🔥', 'Other': '📋' };

        return lobTypes.map(lob => {
            const policiesOfType = filteredPolicies.filter(p => p.lob_type === lob);
            return {
                category: lob,
                count: policiesOfType.length,
                total: policiesOfType.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                icon: icons[lob]
            };
        }).filter(item => item.count > 0);
    };

    const getTravelBreakdown = () => {
        const tripTypes = ['Single Trip', 'Multi Trip'];
        const icons: Record<string, string> = { 'Single Trip': '✈️', 'Multi Trip': '🌍' };

        return tripTypes.map(type => {
            const policiesOfType = filteredPolicies.filter(p => p.trip_type === type);
            return {
                category: type,
                count: policiesOfType.length,
                total: policiesOfType.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                icon: icons[type]
            };
        }).filter(item => item.count > 0);
    };

    const getLifeBreakdown = () => {
        const ranges = [
            { label: 'Up to ₹25 Lakh', min: 0, max: 2500000, icon: '💚' },
            { label: '₹25L - ₹50L', min: 2500000, max: 5000000, icon: '💛' },
            { label: '₹50L - ₹1 Crore', min: 5000000, max: 10000000, icon: '🧡' },
            { label: 'Above ₹1 Crore', min: 10000000, max: Infinity, icon: '❤️' }
        ];

        return ranges.map(range => {
            const policiesInRange = filteredPolicies.filter(p => {
                const sumAssured = p.sum_assured || 0;
                return sumAssured >= range.min && sumAssured < range.max;
            });

            return {
                category: range.label,
                count: policiesInRange.length,
                total: policiesInRange.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                icon: range.icon
            };
        }).filter(item => item.count > 0);
    };

    const getCyberBreakdown = () => {
        const riskTypes = ['Personal', 'Business'];
        const icons: Record<string, string> = { 'Personal': '👤', 'Business': '🏢' };

        return riskTypes.map(type => {
            const policiesOfType = filteredPolicies.filter(p => p.cyber_risk_type === type);
            return {
                category: type,
                count: policiesOfType.length,
                total: policiesOfType.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                icon: icons[type]
            };
        }).filter(item => item.count > 0);
    };

    const getVehicleIcon = (type: string) => {
        const icons: Record<string, string> = {
            'Car': '🚗',
            'Bike': '🏍️',
            'Bus': '🚌',
            'GCV': '🚚',
            'Misc': '📦'
        };
        return icons[type] || '📦';
    };

    const breakdown = getBreakdown();
    const grandTotal = breakdown.reduce((sum, item) => sum + item.total, 0);
    const totalPolicies = breakdown.reduce((sum, item) => sum + item.count, 0);

    // Group by company for "All Companies" view
    const getCompanyGroupedBreakdown = () => {
        if (selectedCompany !== 'all' || !isCorporate) return null;

        const grouped: Record<string, any[]> = {};
        policies.forEach(policy => {
            const company = policy.company_name || 'Unknown';
            if (!grouped[company]) grouped[company] = [];
            grouped[company].push(policy);
        });

        return Object.entries(grouped).map(([company, companyPolicies]) => {
            // Calculate breakdown for this company
            let companyBreakdown: any[] = [];

            if (policyType === 'Motor') {
                const breakdown: Record<string, { count: number; total: number; icon: string }> = {};
                companyPolicies.forEach(policy => {
                    const type = policy.vehicle_type || 'Misc';
                    if (!breakdown[type]) {
                        breakdown[type] = { count: 0, total: 0, icon: getVehicleIcon(type) };
                    }
                    breakdown[type].count++;
                    breakdown[type].total += policy.premium_amount || 0;
                });
                companyBreakdown = Object.entries(breakdown).map(([key, value]) => ({
                    category: key,
                    ...value
                }));
            }
            // Add similar logic for other policy types if needed

            return {
                company,
                breakdown: companyBreakdown,
                subtotal: companyPolicies.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
                count: companyPolicies.length
            };
        });
    };

    const companyGrouped = getCompanyGroupedBreakdown();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {policyType} Insurance Premium Breakdown
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Company Filter for Corporate Users */}
                    {isCorporate && companies.length > 1 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Company
                            </label>
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="all">All Companies</option>
                                {companies.map(company => (
                                    <option key={company} value={company}>{company}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Single Company Name Display */}
                    {isCorporate && companies.length === 1 && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="font-semibold text-gray-900">{companies[0]}</p>
                        </div>
                    )}

                    {/* Breakdown Table - Grouped by Company */}
                    {companyGrouped && companyGrouped.length > 0 ? (
                        <div className="space-y-6">
                            {companyGrouped.map((group, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                        {group.company}
                                    </h3>
                                    <table className="w-full">
                                        <tbody className="divide-y divide-gray-100">
                                            {group.breakdown.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="py-3 pr-4">
                                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                                            <span>{item.icon}</span>
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center text-gray-600">
                                                        {item.count}
                                                    </td>
                                                    <td className="py-3 text-right font-semibold text-gray-900">
                                                        {formatCurrency(item.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-semibold">
                                                <td className="py-3 pr-4 text-gray-700">Subtotal</td>
                                                <td className="py-3 text-center text-gray-700">{group.count}</td>
                                                <td className="py-3 text-right text-gray-900">{formatCurrency(group.subtotal)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ))}

                            {/* Grand Total */}
                            <div className="pt-4 border-t-2 border-gray-300">
                                <table className="w-full">
                                    <tbody>
                                        <tr className="font-bold text-lg">
                                            <td className="py-2">Grand Total</td>
                                            <td className="py-2 text-center">{totalPolicies}</td>
                                            <td className="py-2 text-right text-primary-600">{formatCurrency(grandTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Regular Breakdown Table */
                        <>
                            <table className="w-full mb-4">
                                <thead className="border-b-2 border-gray-200">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-gray-700">
                                            {policyType === 'Motor' ? 'Vehicle Type' :
                                                policyType === 'Commercial' ? 'LOB Type' :
                                                    policyType === 'Travel' ? 'Trip Type' :
                                                        policyType === 'Cyber' ? 'Risk Type' :
                                                            policyType === 'Health' || policyType === 'Life' ? 'Coverage Range' :
                                                                'Category'}
                                        </th>
                                        <th className="pb-3 text-center font-semibold text-gray-700">Policies</th>
                                        <th className="pb-3 text-right font-semibold text-gray-700">Total Premium</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {breakdown.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-3 pr-4">
                                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                                    <span>{item.icon}</span>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center text-gray-600">{item.count}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total Row */}
                            <div className="pt-4 border-t-2 border-gray-300">
                                <table className="w-full">
                                    <tbody>
                                        <tr className="font-bold text-lg">
                                            <td className="py-2">Total</td>
                                            <td className="py-2 text-center">{totalPolicies}</td>
                                            <td className="py-2 text-right text-primary-600">{formatCurrency(grandTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {breakdown.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No policies found for this category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
