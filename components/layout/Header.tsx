'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Mail, Phone, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationsMenu from './NotificationsMenu';
import { getUserRM } from '@/lib/db';
import { RMInfo } from '@/types';

interface HeaderProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    onMenuClick?: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [rmInfo, setRmInfo] = useState<RMInfo | null>(null);

    useEffect(() => {
        const loadRM = async () => {
            if (user?.id) {
                try {
                    const rm = await getUserRM(user.id);
                    setRmInfo(rm);
                } catch (error) {
                    console.error('Error loading RM info:', error);
                }
            }
        };
        loadRM();
    }, [user?.id]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.push(`/policies?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative mx-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search policies, claims, or documents..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all placeholder-gray-400 text-gray-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* RM Info - Desktop (large screens) */}
                {rmInfo && (
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                        {/* RM Icon */}
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-600">RM</span>
                        </div>

                        {/* RM Name Section */}
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{rmInfo.name}</span>
                        </div>

                        {/* Phone Number with Pipes */}
                        <div className="flex items-center gap-2 px-3 border-l border-r border-blue-200">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <a
                                href={`tel:${rmInfo.mobile}`}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                title="Click to call"
                            >
                                {rmInfo.mobile}
                            </a>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://wa.me/${rmInfo.mobile.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-50 hover:bg-green-100 rounded-full transition-colors"
                                title="Chat on WhatsApp"
                            >
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                            <a
                                href={`mailto:${rmInfo.email}`}
                                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                                title="Send Email"
                            >
                                <Mail className="w-4 h-4 text-blue-600" />
                            </a>
                        </div>
                    </div>
                )}

                {/* RM Info - Mobile & Tablet */}
                {rmInfo && (
                    <div className="flex lg:hidden items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">RM</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-blue-600 uppercase leading-tight">R.M.</span>
                            <span className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[100px]">{rmInfo.name}</span>
                        </div>
                        <a href={`tel:${rmInfo.mobile}`} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-full">
                            <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        </a>
                    </div>
                )}

                <NotificationsMenu userId={user.id} />
            </div>
        </header>
    );
}
