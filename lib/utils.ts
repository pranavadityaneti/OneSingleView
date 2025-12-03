import { PolicyStatus } from '@/types';

/**
 * Calculate policy status based on end/expiry date
 * @param endDate - Policy end/expiry date
 * @param thresholdDays - Number of days before expiry to mark as "Expiring Soon" (default: 15)
 * @returns PolicyStatus - 'Active', 'Expiring Soon', or 'Expired'
 */
export function calculatePolicyStatus(
    endDate: Date | string | null | undefined,
    thresholdDays: number = 15
): PolicyStatus {
    // Handle null, undefined, or invalid dates
    if (!endDate) return 'Expired';

    const date = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Expired';

    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays <= thresholdDays) return 'Expiring Soon';
    return 'Active';
}

/**
 * Get Financial Year for a given date (April-March)
 * @param date - Date to get FY for
 * @returns string - FY in format "FY 2024-25"
 */
export function getFY(date: Date): string {
    const month = date.getMonth(); // 0-indexed (0 = January)
    const year = date.getFullYear();

    if (month >= 3) {
        // April (3) onwards
        return `FY ${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `FY ${year - 1}-${year.toString().slice(-2)}`;
    }
}

/**
 * Check if a date falls within a specific FY
 * @param date - Date to check
 * @param fy - FY string (e.g., "FY 2024-25")
 * @returns boolean
 */
export function isDateInFY(date: Date, fy: string): boolean {
    return getFY(date) === fy;
}

/**
 * Get start and end dates for a Financial Year
 * @param fy - FY string (e.g., "FY 2024-25")
 * @returns { start: Date, end: Date }
 */
export function getFYDates(fy: string): { start: Date; end: Date } {
    const years = fy.match(/\d{4}-\d{2}/)?.[0].split('-');
    if (!years || years.length !== 2) {
        throw new Error('Invalid FY format');
    }

    const startYear = parseInt(years[0]);
    const endYear = parseInt('20' + years[1]);

    return {
        start: new Date(startYear, 3, 1), // April 1st
        end: new Date(endYear, 2, 31, 23, 59, 59), // March 31st
    };
}

/**
 * Get current Financial Year
 * @returns string - Current FY in format "FY 2024-25"
 */
export function getCurrentFY(): string {
    return getFY(new Date());
}

/**
 * Format currency amount
 * @param amount - Amount in number
 * @param currency - Currency symbol (default: '₹')
 * @returns string - Formatted currency
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
    return `${currency}${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @returns string - Formatted date (e.g., "23 Nov 2024")
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Calculate days until a date
 * @param endDate - Target date
 * @returns number - Days remaining (negative if past), or 0 if invalid date
 */
export function daysUntil(endDate: Date | string | null | undefined): number {
    if (!endDate) return 0;

    const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (isNaN(date.getTime())) return 0;

    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Class names utility for conditional styling
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}
