'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ErrorBoundary from '@/components/ErrorBoundary';
import { RefreshCw, WifiOff } from 'lucide-react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const checkAuth = async () => {
        setLoading(true);
        setConnectionError(false);

        try {
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                router.push('/login');
                return;
            }

            setUser(currentUser);
        } catch (error) {
            console.error('Auth check failed:', error);
            // Check if it's a timeout/connection error
            if (error instanceof Error && error.message.includes('timed out')) {
                setConnectionError(true);
                return; // Don't proceed with redirect
            }
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    if (connectionError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WifiOff className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Issue</h2>
                    <p className="text-gray-600 mb-6">
                        We're having trouble connecting to our servers. This could be due to a network issue or server maintenance.
                    </p>
                    <button
                        onClick={checkAuth}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Try Again
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        If this issue persists, please check your internet connection or contact support.
                    </p>
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
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
}
