'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Car, Heart, Briefcase, FileText, X, Loader2 } from 'lucide-react';
import { getUserMotorPolicies, getUserHealthPolicies, getUserCommercialPolicies, getUserClaims } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { calculatePolicyStatus } from '@/lib/utils';

export default function GlobalSearch() {
    const router = useRouter();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const search = async () => {
            if (!query.trim() || !user) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Fetch all data (in a real app, we'd have a dedicated search API)
                const [motor, gmc, commercial, claims] = await Promise.all([
                    getUserMotorPolicies(user.id),
                    getUserHealthPolicies(user.id),
                    getUserCommercialPolicies(user.id),
                    getUserClaims(user.id)
                ]);

                const lowerQuery = query.toLowerCase();

                const motorResults = motor.filter(p =>
                    p.policy_number.toLowerCase().includes(lowerQuery) ||
                    p.vehicle_number.toLowerCase().includes(lowerQuery) ||
                    p.insurer_name.toLowerCase().includes(lowerQuery)
                ).map(p => ({ ...p, type: 'Motor', url: `/policies/motor/${p.id}` }));

                const gmcResults = gmc.filter(p =>
                    p.policy_number.toLowerCase().includes(lowerQuery) ||
                    (p.company_name && p.company_name.toLowerCase().includes(lowerQuery)) ||
                    p.insurer_name.toLowerCase().includes(lowerQuery)
                ).map(p => ({ ...p, type: 'Health', url: `/policies/health/${p.id}` }));

                const commercialResults = commercial.filter(p =>
                    p.policy_number.toLowerCase().includes(lowerQuery) ||
                    (p.company_name && p.company_name.toLowerCase().includes(lowerQuery)) ||
                    p.insurer_name.toLowerCase().includes(lowerQuery)
                ).map(p => ({ ...p, type: 'Commercial', url: `/policies/commercial/${p.id}` }));

                const claimResults = claims.filter(c =>
                    c.claim_type.toLowerCase().includes(lowerQuery) ||
                    c.description.toLowerCase().includes(lowerQuery)
                ).map(c => ({ ...c, type: 'Claim', url: `/claims/${c.id}` })); // Assuming claims page exists

                setResults([...motorResults, ...gmcResults, ...commercialResults, ...claimResults]);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query, user]);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                    type="search"
                    className="block w-full pl-11 pr-10 py-3 border-none rounded-2xl leading-5 bg-white shadow-soft placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 sm:text-sm"
                    placeholder="Search policies, claims..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                    </div>
                )}
                {!loading && query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && query && (
                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <div className="py-2">
                            {results.map((item: any, index) => {
                                const Icon = item.type === 'Motor' ? Car :
                                    item.type === 'Health' ? Heart :
                                        item.type === 'Commercial' ? Briefcase : FileText;
                                const colorClass = item.type === 'Motor' ? 'text-blue-600 bg-blue-50' :
                                    item.type === 'Health' ? 'text-green-600 bg-green-50' :
                                        item.type === 'Commercial' ? 'text-purple-600 bg-purple-50' : 'text-orange-600 bg-orange-50';

                                return (
                                    <button
                                        key={`${item.type}-${item.id}-${index}`}
                                        onClick={() => handleSelect(item.url)}
                                        className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <div className={`p-2 rounded-lg ${colorClass} mr-3`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.insurer_name || item.claim_type || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {item.policy_number || item.description}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2">{item.type}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        !loading && (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
