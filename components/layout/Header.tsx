'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { User } from '@/types';
import RelationshipManagerHeader from '@/components/dashboard/RelationshipManagerHeader';

interface HeaderProps {
    user: User;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <header className="bg-transparent sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <button className="lg:hidden -ml-2 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white shadow-sm transition-all">
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search bar (desktop) */}
                    <div className="hidden sm:block flex-1 max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="search"
                                className="block w-full pl-11 pr-4 py-3 border-none rounded-2xl leading-5 bg-white shadow-soft placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 sm:text-sm"
                                placeholder="Search policies, claims, or documents..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = (e.target as HTMLInputElement).value;
                                        if (query.trim()) {
                                            router.push(`/policies?search=${encodeURIComponent(query)}`);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Relationship Manager */}
                        <RelationshipManagerHeader />

                        {/* Notifications */}
                        <button className="p-3 text-gray-400 bg-white hover:text-primary-600 hover:bg-white shadow-soft rounded-xl relative transition-all duration-200 hover:-translate-y-0.5">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
