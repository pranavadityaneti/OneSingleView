'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserMotorPolicies, getUserHealthPolicies, getUserCommercialPolicies, getUserClaims, getUserReferrals } from '@/lib/db';
import { User, MotorPolicy, HealthPolicy, CommercialPolicy, DashboardSummary, Claim, Referral } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Plane, Shield, Umbrella, FileText, TrendingUp, AlertCircle, Calculator, ChevronRight } from 'lucide-react';
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
import StickyAddPolicy from '@/components/dashboard/StickyAddPolicy';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

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

    // Add Policy Modal State
    const [selectedType, setSelectedType] = useState<'total' | 'premium' | 'expiring'>('total');
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

    // Store actual policy data
    const [motorPolicies, setMotorPolicies] = useState<MotorPolicy[]>([]);
    const [healthPolicies, setHealthPolicies] = useState<HealthPolicy[]>([]);
    const [commercialPolicies, setCommercialPolicies] = useState<CommercialPolicy[]>([]);

    // Policy Counts for Cards
    const [policyCounts, setPolicyCounts] = useState({
        motor: 0,
        health: 0,
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
            const [motor, healthData, commercial, userClaims, userReferrals] = await Promise.all([
                getUserMotorPolicies(userId),
                getUserHealthPolicies(userId),
                getUserCommercialPolicies(userId),
                getUserClaims(userId),
                getUserReferrals(userId)
            ]);

            // Store policy data for modal with calculated status
            const processPolicy = (p: any) => {
                const endDate = new Date('policy_end_date' in p ? p.policy_end_date : p.expiry_date);
                const status = calculatePolicyStatus(endDate);
                return { ...p, status };
            };

            const processedMotor = motor.map(processPolicy);
            const processedHealth = healthData.map(processPolicy);
            const processedCommercial = commercial.map(processPolicy);

            setMotorPolicies(processedMotor);
            setHealthPolicies(processedHealth);
            setCommercialPolicies(processedCommercial);

            setClaims(userClaims);
            setReferrals(userReferrals);
            setPolicyCounts({
                motor: motor.length,
                health: healthData.length,
                commercial: commercial.length
            });

            // Calculate portfolio summary
            const motorPremium = motor.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const healthPremium = healthData.reduce((sum, p) => sum + Number(p.premium_amount), 0);

            const gpaPolicies = commercial.filter((p) => p.lob_type === 'GPA');
            const firePolicies = commercial.filter((p) => p.lob_type === 'Fire');
            const otherPolicies = commercial.filter((p) => p.lob_type === 'Other');

            const gpaPremium = gpaPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const firePremium = firePolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
            const othersPremium = otherPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0);

            const allPolicies = [...processedMotor, ...processedHealth, ...processedCommercial];

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
                total_policies: allPolicies.length,
                total_premium: motorPremium + healthPremium + gpaPremium + firePremium + othersPremium,
                expiring_soon_count: expiringCount,
                portfolio_by_lob: {
                    motor: motorPremium,
                    health: healthPremium,
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
                healthPolicies={healthPolicies}
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

            {/* Quick Access */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div onClick={() => router.push('/policies?type=Motor')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                            <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Motor</p>
                    </div>

                    <div onClick={() => router.push('/policies?type=Health')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                            <Heart className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Health</p>
                    </div>

                    <div onClick={() => router.push('/policies?type=Travel')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                            <Plane className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Travel</p>
                    </div>

                    <div onClick={() => router.push('/policies?type=Commercial')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                            <Briefcase className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Commercial</p>
                    </div>

                    <div onClick={() => router.push('/policies?type=Life')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
                            <Umbrella className="w-5 h-5 text-pink-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Life</p>
                    </div>

                    <div onClick={() => router.push('/policies?type=Cyber')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center">
                        <div className="w-10 h-10 mx-auto bg-cyan-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-cyan-100 transition-colors">
                            <Shield className="w-5 h-5 text-cyan-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Cyber</p>
                    </div>
                </div>
            </div>

            {/* Analytics & Insights Section */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column (2/3 width on desktop) */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Monthly Activity - Area Chart */}
                    <div className="h-[400px]">
                        <AnalyticsAreaChart data={(summary as any).areaChartData} />
                    </div>

                    {/* Claims Overview and Bar Chart - Side by side on desktop, stacked on mobile */}
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

                {/* Right Column (1/3 width on desktop) */}
                <div className="space-y-6">
                    {/* Source of Premium - Donut Chart */}
                    <div className="h-[400px]">
                        <AnalyticsDonutChart data={summary.portfolio_by_lob} />
                    </div>

                    {/* Protect Family Card */}
                    <div className="h-[320px]">
                        <ProtectFamilyCard onGetQuote={() => setIsHealthModalOpen(true)} />
                    </div>
                </div>
            </div>

            {/* Exclusive Offers & Rewards Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exclusive Offers & Rewards</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Offers content would go here */}
                </div>
            </div>

            {/* Advertising */}
            <div>
                <AdvertisingBanner />
            </div>

            <StickyAddPolicy userId={user.id} />

            <AddPolicyModal
                isOpen={isHealthModalOpen}
                onClose={() => setIsHealthModalOpen(false)}
                userId={user.id}
                initialType="Health"
                onSuccess={() => {
                    setIsHealthModalOpen(false);
                    // Trigger a reload by toggling a state or re-fetching
                    // Since loadDashboardData is not accessible here (it's inside useEffect),
                    // we should probably move it out or just reload the page.
                    // For now, let's reload the page as a simple fix.
                    window.location.reload();
                }}
            />
        </div>
    );
}
