'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DuplicatePolicyWarningProps {
    policyNumber: string;
    policyType: string;
    policyId: string;
    insurerName?: string;
}

export default function DuplicatePolicyWarning({
    policyNumber,
    policyType,
    policyId,
    insurerName
}: DuplicatePolicyWarningProps) {
    const getPolicyLink = () => {
        return `/policies/${policyType}/${policyId}`;
    };

    return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                        This policy already exists!
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                        Policy {policyNumber} {insurerName && `(${insurerName})`} is already in your account.
                    </p>
                    <Link
                        href={getPolicyLink()}
                        className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                    >
                        View existing policy →
                    </Link>
                </div>
            </div>
        </div>
    );
}
