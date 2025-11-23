'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, AlertCircle, TrendingUp, Search, Filter, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllUsers } from '@/lib/db';
import { User } from '@/types';

export default function AdminDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePolicies: 0,
        pendingClaims: 0,
        revenue: 0
    });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        } else if (user?.role === 'admin') {
            loadDashboardData();
        }
    }, [user, loading, router]);

    const loadDashboardData = async () => {
        try {
            const users = await getAllUsers();
            setRecentUsers(users.slice(0, 5));
            setStats({
                totalUsers: users.length,
                activePolicies: 856, // Mock for now
                pendingClaims: 12,   // Mock for now
                revenue: 4520000     // Mock for now
            });
        } catch (error) {
            console.error('Failed to load admin dashboard data:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">Overview of platform activity and users</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link href="/admin/users" className="card bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">+12%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
                </Link>

                <div className="card bg-white p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">+5%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Active Policies</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activePolicies}</h3>
                </div>

                <div className="card bg-white p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">+2</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Pending Claims</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingClaims}</h3>
                </div>

                <div className="card bg-white p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">+8%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(stats.revenue / 100000).toFixed(1)}L</h3>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="card bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                    <Link href="/admin/users" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {recentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'corporate' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/users/${user.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                                    </td>
                                </tr>
                            ))}
                            {recentUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
