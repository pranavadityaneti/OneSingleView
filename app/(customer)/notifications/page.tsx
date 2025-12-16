'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    subscribeToNotifications,
    Notification,
    NotificationType
} from '@/lib/notifications';
import { User } from '@/types';
import {
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Shield,
    Calendar,
    Check,
    Trash2,
    RefreshCw,
    Loader2
} from 'lucide-react';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'policy_expiring_7':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        case 'policy_expiring_15':
            return <Clock className="w-5 h-5 text-orange-500" />;
        case 'policy_expiring_30':
            return <Calendar className="w-5 h-5 text-yellow-500" />;
        case 'policy_expired':
            return <AlertCircle className="w-5 h-5 text-red-600" />;
        case 'policy_renewed':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'claim_submitted':
        case 'claim_updated':
            return <FileText className="w-5 h-5 text-blue-500" />;
        case 'claim_approved':
        case 'success':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'claim_rejected':
        case 'error':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        case 'document_uploaded':
            return <FileText className="w-5 h-5 text-purple-500" />;
        case 'quote_received':
            return <Shield className="w-5 h-5 text-cyan-500" />;
        case 'welcome':
        case 'info':
            return <Bell className="w-5 h-5 text-blue-500" />;
        case 'warning':
            return <AlertCircle className="w-5 h-5 text-orange-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'bg-white';

    switch (type) {
        case 'policy_expiring_7':
        case 'policy_expired':
        case 'claim_rejected':
        case 'error':
            return 'bg-red-50';
        case 'policy_expiring_15':
        case 'warning':
            return 'bg-orange-50';
        case 'policy_expiring_30':
            return 'bg-yellow-50';
        case 'policy_renewed':
        case 'claim_approved':
        case 'success':
            return 'bg-green-50';
        default:
            return 'bg-blue-50';
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function NotificationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const loadNotifications = useCallback(async (userId: string) => {
        const data = await getUserNotifications(userId);
        setNotifications(data);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);
                await loadNotifications(currentUser.id);
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router, loadNotifications]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotifications(
            user.id,
            (newNotification) => {
                // Add new notification to the top of the list
                setNotifications(prev => [newNotification, ...prev]);
            },
            (updatedNotification) => {
                // Update existing notification
                setNotifications(prev =>
                    prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                );
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    const handleRefresh = async () => {
        if (!user || refreshing) return;
        setRefreshing(true);
        await loadNotifications(user.id);
        setRefreshing(false);
    };

    const handleMarkAsRead = async (id: string) => {
        const success = await markNotificationAsRead(id);
        if (success) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        const success = await markAllNotificationsAsRead(user.id);
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const handleDelete = async (id: string) => {
        const success = await deleteNotification(id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-primary-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 text-sm font-bold bg-red-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Stay updated with your policy and claim activity</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        {refreshing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                    </button>

                    {/* Filter Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-md transition-all ${filter === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-md transition-all ${filter === 'unread'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Unread
                        </button>
                    </div>

                    {/* Mark All Read Button */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-gray-500">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : "We'll notify you about policy renewals, claims, and more."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification.type, notification.is_read)
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                                        }`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={`text-sm font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                                    }`}>
                                                    {notification.title}
                                                    {!notification.is_read && (
                                                        <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </h4>
                                                <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-600'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTimeAgo(notification.created_at)}
                                            </span>
                                        </div>

                                        {/* Metadata badges */}
                                        {notification.metadata && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {notification.metadata.policy_number && (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                        {notification.metadata.policy_number}
                                                    </span>
                                                )}
                                                {notification.metadata.insurer && (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                        {notification.metadata.insurer}
                                                    </span>
                                                )}
                                                {notification.metadata.days_until_expiry !== undefined && (
                                                    <span className={`text-xs px-2 py-0.5 rounded ${notification.metadata.days_until_expiry <= 7
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {notification.metadata.days_until_expiry} days left
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 mt-3">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">📬 What you'll be notified about</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Policy expiry reminders (30, 15, and 7 days before)</li>
                    <li>• Claim status updates (submitted, approved, rejected)</li>
                    <li>• Quote requests and responses</li>
                    <li>• Document uploads and renewals</li>
                    <li>• Important account updates</li>
                </ul>
            </div>
        </div>
    );
}
