'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = onAuthStateChange((updatedUser) => {
            setUser(updatedUser);
            if (!updatedUser) {
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-soft font-sans text-slate-900">
            {/* Sidebar with mobile overlay */}
            <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar user={user} onClose={() => setIsMobileSidebarOpen(false)} />
            </div>

            <div className="lg:pl-72 transition-all duration-300">
                <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
