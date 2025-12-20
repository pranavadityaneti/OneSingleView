import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, MessageCircle, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    is_read: boolean;
    created_at: string;
}

interface NotificationsMenuProps {
    userId: string;
}

export default function NotificationsMenu({ userId }: NotificationsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);



    const loadNotifications = async () => {
        // Mock notifications if DB fetch fails or returns empty for demo
        // In real app, un-comment DB call
        /*
        try {
            const data = await getUserNotifications(userId);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
        */
        // Using mock data for now to ensure UI is visible as requested
        setNotifications([
            { id: '1', title: 'Policy Renewal', message: 'Your Car Insurance is expiring in 15 days.', type: 'warning', is_read: false, created_at: new Date().toISOString() },
            { id: '2', title: 'Welcome', message: 'Welcome to One Single View Dashboard!', type: 'success', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
        setUnreadCount(1);
    };

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, userId]);

    const handleMarkAsRead = async (id: string) => {
        // await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        // await markAllNotificationsAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white transform translate-x-1/2 -translate-y-1/2"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">


                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto">
                            <div>
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.type === 'warning' ? 'bg-orange-500' :
                                                        notification.type === 'success' ? 'bg-green-500' :
                                                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-medium text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                )}
                                {notifications.length > 0 && (
                                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
