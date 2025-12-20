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
    const [activeTab, setActiveTab] = useState<'notifications' | 'help'>('notifications');

    // Help & Suggestions Data
    const faqs = [
        {
            question: "How do I renew my policy?",
            answer: "Go to the Dashboard, click on 'Expiring Soon' card, select your policy, and click the 'Renew' button."
        },
        {
            question: "How do I raise a claim?",
            answer: "Click on 'Register New Claim' in the Claims Overview section on your dashboard."
        },
        {
            question: "Where can I find my policy document?",
            answer: "Click on any policy card in the 'Total Active Policies' list to view details and download documents."
        }
    ];

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
                        {/* Header Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'notifications'
                                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('help')}
                                className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'help'
                                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Help & Suggestions
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {activeTab === 'notifications' ? (
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
                            ) : (
                                <div className="p-4 space-y-4">
                                    {/* WhatsApp Section */}
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Need Instant Help?</h4>
                                                <p className="text-xs text-gray-600">Chat with our support team</p>
                                            </div>
                                        </div>
                                        <a
                                            href="https://wa.me/917075422949"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full py-2 bg-[#25D366] hover:bg-[#20ba5c] text-white rounded-lg text-sm font-bold transition-all shadow-sm"
                                        >
                                            Chat on WhatsApp
                                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                        </a>
                                    </div>

                                    {/* FAQs */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Frequently Asked Questions</h4>
                                        <div className="space-y-3">
                                            {faqs.map((faq, idx) => (
                                                <details key={idx} className="group border border-gray-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                                    <summary className="flex cursor-pointer items-center justify-between p-3 text-gray-900 font-medium hover:bg-gray-50 text-sm">
                                                        {faq.question}
                                                        <ChevronRight className="h-4 w-4 text-gray-500 transition duration-300 group-open:rotate-90" />
                                                    </summary>
                                                    <div className="p-3 pt-0 text-xs text-gray-600 leading-relaxed bg-gray-50/50">
                                                        {faq.answer}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contact Support */}
                                    <div className="pt-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">More Options</h4>
                                        <button className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                                            <HelpCircle className="w-4 h-4 text-primary-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Contact Support</p>
                                                <p className="text-xs text-gray-500">Email or call our support team</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
