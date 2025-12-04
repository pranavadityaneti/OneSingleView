'use client';

import { useMemo, useState, useEffect } from 'react';
import { Bell, ChevronRight, Car, Heart, Umbrella, Briefcase, ChevronLeft } from 'lucide-react';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PolicyRenewalReminderProps {
    motorPolicies: MotorPolicy[];
    healthPolicies: HealthPolicy[];
    commercialPolicies: CommercialPolicy[];
    travelPolicies?: any[];
    lifePolicies?: any[];
    cyberPolicies?: any[];
}

export default function PolicyRenewalReminder({
    motorPolicies,
    healthPolicies,
    commercialPolicies,
    travelPolicies = [],
    lifePolicies = [],
    cyberPolicies = []
}: PolicyRenewalReminderProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Find ALL policies expiring soon
    const expiringPolicies = useMemo(() => {
        const allPolicies = [
            ...motorPolicies.map(p => ({ ...p, type: 'Motor' as const })),
            ...healthPolicies.map(p => ({ ...p, type: 'Health' as const })),
            ...commercialPolicies.map(p => ({ ...p, type: 'Commercial' as const })),
            ...travelPolicies.map(p => ({ ...p, type: 'Travel' as const })),
            ...lifePolicies.map(p => ({ ...p, type: 'Life' as const })),
            ...cyberPolicies.map(p => ({ ...p, type: 'Cyber' as const }))
        ];

        // Filter policies that are expiring soon
        const filtered = allPolicies.filter(p => {
            const isMotor = p.type === 'Motor';
            const isHealth = p.type === 'Health';
            const endDateValue = isMotor ? (p as any).policy_end_date :
                isHealth ? (p as any).expiry_date :
                    (p as any).expiry_date;
            const endDate = endDateValue ? new Date(endDateValue) : null;
            const status = calculatePolicyStatus(endDate);
            return status === 'Expiring Soon';
        });

        // Sort by expiry date to get the nearest ones first
        filtered.sort((a, b) => {
            const isMotorA = a.type === 'Motor';
            const isHealthA = a.type === 'Health';
            const isMotorB = b.type === 'Motor';
            const isHealthB = b.type === 'Health';

            const aEndDate = isMotorA ? (a as any).policy_end_date :
                isHealthA ? (a as any).expiry_date :
                    (a as any).expiry_date;
            const bEndDate = isMotorB ? (b as any).policy_end_date :
                isHealthB ? (b as any).expiry_date :
                    (b as any).expiry_date;

            const aTime = aEndDate ? new Date(aEndDate).getTime() : 0;
            const bTime = bEndDate ? new Date(bEndDate).getTime() : 0;

            return aTime - bTime;
        });

        return filtered;
    }, [motorPolicies, healthPolicies, commercialPolicies, travelPolicies, lifePolicies, cyberPolicies]);

    // Auto-swipe every 3 seconds
    useEffect(() => {
        if (expiringPolicies.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % expiringPolicies.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [expiringPolicies.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + expiringPolicies.length) % expiringPolicies.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % expiringPolicies.length);
    };

    if (expiringPolicies.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Renewal Reminders</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-gray-900 font-semibold mb-1">All policies are up to date!</p>
                        <p className="text-sm text-gray-500">No upcoming renewals in the next 30 days.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentPolicy = expiringPolicies[currentIndex];

    // Calculate days until expiry for current policy
    const isMotor = currentPolicy.type === 'Motor';
    const isHealth = currentPolicy.type === 'Health';
    const endDateValue = isMotor ? (currentPolicy as any).policy_end_date :
        isHealth ? (currentPolicy as any).expiry_date :
            (currentPolicy as any).expiry_date;
    const endDate = endDateValue ? new Date(endDateValue) : null;
    const today = new Date();
    const daysUntilExpiry = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Get policy-specific details
    const vehicleNumber = isMotor ? (currentPolicy as any).vehicle_number : null;
    const sumInsured = isHealth ? (currentPolicy as any).sum_insured :
        currentPolicy.type === 'Life' ? (currentPolicy as any).sum_insured :
            null;

    const getIcon = () => {
        switch (currentPolicy.type) {
            case 'Motor':
                return <Car className="w-5 h-5 text-blue-600" />;
            case 'Health':
                return <Heart className="w-5 h-5 text-green-600" />;
            case 'Life':
                return <Umbrella className="w-5 h-5 text-pink-600" />;
            case 'Commercial':
                return <Briefcase className="w-5 h-5 text-orange-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const handleRenew = () => {
        const typeSlug = currentPolicy.type.toLowerCase();
        router.push(`/policies/${typeSlug}/${(currentPolicy as any).id}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 h-full flex flex-col">
            {/* Header with carousel counter */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Upcoming Renewals</h3>
                </div>
                {expiringPolicies.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Previous policy"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                            {currentIndex + 1} / {expiringPolicies.length}
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Next policy"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-200 -mx-6 mb-4"></div>

            {/* Carousel Content */}
            <div className="flex-1 space-y-3">
                {/* Expiry Message */}
                <div className="break-words">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        Your <span className="font-semibold text-gray-900">{currentPolicy.type}</span> policy
                        {vehicleNumber && (
                            <span className="block sm:inline">
                                {' '}for <span className="font-bold text-primary-600">{vehicleNumber}</span>
                            </span>
                        )}
                        {sumInsured && !vehicleNumber && (
                            <span className="block sm:inline">
                                {' '}for <span className="font-bold text-primary-600">{formatCurrency(sumInsured)}</span>
                            </span>
                        )}
                        {' '}expires in <span className="font-bold text-orange-600">{daysUntilExpiry} days</span>.
                    </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                        Expiring Soon
                    </span>
                </div>

                {/* Policy Details */}
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-50 rounded">
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">Policy Type</p>
                            <p className="text-sm font-semibold text-gray-900">{currentPolicy.type}</p>
                        </div>
                    </div>

                    <div className="pl-8">
                        <p className="text-xs text-gray-500">Insurer</p>
                        <p className="text-sm font-semibold text-gray-900">{(currentPolicy as any).insurer_name}</p>
                    </div>

                    {sumInsured && (
                        <div className="pl-8">
                            <p className="text-xs text-gray-500">Sum Insured</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(sumInsured)}</p>
                        </div>
                    )}

                    {vehicleNumber && (
                        <div className="pl-8">
                            <p className="text-xs text-gray-500">Vehicle Number</p>
                            <p className="text-sm font-semibold text-gray-900">{vehicleNumber}</p>
                        </div>
                    )}
                </div>

                {/* Carousel Dots Indicator */}
                {expiringPolicies.length > 1 && (
                    <div className="flex justify-center gap-1.5 pt-2">
                        {expiringPolicies.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-1.5 rounded-full transition-all ${index === currentIndex
                                    ? 'w-6 bg-primary-600'
                                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to policy ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleRenew}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
            >
                Renew Now
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
