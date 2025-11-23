// Form validation utilities

export const validateVehicleNumber = (vehicleNumber: string): boolean => {
    // Indian vehicle number format: AA00AA0000 or AA00A0000
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    return regex.test(vehicleNumber.replace(/\s+/g, ''));
};

export const validatePolicyNumber = (policyNumber: string): boolean => {
    // Basic validation: at least 5 characters
    return policyNumber.trim().length >= 5;
};

export const validatePremiumAmount = (amount: number, min = 0, max = 10000000): boolean => {
    return amount >= min && amount <= max && !isNaN(amount);
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
    return startDate < endDate;
};

export const validatePhoneNumber = (phone: string): boolean => {
    // Indian phone number: 10 digits, optionally starting with +91
    const regex = /^(\+91)?[6-9]\d{9}$/;
    return regex.test(phone.replace(/[\s-]/g, ''));
};

export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validateGSTNumber = (gst: string): boolean => {
    // GST format: 22 characters
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
};

export const validatePAN = (pan: string): boolean => {
    // PAN format: AAAAA0000A
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return regex.test(pan);
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};

// Get today's date in YYYY-MM-DD format for input defaults
export const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
};

// Get date one year from today
export const getOneYearFromNow = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
};

// Validate required field
export const validateRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
};

// Error messages
export const getErrorMessage = (fieldName: string, validationType: string): string => {
    const messages: Record<string, string> = {
        required: `${fieldName} is required`,
        vehicleNumber: 'Invalid vehicle number format (e.g., KA01AB1234)',
        policyNumber: 'Policy number must be at least 5 characters',
        premium: 'Invalid premium amount',
        dateRange: 'End date must be after start date',
        phone: 'Invalid phone number (10 digits)',
        email: 'Invalid email address',
        gst: 'Invalid GST number format',
        pan: 'Invalid PAN format',
    };
    return messages[validationType] || `Invalid ${fieldName}`;
};
