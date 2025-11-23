'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserMotorPolicies, getUserGMCPolicies, getUserCommercialPolicies, getUserClaims, getUserReferrals } from '@/lib/db';
import { User, MotorPolicy, GMCPolicy, CommercialPolicy, DashboardSummary, Claim, Referral } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Plane, Shield, Umbrella, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import PortfolioPieChart from '@/components/dashboard/PortfolioPieChart';
import PolicyCategoryCard from '@/components/dashboard/PolicyCategoryCard';
import ClaimsOverview from '@/components/dashboard/ClaimsOverview';
import UpsellCard from '@/components/dashboard/UpsellCard';
import OffersCard from '@/components/dashboard/OffersCard';
import AdvertisingBanner from '@/components/dashboard/AdvertisingBanner';
import AnalyticsAreaChart from '@/components/dashboard/AnalyticsAreaChart';
import AnalyticsDonutChart from '@/components/dashboard/AnalyticsDonutChart';
import AnalyticsBarChart from '@/components/dashboard/AnalyticsBarChart';
import ProtectFamilyCard from '@/components/dashboard/ProtectFamilyCard';
import ReportsModal from '@/components/dashboard/ReportsModal';
import PolicyDetailModal from '@/components/dashboard/PolicyDetailModal';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    // Policy Detail Modal State
    const [isPolicyDetailOpen, setIsPolicyDetailOpen] = useState(false);
    const [policyDetailType, setPolicyDetailType] = useState<'total' | 'premium' | 'expiring'>('total');
    const [policyDetailTitle, setPolicyDetailTitle] = useState('');

    // Store actual policy data
    const [motorPolicies, setMotorPolicies] = useState<MotorPolicy[]>([]);
    const [gmcPolicies, setGmcPolicies] = useState<GMCPolicy[]>([]);
    const [commercialPolicies, setCommercialPolicies] = useState<CommercialPolicy[]>([]);

    // Policy Counts for Cards
    const [policyCounts, setPolicyCounts] = useState({
        motor: 0,
        gmc: 0,
        commercial: 0
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);
                await loadDashboardData(currentUser.id);
            } catch (error) {
                console.error('[Dashboard] Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const loadDashboardData = async (userId: string) => {
        try {
            const [motor, gmc, commercial, userClaims, userReferrals] = await Promise.all([
                getUserMotorPolicies(userId),
                getUserGMCPolicies(userId),
                getUserCommercialPolicies(userId),
                getUserClaims(userId),
                getUserReferrals(userId)
            ]);

            // Store policy data for modal
            setMotorPolicies(motor);
            setGmcPolicies(gmc);
            setCommercialPolicies(commercial);

            setClaims(userClaims);
            setReferrals(userReferrals);
            setPolicyCounts({
                motor: motor.length,
                gmc: gmc.length,
                commercial: commercial.length
            });

            // Calculate portfolio summary
            const motorPremium = motor.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const gmcPremium = gmc.reduce((sum, p) => sum + Number(p.premium_amount), 0);

            const gpaPolicies = commercial.filter((p) => p.lob_type === 'GPA');
            const firePolicies = commercial.filter((p) => p.lob_type === 'Fire');
            const otherPolicies = commercial.filter((p) => p.lob_type === 'Other');

            const gpaPremium = gpaPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const firePremium = firePolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const othersPremium = otherPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);

            const allPolicies = [...motor, ...gmc, ...commercial];

            // Calculate expiring soon (mock logic for now as db returns strings)
            const now = new Date();
            const twentyDaysFromNow = new Date();
            twentyDaysFromNow.setDate(now.getDate() + 20);

            let expiringCount = 0;
            allPolicies.forEach(p => {
                const date = new Date('policy_end_date' in p ? p.policy_end_date : p.expiry_date);
                if (date > now && date <= twentyDaysFromNow) expiringCount++;
            });

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
                total_policies: allPolicies.length,
                total_premium: motorPremium + gmcPremium + gpaPremium + firePremium + othersPremium,
                expiring_soon_count: expiringCount,
                portfolio_by_lob: {
                    motor: motorPremium,
                    gmc: gmcPremium,
                    gpa: gpaPremium,
                    fire: firePremium,
                    others: othersPremium,
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
        setPolicyDetailType('total');
        setPolicyDetailTitle('All Policies');
        setIsPolicyDetailOpen(true);
    };

    const handleTotalPremiumClick = () => {
        setPolicyDetailType('premium');
        setPolicyDetailTitle('Premium Breakdown');
        setIsPolicyDetailOpen(true);
    };

    const handleExpiringClick = () => {
        setPolicyDetailType('expiring');
        setPolicyDetailTitle('Expiring Soon');
        setIsPolicyDetailOpen(true);
    };

    return (
        <div className="space-y-6">
            <ReportsModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
            <PolicyDetailModal
                isOpen={isPolicyDetailOpen}
                onClose={() => setIsPolicyDetailOpen(false)}
                title={policyDetailTitle}
                type={policyDetailType}
                motorPolicies={motorPolicies}
                gmcPolicies={gmcPolicies}
                commercialPolicies={commercialPolicies}
            />

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Policies - Clickable */}
                <div
                    onClick={handleTotalPoliciesClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Total Policies</p>
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
                    onClick={handleTotalPremiumClick}
                    className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Total Premium</p>
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
            </div>

            {/* Main Content Grid - Charts First */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Area Chart Section */}
                    <div className="h-[400px]">
                        <AnalyticsAreaChart data={(summary as any).areaChartData} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 h-[320px]">
                        <ClaimsOverview
                            activeCount={activeClaims}
                            settledCount={settledClaims}
                            rejectedCount={rejectedClaims}
                        />
                        <div className="h-full">
                            <AnalyticsBarChart data={(summary as any).barChartData} />
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-6">
                    <div className="h-[400px]">
                        <AnalyticsDonutChart data={summary.portfolio_by_lob} />
                    </div>
                    {/* Protect Family Card */}
                    <div className="h-[320px]">
                        <ProtectFamilyCard />
                    </div>
                </div>
            </div>

            {/* Policy Categories */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <PolicyCategoryCard
                        title="Motor"
                        count={policyCounts.motor}
                        icon={Car}
                        href="/motor"
                        color="blue"
                    />
                    <PolicyCategoryCard
                        title="Health"
                        count={policyCounts.gmc}
                        icon={Heart}
                        href="/gmc"
                        color="green"
                    />
                    <PolicyCategoryCard
                        title="Commercial"
                        count={policyCounts.commercial}
                        icon={Briefcase}
                        href="/commercial"
                        color="purple"
                    />
                    <PolicyCategoryCard
                        title="Life"
                        count={0}
                        icon={Umbrella}
                        href="/quotes?type=Life"
                        color="pink"
                    />
                    <PolicyCategoryCard
                        title="Travel"
                        count={0}
                        icon={Plane}
                        href="/quotes?type=Travel"
                        color="orange"
                    />
                    <PolicyCategoryCard
                        title="Cyber"
                        count={0}
                        icon={Shield}
                        href="/quotes?type=Cyber"
                        color="indigo"
                    />
                </div>
            </div>

            {/* Exclusive Offers & Rewards Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exclusive Offers & Rewards</h2>
                <div className="grid md:grid-cols-3 gap-4">
                </div>

                {/* Advertising */}
                <div>
                    <AdvertisingBanner />
                </div>
            </div>
        </div >
    );
}
