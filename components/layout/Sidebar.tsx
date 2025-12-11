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
// import InsuranceTipsCarousel from './InsuranceTipsCarousel';

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
    const [openGroups, setOpenGroups] = useState<string[]>(['Overview', 'Policies', 'Claims', 'Quick Actions', 'Documents', 'Community', 'Admin']);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

            {/* User Profile Section (Top) */}
            <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex flex-col items-center text-center space-y-3">
                    {/* Profile Picture */}
                    <div className="relative group">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Loading Overlay */}
                        {isUploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}

                        {/* Edit Overlay */}
                        {!isUploadingAvatar && (
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                    <UserCircle className="w-5 h-5 text-white" />
                                </div>
                            </label>
                        )}
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingAvatar}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || isUploadingAvatar) return;

                                setIsUploadingAvatar(true);

                                try {
                                    const { uploadAvatar } = await import('@/lib/db');

                                    const url = await uploadAvatar(user.id, file);

                                    if (url) {
                                        // Update user object with new avatar URL
                                        user.avatar_url = url;
                                        // Use router.refresh() instead of full page reload
                                        router.refresh();
                                        setIsUploadingAvatar(false);
                                    } else {
                                        console.error('[Avatar Upload] Upload returned null');
                                        setIsUploadingAvatar(false);
                                        alert('Failed to upload image. Please check console for details.');
                                    }
                                } catch (error) {
                                    console.error('[Avatar Upload] Error:', error);
                                    setIsUploadingAvatar(false);
                                    alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                } finally {
                                    // Reset file input
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>

                    {/* User Name */}
                    <div className="w-full">
                        <p className="text-base font-bold text-gray-900 truncate">
                            {user.name}
                        </p>
                        {/* Company Name - for corporate users */}
                        {user.company_name && (
                            <p className="text-sm text-gray-700 mt-0.5 font-medium truncate">
                                {user.company_name}
                            </p>
                        )}
                        {/* Customer ID */}
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            ID: {user.customer_id || 'N/A'}
                        </p>
                    </div>

                    {/* Action Buttons - Side by Side */}
                    <div className="flex gap-2 w-full">
                        <Link
                            href="/profile"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <UserCircle className="w-3.5 h-3.5" />
                            Profile
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
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
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
            {/* Insurance Tips Carousel - Removed as per request */}
            {/* <div className="mt-auto">
                <InsuranceTipsCarousel />
            </div> */}
        </aside>
    );
}
