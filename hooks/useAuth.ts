'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (mounted) {
                    setUser(currentUser);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = onAuthStateChange((user) => {
            if (mounted) {
                setUser(user);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
