'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Shield,
    Copy,
    AlertCircle,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
    label: string;
    href: string;
    icon: any;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<string[]>(['Overview', 'Management', 'Operations', 'Settings']);

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
                { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' }
            ]
        },
        {
            label: 'Management',
            items: [
                { icon: Users, label: 'User Management', href: '/admin/users' },
                { icon: FileText, label: 'Master Policies', href: '/admin/policies' }
            ]
        },
        {
            label: 'Operations',
            items: [
                { icon: AlertCircle, label: 'Claims Console', href: '/admin/claims' },
                { icon: FileText, label: 'Quote Requests', href: '/admin/quotes' },
                { icon: Copy, label: 'Deduplication', href: '/admin/duplicates' }
            ]
        },
        {
            label: 'Settings',
            items: [
                { icon: Settings, label: 'System Settings', href: '/admin/settings' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            1
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <button
                                onClick={() => toggleGroup(group.label)}
                                className="flex items-center justify-between w-full px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                            >
                                <span>{group.label}</span>
                                {openGroups.includes(group.label) ? (
                                    <ChevronDown className="w-3 h-3" />
                                ) : (
                                    <ChevronRight className="w-3 h-3" />
                                )}
                            </button>

                            {openGroups.includes(group.label) && (
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    isActive
                                                        ? 'bg-primary-50 text-primary-700'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-4 h-4 mr-3",
                                                    isActive ? 'text-primary-600' : 'text-gray-400'
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

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
