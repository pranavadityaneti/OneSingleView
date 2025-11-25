'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    History,
    FolderOpen,
    Users,
    AlertCircle,
    Shield,
    LogOut,
    ChevronDown,
    ChevronRight,
    PieChart,
    Files,
    MessageSquare,
    Calculator,
    UserCircle
} from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import InsuranceTipsCarousel from './InsuranceTipsCarousel';

interface SidebarProps {
    user: User;
    onClose?: () => void;
}

type NavItem = {
    label: string;
    href: string;
    icon: any;
};

type NavGroup = {
    label: string;
    items: NavItem[];
    icon?: any;
};

export default function Sidebar({ user, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [openGroups, setOpenGroups] = useState<string[]>(['Overview', 'Policies', 'Claims', 'Documents', 'Community', 'Admin']);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const toggleGroup = (label: string) => {
        setOpenGroups(prev =>
            prev.includes(label)
                ? prev.filter(g => g !== label)
                : [...prev, label]
        );
    };

    const navGroups: NavGroup[] = [
        {
            label: 'Overview',
            items: [
                { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
            ]
        },
        {
            label: 'Policies',
            items: [
                { href: '/policies', icon: FileText, label: 'All Policies' }
            ]
        },
        {
            label: 'Claims',
            items: [
                { href: '/claims', icon: AlertCircle, label: 'Claims' }
            ]
        },
        {
            label: 'Quick Actions',
            items: [
                { href: '/quotes', icon: Calculator, label: 'Get Quote' },
                { href: '/claims', icon: Shield, label: 'File Claim' }
            ]
        },
        {
            label: 'Documents',
            items: [
                { href: '/documents', icon: FolderOpen, label: 'Documents' },
                { href: '/history', icon: History, label: 'History' }
            ]
        }
    ];

    // Add Admin group if user is admin
    if (user.role === 'admin') {
        navGroups.push({
            label: 'Admin',
            items: [
                { href: '/admin/dashboard', icon: Shield, label: 'Admin Dashboard' },
                { href: '/admin/reports', icon: FileText, label: 'Reports & Exports' }
            ]
        });
    }

    return (
        <aside className="w-72 h-full bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-50">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-lg font-bold text-gray-900 tracking-tight">
                    PolicyPilot
                </span>
            </div>



            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-hide">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <button
                            onClick={() => toggleGroup(group.label)}
                            className="flex items-center justify-between w-full px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                        >
                            <span>{group.label}</span>
                            {openGroups.includes(group.label) ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                        </button>

                        {openGroups.includes(group.label) && (
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 group',
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-4 h-4 mr-3 transition-colors",
                                                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                                            )} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Insurance Tips Carousel */}
            <div className="mt-auto">
                <InsuranceTipsCarousel />
            </div>

            {/* User Info (Bottom) with Dropdown */}
            <div className="p-4 border-t border-gray-50 relative">
                <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 px-2 hover:bg-gray-50 p-2 rounded-xl transition-colors group w-full"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:shadow-lg transition-all">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <Link
                            href="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                            <UserCircle className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">My Profile</span>
                        </Link>
                        <Link
                            href="/support"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Support & FAQs</span>
                        </Link>
                        <button
                            onClick={async () => {
                                try {
                                    await signOut();
                                    router.push('/');
                                    router.refresh();
                                } catch (error) {
                                    console.error('Error signing out:', error);
                                }
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full border-t border-gray-100"
                        >
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Sign Out</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
