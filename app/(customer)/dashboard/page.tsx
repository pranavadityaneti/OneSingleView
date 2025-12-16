'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
    getUserMotorPolicies,
    getUserHealthPolicies,
    getUserCommercialPolicies,
    getUserTravelPolicies,
    getUserLifePolicies,
    getUserCyberPolicies,
    getUserClaims,
    getUserReferrals
} from '@/lib/db';
import { User, MotorPolicy, HealthPolicy, CommercialPolicy, DashboardSummary, Claim, Referral } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Plane, Shield, Umbrella, FileText, TrendingUp, AlertCircle, Calculator, ChevronRight, XCircle } from 'lucide-react';
import PortfolioPieChart from '@/components/dashboard/PortfolioPieChart';
import PolicyCategoryCard from '@/components/dashboard/PolicyCategoryCard';
import ClaimsOverview from '@/components/dashboard/ClaimsOverview';
import OffersCard from '@/components/dashboard/OffersCard';
import AnalyticsAreaChart from '@/components/dashboard/AnalyticsAreaChart';
import AnalyticsDonutChart from '@/components/dashboard/AnalyticsDonutChart';
import PolicyRenewalReminder from '@/components/dashboard/PolicyRenewalReminder';
import FlipCard from '@/components/dashboard/FlipCard';
import MonthlyActivityChart from '@/components/dashboard/MonthlyActivityChart';
import ProtectFamilyCard from '@/components/dashboard/ProtectFamilyCard';
import CoverageGapCard from '@/components/dashboard/CoverageGapCard';
import ReportsModal from '@/components/dashboard/ReportsModal';
import PolicyDetailModal from '@/components/dashboard/PolicyDetailModal';
import StickyAddPolicy from '@/components/dashboard/StickyAddPolicy';
import ExportButton from '@/components/dashboard/ExportButton';
import AddPolicyModal, { PolicyType } from '@/components/policies/AddPolicyModal';
import PolicyTable from '@/components/dashboard/PolicyTable';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    // Policy Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailType, setSelectedDetailType] = useState<'total' | 'premium' | 'expiring' | 'expired'>('total');
    const [detailModalTitle, setDetailModalTitle] = useState('');

    // Renewal workflow state
    const [isRenewalMode, setIsRenewalMode] = useState(false);
    const [renewalPolicyData, setRenewalPolicyData] = useState<any>(null);
    const [renewalPolicyType, setRenewalPolicyType] = useState<PolicyType | undefined>(undefined);

    // Add Policy Modal State
    const [selectedType, setSelectedType] = useState<'total' | 'premium' | 'expiring'>('total');
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

    // Store actual policy data
    const [motorPolicies, setMotorPolicies] = useState<MotorPolicy[]>([]);
    const [healthPolicies, setHealthPolicies] = useState<HealthPolicy[]>([]);
    const [commercialPolicies, setCommercialPolicies] = useState<CommercialPolicy[]>([]);
    const [travelPolicies, setTravelPolicies] = useState<any[]>([]);
    const [lifePolicies, setLifePolicies] = useState<any[]>([]);
    const [cyberPolicies, setCyberPolicies] = useState<any[]>([]);

    // Policy Counts for Cards
    const [policyCounts, setPolicyCounts] = useState({
        motor: 0,
        health: 0,
        commercial: 0
    });

    // Selected Policy Type for Table
    type TablePolicyType = 'Motor' | 'Health' | 'Travel' | 'Commercial' | 'Life' | 'Cyber' | null;
    const [selectedPolicyType, setSelectedPolicyType] = useState<TablePolicyType>('Motor'); // Default to Motor

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    router.push('/login');
                    return;
                }

                // Redirect corporate users to corporate dashboard - REMOVED for Unified Dashboard
                // if (currentUser.role === 'corporate_employee' || currentUser.role === 'corporate_admin') {
                //     router.push('/dashboard/corporate');
                //     return;
                // }

                setUser(currentUser);
                await loadDashboardData(currentUser.id);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const loadDashboardData = async (userId: string) => {
        try {
            const [motor, healthData, commercial, travel, life, cyber, userClaims, userReferrals] = await Promise.all([
                getUserMotorPolicies(userId),
                getUserHealthPolicies(userId),
                getUserCommercialPolicies(userId),
                getUserTravelPolicies(userId),
                getUserLifePolicies(userId),
                getUserCyberPolicies(userId),
                getUserClaims(userId),
                getUserReferrals(userId)
            ]);

            // Store policy data for modal with calculated status
            const processPolicy = (p: any) => {
                const endDateValue = 'policy_end_date' in p ? p.policy_end_date : p.expiry_date;
                const status = calculatePolicyStatus(endDateValue); // Now handles null/invalid dates
                return { ...p, status };
            };

            const processedMotor = motor.map(processPolicy);
            const processedHealth = healthData.map(processPolicy);
            const processedCommercial = commercial.map(processPolicy);
            const processedTravel = travel.map(processPolicy);
            const processedLife = life.map(processPolicy);
            const processedCyber = cyber.map(processPolicy);

            setMotorPolicies(processedMotor);
            setHealthPolicies(processedHealth);
            setCommercialPolicies(processedCommercial);
            setTravelPolicies(processedTravel);
            setLifePolicies(processedLife);
            setCyberPolicies(processedCyber);

            setClaims(userClaims);
            setReferrals(userReferrals);

            // Calculate Summary
            // Filter active policies for Total Policies and Total Premium
            const activePolicies = [
                ...motor, ...healthData, ...commercial, ...travel, ...life, ...cyber
            ].filter(p => {
                const endDate = new Date('policy_end_date' in p ? p.policy_end_date : p.expiry_date);
                return calculatePolicyStatus(endDate) === 'Active' || calculatePolicyStatus(endDate) === 'Expiring Soon';
            });

            const totalActivePolicies = activePolicies.length;

            const totalActivePremium = activePolicies.reduce((sum, p) => sum + (Number(p.premium_amount) || 0), 0);

            const expiringSoonCount = [
                ...processedMotor, ...processedHealth, ...processedCommercial, ...processedTravel, ...processedLife, ...processedCyber
            ].filter(p => p.status === 'Expiring Soon').length;

            const expiredCount = [
                ...processedMotor, ...processedHealth, ...processedCommercial, ...processedTravel, ...processedLife, ...processedCyber
            ].filter(p => p.status === 'Expired').length;

            // Calculate portfolio summary - ONLY for Active and Expiring Soon policies (exclude Expired)
            const motorPremium = processedMotor
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);
            const healthPremium = processedHealth
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);
            const travelPremium = processedTravel
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);
            const commercialPremium = processedCommercial
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);
            const lifePremium = processedLife
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);
            const cyberPremium = processedCyber
                .filter((p: any) => p.status !== 'Expired')
                .reduce((sum: number, p: any) => sum + Number(p.premium_amount), 0);

            const allPolicies = [...processedMotor, ...processedHealth, ...processedCommercial, ...processedTravel, ...processedLife, ...processedCyber];

            // Calculate expiring soon count based on calculated status
            const expiringCount = allPolicies.filter(p => p.status === 'Expiring Soon').length;

            // Calculate Monthly Premium Trend (Area Chart)
            const monthlyPremium = Array(12).fill(0);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            allPolicies.forEach(p => {
                const date = new Date(p.created_at); // Using created_at for trend
                const month = date.getMonth();
                monthlyPremium[month] += Number(p.premium_amount);
            });

            const areaChartData = months.map((month, index) => ({
                name: month,
                value: monthlyPremium[index]
            }));

            // Calculate Monthly Activity (Bar Chart - Count of policies + claims)
            const monthlyActivity = Array(12).fill(0);
            allPolicies.forEach(p => {
                const date = new Date(p.created_at);
                monthlyActivity[date.getMonth()]++;
            });
            userClaims.forEach(c => {
                const date = new Date(c.created_at);
                monthlyActivity[date.getMonth()]++;
            });

            const barChartData = months.map((month, index) => ({
                name: (index + 1).toString(),
                value: monthlyActivity[index]
            }));

            setSummary({
                total_policies: totalActivePolicies,
                total_premium: totalActivePremium,
                expiring_soon_count: expiringSoonCount,
                expired_count: expiredCount,
                portfolio_by_lob: {
                    motor: motorPremium,
                    health: healthPremium,
                    travel: travelPremium,
                    commercial: commercialPremium,
                    life: lifePremium,
                    cyber: cyberPremium,
                },
                areaChartData, // Pass to state
                barChartData   // Pass to state
            } as any); // Casting to any to avoid type error for now, ideally update DashboardSummary type
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    if (loading || !user || !summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const activeClaims = claims.filter(c => c.status === 'New' || c.status === 'In Progress').length;
    const settledClaims = claims.filter(c => c.status === 'Settled').length;
    const rejectedClaims = claims.filter(c => c.status === 'Rejected').length;

    // Click handlers for dashboard cards
    const handleTotalPoliciesClick = () => {
        setSelectedDetailType('total');
        setDetailModalTitle('All Policies');
        setShowDetailModal(true);
    };

    const handlePremiumClick = () => {
        setSelectedDetailType('premium');
        setDetailModalTitle('Policies by Premium');
        setShowDetailModal(true);
    };

    const handleExpiringClick = () => {
        setSelectedDetailType('expiring');
        setDetailModalTitle('Expiring Soon');
        setShowDetailModal(true);
    };

    const handleExpiredClick = () => {
        setSelectedDetailType('expired');
        setDetailModalTitle('Expired Policies');
        setShowDetailModal(true);
    };

    // NEW: Handle renewal - opens Add Policy modal with pre-filled data
    const handleRenewPolicy = async (policy: any, policyType: string) => {
        setRenewalPolicyData(policy);
        setRenewalPolicyType(policyType as PolicyType);
        setIsRenewalMode(true);
        setShowDetailModal(false); // Close detail modal
        setIsHealthModalOpen(true); // Open add policy modal (using existing state)
    };

    return (
        <div id="dashboard-content" className="space-y-6">
            {/* Header Actions - Top Right */}
            <div className="flex justify-end items-center mb-6 space-x-3">
                <ExportButton
                    onExportDashboard={() => { }}
                    motorPolicies={motorPolicies}
                    healthPolicies={healthPolicies}
                    commercialPolicies={commercialPolicies}
                    travelPolicies={travelPolicies}
                    lifePolicies={lifePolicies}
                    cyberPolicies={cyberPolicies}
                    userName={user?.name || 'User'}
                />
                <StickyAddPolicy userId={user.id} className="relative !fixed-none !top-auto !right-auto" onSuccess={() => loadDashboardData(user.id)} />
            </div>
            <ReportsModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
            <PolicyDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={detailModalTitle}
                type={selectedDetailType}
                motorPolicies={motorPolicies}
                healthPolicies={healthPolicies}
                commercialPolicies={commercialPolicies}
                travelPolicies={travelPolicies}
                lifePolicies={lifePolicies}
                cyberPolicies={cyberPolicies}
                onRenewPolicy={handleRenewPolicy} // NEW: Pass renewal handler
            />

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Policies - Clickable */}
                <div
                    onClick={handleTotalPoliciesClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Total Active Policies</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {summary ? summary.total_policies : 0}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Click to view details</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Premium - Clickable */}
                <div
                    onClick={handlePremiumClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Total Active Premium</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {summary ? formatCurrency(summary.total_premium) : '₹0'}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Click to view breakdown</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Expiring Soon - Clickable */}
                <div
                    onClick={handleExpiringClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Expiring Soon</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {summary ? summary.expiring_soon_count : 0}
                            </p>
                            <p className="text-xs text-orange-600 mt-2">Click to view policies</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Expired Policies - Clickable */}
                <div
                    onClick={handleExpiredClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Expired Policies</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {summary ? (summary as any).expired_count || 0 : 0}
                            </p>
                            <p className="text-xs text-red-600 mt-2">Click to view policies</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <FlipCard
                        title="Motor"
                        icon={Car}
                        activeCount={motorPolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={motorPolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="blue"
                        onClick={() => setSelectedPolicyType('Motor')}
                        totalLabel="Total Number of Vehicles"
                    />
                    <FlipCard
                        title="Health"
                        icon={Heart}
                        activeCount={healthPolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={healthPolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="green"
                        onClick={() => setSelectedPolicyType('Health')}
                    />
                    <FlipCard
                        title="Travel"
                        icon={Plane}
                        activeCount={travelPolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={travelPolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="purple"
                        onClick={() => setSelectedPolicyType('Travel')}
                    />
                    <FlipCard
                        title="Commercial"
                        icon={Briefcase}
                        activeCount={commercialPolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={commercialPolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="orange"
                        onClick={() => setSelectedPolicyType('Commercial')}
                    />
                    <FlipCard
                        title="Life"
                        icon={Umbrella}
                        activeCount={lifePolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={lifePolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="pink"
                        onClick={() => setSelectedPolicyType('Life')}
                    />
                    <FlipCard
                        title="Cyber"
                        icon={Shield}
                        activeCount={cyberPolicies.filter(p => p.status === 'Active').length}
                        expiringSoonCount={cyberPolicies.filter(p => p.status === 'Expiring Soon').length}
                        colorClass="cyan"
                        onClick={() => setSelectedPolicyType('Cyber')}
                    />
                </div>
            </div>

            {/* Policy Table Section - Always visible, changes based on selected type */}
            {selectedPolicyType && (
                <PolicyTable
                    policyType={selectedPolicyType}
                    motorPolicies={motorPolicies}
                    healthPolicies={healthPolicies}
                    commercialPolicies={commercialPolicies}
                    travelPolicies={travelPolicies}
                    lifePolicies={lifePolicies}
                    cyberPolicies={cyberPolicies}
                    userId={user?.id || ''}
                    userRole={user.role}
                    onPolicyAdded={async () => {
                        if (user) {
                            await loadDashboardData(user.id);
                        }
                    }}
                />
            )}

            {/* Analytics & Insights Section */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column (2/3 width on desktop) */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Monthly Activity - Stacked Bar Chart */}
                    <div className="h-[400px]">
                        <MonthlyActivityChart
                            data={(summary as any).areaChartData}
                            allPolicies={[...motorPolicies, ...healthPolicies, ...commercialPolicies, ...travelPolicies, ...lifePolicies, ...cyberPolicies]}
                        />
                    </div>

                    {/* Claims Overview and Policy Renewal Reminder - Side by side on desktop, stacked on mobile */}
                    <div className="grid md:grid-cols-2 gap-6 h-[320px]">
                        <ClaimsOverview
                            activeCount={activeClaims}
                            settledCount={settledClaims}
                            rejectedCount={rejectedClaims}
                        />
                        <PolicyRenewalReminder
                            motorPolicies={motorPolicies}
                            healthPolicies={healthPolicies}
                            commercialPolicies={commercialPolicies}
                            travelPolicies={travelPolicies}
                            lifePolicies={lifePolicies}
                            cyberPolicies={cyberPolicies}
                        />
                    </div>
                </div>

                {/* Right Column (1/3 width on desktop) */}
                <div className="space-y-6">
                    {/* Source of Premium - Donut Chart */}
                    <div className="h-[400px]">
                        <AnalyticsDonutChart
                            data={summary.portfolio_by_lob}
                            allPolicies={[
                                ...motorPolicies.map(p => ({ ...p, policy_type: 'motor' })),
                                ...healthPolicies.map(p => ({ ...p, policy_type: 'health' })),
                                ...commercialPolicies.map(p => ({ ...p, policy_type: 'commercial' })),
                                ...travelPolicies.map(p => ({ ...p, policy_type: 'travel' })),
                                ...lifePolicies.map(p => ({ ...p, policy_type: 'life' })),
                                ...cyberPolicies.map(p => ({ ...p, policy_type: 'cyber' })),
                            ]}
                            userRole={user.role}
                        />
                    </div>

                    {/* Protect Family Card and Coverage Gap Card - Stacked */}
                    <div className="h-[320px] flex flex-col gap-3">
                        {/* Protect Family - Half height of container */}
                        <div className="h-[160px] flex-shrink-0">
                            <ProtectFamilyCard onGetQuote={() => setIsHealthModalOpen(true)} />
                        </div>
                        {/* Coverage Gap Card - Takes remaining space */}
                        {healthPolicies.length === 0 && (
                            <div className="flex-1">
                                <CoverageGapCard
                                    missingPolicyType="Health"
                                    onExplore={() => setIsHealthModalOpen(true)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* StickyAddPolicy moved to header */}

            <AddPolicyModal
                isOpen={isHealthModalOpen}
                onClose={() => {
                    setIsHealthModalOpen(false);
                    setIsRenewalMode(false);
                    setRenewalPolicyData(null);
                }}
                userId={user.id}
                userRole={user.role}
                initialType={isRenewalMode ? renewalPolicyType : 'Health'}
                isRenewalMode={isRenewalMode}
                renewalData={renewalPolicyData}
                onRenewalComplete={async (oldPolicyId: string) => {
                    // Update old policy status to History
                    if (renewalPolicyType) {
                        const { updatePolicyStatus } = await import('@/lib/db');
                        await updatePolicyStatus(
                            renewalPolicyType.toLowerCase() as 'motor' | 'health' | 'commercial' | 'travel' | 'life' | 'cyber',
                            oldPolicyId,
                            'History'
                        );
                    }
                }}
                onSuccess={async () => {
                    setIsHealthModalOpen(false);
                    setIsRenewalMode(false);
                    setRenewalPolicyData(null);
                    if (user) {
                        await loadDashboardData(user.id);
                    }
                }}
            />
        </div>
    );
}
