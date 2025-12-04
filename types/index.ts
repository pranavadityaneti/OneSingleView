// User & Authentication Types
export type UserRole = 'individual' | 'corporate_employee' | 'corporate_admin' | 'admin' | 'rm';

export interface User {
    id: string;
    email: string;
    mobile: string;
    name: string;
    company_name?: string;
    role: UserRole;
    customer_id?: string;
    address?: string;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
    rm_id?: string;
}

export interface UserAuditLog {
    user_id: string;
    field_changed: 'email' | 'mobile';
    old_value: string;
    new_value: string;
    changed_at: Date;
}

// Policy Types
export type PolicyStatus = 'Active' | 'Expiring Soon' | 'Expired';
export type VehicleType = 'Car' | 'Bike' | 'Bus' | 'GCV' | 'Misc';
export type NumberPlateType = 'White' | 'Yellow' | 'EV' | 'Others';
export type OwnershipType = 'Individual' | 'Company';
export type LOBType = 'Motor' | 'Health' | 'GPA' | 'Fire' | 'Other';
export type PolicyType = 'Comprehensive' | 'TP'; // TP = Third Party

export interface MotorPolicy {
    id: string;
    user_id: string;
    user_name?: string; // For Admin View
    user_email?: string; // For Admin View
    policy_number: string;
    vehicle_number: string;
    vehicle_type: VehicleType;
    manufacturer: string;
    model: string;
    fuel_type: string;
    manufacturing_year: number;
    number_plate_type: NumberPlateType;
    ownership_type?: OwnershipType;
    policy_type?: PolicyType; // New field for Comprehensive/TP
    insurer_name: string;
    premium_amount: number;
    policy_start_date: Date;
    policy_end_date: Date;
    status?: PolicyStatus; // Optional since database doesn't have this column yet
    rc_docs: string[];
    previous_policy_docs: string[];
    dl_docs?: string[];
    created_at: Date;
    updated_at: Date;
}

export interface HealthPolicy {
    id: string;
    user_id: string;
    user_name?: string; // For Admin View
    user_email?: string; // For Admin View
    company_name?: string;
    policy_number: string;
    insurer_name: string;
    sum_insured?: number;
    premium_amount: number;
    expiry_date: Date;
    policy_docs: string[];
    no_of_lives?: number;
    status?: PolicyStatus; // Optional since database doesn't have this column yet
    created_at: Date;
    updated_at: Date;
}

export interface CommercialPolicy {
    id: string;
    user_id: string;
    user_name?: string; // For Admin View
    user_email?: string; // For Admin View
    lob_type: 'GPA' | 'Fire' | 'Other';
    company_name?: string;
    policy_holder_name?: string;
    policy_number: string;
    insurer_name: string;
    premium_amount: number;
    sum_insured?: number;
    expiry_date: Date;
    policy_docs: string[];
    status?: PolicyStatus; // Optional since database doesn't have this column yet
    created_at: Date;
    updated_at: Date;
}

// Claims Types
export type ClaimStatus = 'New' | 'In Progress' | 'Settled' | 'Rejected';

export interface Claim {
    id: string;
    user_id: string;
    user_name?: string; // For Admin View
    user_email?: string; // For Admin View
    policy_id?: string; // Link to health_policies.id for GMC
    lob_type: LOBType;
    claim_type: string;
    incident_date: Date;
    description: string;
    supporting_docs: string[];
    status: ClaimStatus;
    created_at: Date;
    updated_at: Date;
}

// Quote Request Types
export interface QuoteRequest {
    id: string;
    user_id: string;
    user_name?: string; // For Admin View
    user_email?: string; // For Admin View
    lob_type: 'Motor' | 'Health' | 'Life' | 'Others';
    details: string;
    uploaded_quote?: string;
    has_better_quote: boolean;
    status: 'New' | 'Contacted' | 'Closed';
    created_at: Date;
}

// Referrals
export interface Referral {
    id: string;
    user_id: string;
    friend_name: string;
    friend_mobile: string;
    friend_email: string;
    notes?: string;
    created_at: Date;
}



// Settings
export interface AppSettings {
    key: 'expiry_threshold_days' | 'client_logos' | 'ad_banners';
    value: any;
    updated_at: Date;
}

// User Preferences Types
export interface UserPreferences {
    id: string;
    user_id: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    policy_expiry_alerts: boolean;
    claim_updates: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RMInfo {
    name: string;
    email: string;
    mobile: string;
}

// Dashboard Types
export interface PortfolioStats {
    motor: number;
    health: number;
    travel: number;
    commercial: number;
    life: number;
    cyber: number;
}

export interface DashboardSummary {
    total_policies: number;
    total_premium: number;
    expiring_soon_count: number;
    portfolio_by_lob: PortfolioStats;
}

// Form Data Types (for partial/draft data)
export interface MotorPolicyFormData extends Partial<MotorPolicy> {
    rc_files?: File[];
    previous_policy_files?: File[];
    dl_files?: File[];
}

export interface HealthPolicyFormData extends Partial<HealthPolicy> {
    policy_files?: File[];
}

export interface CommercialPolicyFormData extends Partial<CommercialPolicy> {
    policy_files?: File[];
}

export interface ClaimFormData extends Partial<Claim> {
    supporting_files?: File[];
}

// Admin Dashboard Types

export interface Garage {
    id: string;
    name: string;
    insurer_name: string;
    city: string;
    pincode?: string;
    address?: string;
    contact_number?: string;
    latitude?: number;
    longitude?: number;
    created_at: Date;
    updated_at: Date;
}

export interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url?: string;
    active_from: Date;
    active_until?: Date;
    is_active: boolean;
    display_order: number;
    created_at: Date;
    updated_at: Date;
}

export interface AppSetting {
    key: string;
    value: any;
    description?: string;
    updated_at: Date;
    updated_by?: string;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

export interface RMProfile {
    user_id: string;
    employee_id?: string;
    department?: string;
    leads_assigned: number;
    leads_closed: number;
    claims_handled: number;
    rating: number;
    created_at: Date;
    updated_at: Date;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
    marketing_emails: boolean;
    policy_expiry_alerts: boolean;
    claim_updates: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RMInfo {
    name: string;
    email: string;
    mobile: string;
}
