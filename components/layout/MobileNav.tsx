'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, PlusCircle, User, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Only show on mobile
    // We can use a CSS check or just assume this component is conditionally rendered by parent

    // Hide on login/signup pages
    if (pathname.includes('/login') || pathname.includes('/signup')) return null;

    const navItems = [
        { label: 'Home', icon: Home, path: '/dashboard' },
        { label: 'Policies', icon: FileText, path: '/dashboard/policies' }, // Example path
        { label: 'Add', icon: PlusCircle, path: '#add', special: true },
        { label: 'Profile', icon: User, path: '/dashboard/profile' },
        { label: 'Menu', icon: Menu, path: '/dashboard/menu' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area-bottom z-50 md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary-600' : 'text-gray-500'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${item.special ? 'text-primary-600' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
