import { useState, useCallback } from 'react';
import { checkDuplicatePolicyAcrossTypes, DuplicatePolicyResult } from '@/lib/duplicate-checker';

export function useDuplicatePolicyCheck(userId: string) {
    const [duplicateResult, setDuplicateResult] = useState<DuplicatePolicyResult | null>(null);
    const [checking, setChecking] = useState(false);

    const checkDuplicate = useCallback(
        async (policyNumber: string) => {
            if (!policyNumber || policyNumber.length < 3) {
                setDuplicateResult(null);
                return;
            }

            setChecking(true);
            try {
                const result = await checkDuplicatePolicyAcrossTypes(userId, policyNumber);
                setDuplicateResult(result);
            } catch (error) {
                console.error('Error checking duplicate:', error);
                setDuplicateResult(null);
            } finally {
                setChecking(false);
            }
        },
        [userId]
    );

    const reset = useCallback(() => {
        setDuplicateResult(null);
        setChecking(false);
    }, []);

    return {
        duplicateResult,
        checking,
        checkDuplicate,
        reset,
    };
}
