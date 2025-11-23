'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
    Calculator
} from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';

interface SidebarProps {
    user: User;
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

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [openGroups, setOpenGroups] = useState<string[]>(['Overview', 'Policies', 'Claims', 'Documents', 'Community', 'Admin']);

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
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-100 shadow-soft">
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

                {/* User Info (Bottom) */}
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                await signOut();
                                router.push('/login');
                                router.refresh();
                            } catch (error) {
                                console.error('Error signing out:', error);
                            }
                        }}
                        className="flex items-center w-full px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
