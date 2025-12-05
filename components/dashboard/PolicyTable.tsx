'use client';

import { useState, useMemo } from 'react';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Eye, Plus, Plane, Umbrella, Shield, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

type PolicyType = 'Motor' | 'Health' | 'Travel' | 'Commercial' | 'Life' | 'Cyber';

interface PolicyTableProps {
    policyType: PolicyType;
    motorPolicies: MotorPolicy[];
    healthPolicies: HealthPolicy[];
    commercialPolicies: CommercialPolicy[];
    travelPolicies?: any[];
    lifePolicies?: any[];
    cyberPolicies?: any[];
    userId: string;
    onPolicyAdded?: () => void;
}

type SortField = 'policy_number' | 'insurer_name' | 'premium_amount' | 'start_date' | 'end_date' | 'status' | 'vehicle_number' | 'vehicle_type';
type SortDirection = 'asc' | 'desc' | null;

export default function PolicyTable({
    policyType,
    motorPolicies,
    healthPolicies,
    commercialPolicies,
    travelPolicies = [],
    lifePolicies = [],
    cyberPolicies = [],
    userId,
    onPolicyAdded
}: PolicyTableProps) {
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Get policies based on type
    const getPolicies = () => {
        switch (policyType) {
            case 'Motor':
                return motorPolicies.map(p => ({ ...p, type: 'Motor' as const }));
            case 'Health':
                return healthPolicies.map(p => ({ ...p, type: 'Health' as const }));
            case 'Commercial':
                return commercialPolicies.map(p => ({ ...p, type: 'Commercial' as const }));
            case 'Travel':
                return travelPolicies.map(p => ({ ...p, type: 'Travel' as const }));
            case 'Life':
                return lifePolicies.map(p => ({ ...p, type: 'Life' as const }));
            case 'Cyber':
                return cyberPolicies.map(p => ({ ...p, type: 'Cyber' as const }));
            default:
                return [];
        }
    };

    const allPolicies = getPolicies();

    // Filter, search, and sort policies
    const filteredAndSortedPolicies = useMemo(() => {
        let result = allPolicies;

        // Filter: Show only Active and Expiring Soon policies
        result = result.filter(p => {
            const isMotor = p.type === 'Motor';
            const isHealth = p.type === 'Health';
            const endDateValue = isMotor ? (p as any).policy_end_date :
                isHealth ? (p as any).expiry_date :
                    (p as any).expiry_date;
            const endDate = endDateValue ? new Date(endDateValue) : null;
            const status = calculatePolicyStatus(endDate);
            return status === 'Active' || status === 'Expiring Soon';
        });

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => {
                const isMotor = p.type === 'Motor';
                const isHealth = p.type === 'Health';

                const startDateValue = isMotor ? (p as any).policy_start_date :
                    isHealth ? (p as any).start_date :
                        (p as any).start_date;
                const endDateValue = isMotor ? (p as any).policy_end_date :
                    isHealth ? (p as any).expiry_date :
                        (p as any).expiry_date;
                const endDate = endDateValue ? new Date(endDateValue) : null;
                const status = calculatePolicyStatus(endDate);

                // Convert dates to strings for search
                const startDateStr = startDateValue ? new Date(startDateValue).toLocaleDateString('en-IN').toLowerCase() : '';
                const endDateStr = endDateValue ? new Date(endDateValue).toLocaleDateString('en-IN').toLowerCase() : '';

                // Search in common fields
                const matchesCommon =
                    (p as any).policy_number?.toLowerCase().includes(query) ||
                    (p as any).insurer_name?.toLowerCase().includes(query) ||
                    (p as any).premium_amount?.toString().includes(query) ||
                    status?.toLowerCase().includes(query) ||
                    startDateStr.includes(query) ||
                    endDateStr.includes(query);

                const matchesVehicle = isMotor && (
                    (p as any).vehicle_number?.toLowerCase().includes(query) ||
                    (p as any).custom_vehicle_type?.toLowerCase().includes(query) ||
                    (p as any).vehicle_type?.toLowerCase().includes(query)
                );

                return matchesCommon || matchesVehicle;
            });
        }

        // Sort
        if (sortField && sortDirection) {
            result = [...result].sort((a, b) => {
                let aValue: any;
                let bValue: any;

                const isMotorA = a.type === 'Motor';
                const isHealthA = a.type === 'Health';
                const isMotorB = b.type === 'Motor';
                const isHealthB = b.type === 'Health';

                switch (sortField) {
                    case 'policy_number':
                        aValue = (a as any).policy_number || '';
                        bValue = (b as any).policy_number || '';
                        break;
                    case 'insurer_name':
                        aValue = (a as any).insurer_name || '';
                        bValue = (b as any).insurer_name || '';
                        break;
                    case 'premium_amount':
                        aValue = Number((a as any).premium_amount) || 0;
                        bValue = Number((b as any).premium_amount) || 0;
                        break;
                    case 'start_date':
                        const aStartDate = isMotorA ? (a as any).policy_start_date : (a as any).start_date;
                        const bStartDate = isMotorB ? (b as any).policy_start_date : (b as any).start_date;
                        aValue = aStartDate ? new Date(aStartDate).getTime() : 0;
                        bValue = bStartDate ? new Date(bStartDate).getTime() : 0;
                        break;
                    case 'end_date':
                        const aEndDate = isMotorA ? (a as any).policy_end_date : (a as any).expiry_date;
                        const bEndDate = isMotorB ? (b as any).policy_end_date : (b as any).expiry_date;
                        aValue = aEndDate ? new Date(aEndDate).getTime() : 0;
                        bValue = bEndDate ? new Date(bEndDate).getTime() : 0;
                        break;
                    case 'status':
                        const aEndDateForStatus = isMotorA ? (a as any).policy_end_date : (a as any).expiry_date;
                        const bEndDateForStatus = isMotorB ? (b as any).policy_end_date : (b as any).expiry_date;
                        aValue = calculatePolicyStatus(aEndDateForStatus ? new Date(aEndDateForStatus) : null);
                        bValue = calculatePolicyStatus(bEndDateForStatus ? new Date(bEndDateForStatus) : null);
                        break;
                    case 'vehicle_number':
                        aValue = isMotorA ? (a as any).vehicle_number || '' : '';
                        bValue = isMotorB ? (b as any).vehicle_number || '' : '';
                    case 'vehicle_number':
                        aValue = isMotorA ? (a as any).vehicle_number || '' : '';
                        bValue = isMotorB ? (b as any).vehicle_number || '' : '';
                        break;
                    case 'vehicle_type':
                        // Check custom_vehicle_type first, then vehicle_type (from DB enum)
                        aValue = isMotorA ? ((a as any).custom_vehicle_type || (a as any).vehicle_type || '') : '';
                        bValue = isMotorB ? ((b as any).custom_vehicle_type || (b as any).vehicle_type || '') : '';
                        break;
                    default:
                        return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else {
                    return sortDirection === 'asc'
                        ? aValue - bValue
                        : bValue - aValue;
                }
            });
        }

        return result;
    }, [allPolicies, searchQuery, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
        }
        if (sortDirection === 'asc') {
            return <ArrowUp className="w-4 h-4 ml-1 inline text-primary-600" />;
        }
        if (sortDirection === 'desc') {
            return <ArrowDown className="w-4 h-4 ml-1 inline text-primary-600" />;
        }
        return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    };

    const getIcon = () => {
        switch (policyType) {
            case 'Motor':
                return <Car className="w-5 h-5 text-blue-600" />;
            case 'Health':
                return <Heart className="w-5 h-5 text-green-600" />;
            case 'Commercial':
                return <Briefcase className="w-5 h-5 text-orange-600" />;
            case 'Travel':
                return <Plane className="w-5 h-5 text-purple-600" />;
            case 'Life':
                return <Umbrella className="w-5 h-5 text-pink-600" />;
            case 'Cyber':
                return <Shield className="w-5 h-5 text-cyan-600" />;
            default:
                return null;
        }
    };

    const getColorClass = () => {
        switch (policyType) {
            case 'Motor':
                return 'bg-blue-50 border-blue-200';
            case 'Health':
                return 'bg-green-50 border-green-200';
            case 'Commercial':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const handleViewDetails = (policy: any) => {
        const typeSlug = policyType.toLowerCase();
        router.push(`/policies/${typeSlug}/${policy.id}`);
    };

    const isMotorTable = policyType === 'Motor';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${getColorClass()} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{policyType} Policies</h3>
                        <p className="text-sm text-gray-600">
                            {filteredAndSortedPolicies.length} {filteredAndSortedPolicies.length === 1 ? 'policy' : 'policies'} found
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Policy</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${policyType.toLowerCase()} policies${isMotorTable ? ' (policy number, insurer, vehicle number, etc.)' : ' (policy number, insurer, etc.)'}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table Content with Scroll */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                {filteredAndSortedPolicies.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {getIcon() || <Briefcase className="w-8 h-8 text-gray-400" />}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No matching policies found' : `No ${policyType} Policies Found`}
                        </h4>
                        <p className="text-gray-500">
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : `You don't have any active ${policyType.toLowerCase()} policies yet.`
                            }
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                                {isMotorTable && (
                                    <th
                                        onClick={() => handleSort('vehicle_number')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        Vehicle Number {getSortIcon('vehicle_number')}
                                    </th>
                                )}
                                {isMotorTable && (
                                    <th
                                        onClick={() => handleSort('vehicle_type' as SortField)}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        Vehicle Type {getSortIcon('vehicle_type' as SortField)}
                                    </th>
                                )}
                                <th
                                    onClick={() => handleSort('policy_number')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    Policy Number {getSortIcon('policy_number')}
                                </th>
                                <th
                                    onClick={() => handleSort('insurer_name')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    Insurer Name {getSortIcon('insurer_name')}
                                </th>
                                <th
                                    onClick={() => handleSort('premium_amount')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    Premium Amount {getSortIcon('premium_amount')}
                                </th>
                                <th
                                    onClick={() => handleSort('start_date')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    Start Date {getSortIcon('start_date')}
                                </th>
                                <th
                                    onClick={() => handleSort('end_date')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    End Date {getSortIcon('end_date')}
                                </th>
                                <th
                                    onClick={() => handleSort('status')}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    Status {getSortIcon('status')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedPolicies.map((policy: any) => {
                                const isMotor = policy.type === 'Motor';
                                const isHealth = policy.type === 'Health';

                                // Safely handle dates
                                const startDateValue = isMotor ? policy.policy_start_date :
                                    isHealth ? policy.start_date :
                                        policy.start_date;

                                const endDateValue = isMotor ? policy.policy_end_date :
                                    isHealth ? policy.expiry_date :
                                        policy.expiry_date;

                                // Create Date objects with validation
                                const startDate = startDateValue ? new Date(startDateValue) : null;
                                const endDate = endDateValue ? new Date(endDateValue) : null;

                                // Calculate status (now handles null/invalid dates)
                                const status = calculatePolicyStatus(endDate);

                                return (
                                    <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                        {isMotorTable && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewDetails(policy)}
                                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                                >
                                                    {policy.vehicle_number}
                                                </button>
                                            </td>
                                        )}
                                        {isMotorTable && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 capitalize">
                                                    {(policy as any).custom_vehicle_type || (policy as any).vehicle_type || 'N/A'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {policy.policy_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {policy.insurer_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(policy.premium_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {startDate && !isNaN(startDate.getTime())
                                                    ? startDate.toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {endDate && !isNaN(endDate.getTime())
                                                    ? endDate.toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : status === 'Expiring Soon'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewDetails(policy)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Policy Modal */}
            <AddPolicyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                userId={userId}
                initialType={policyType}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    onPolicyAdded?.();
                }}
            />
        </div>
    );
}
