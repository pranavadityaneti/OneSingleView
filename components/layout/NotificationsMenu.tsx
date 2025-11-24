import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
    // Temporarily disabled as per user request due to errors
    return null;
}
