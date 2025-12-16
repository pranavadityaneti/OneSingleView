import { supabase } from './supabase';

// Notification types
export type NotificationType =
    | 'policy_expiring_30'
    | 'policy_expiring_15'
    | 'policy_expiring_7'
    | 'policy_expired'
    | 'policy_renewed'
    | 'claim_submitted'
    | 'claim_updated'
    | 'claim_approved'
    | 'claim_rejected'
    | 'document_uploaded'
    | 'quote_received'
    | 'welcome'
    | 'system'
    | 'info'
    | 'warning'
    | 'success'
    | 'error';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    metadata?: {
        policy_id?: string;
        policy_number?: string;
        claim_id?: string;
        days_until_expiry?: number;
        insurer?: string;
        [key: string]: any;
    };
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserNotifications:', error);
        return [];
    }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Error in getUnreadNotificationCount:', error);
        return 0;
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        return false;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        return false;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            console.error('Error deleting notification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        return false;
    }
}

/**
 * Create a new notification
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
): Promise<Notification | null> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                metadata: metadata || {},
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in createNotification:', error);
        return null;
    }
}

/**
 * Subscribe to realtime notification updates
 * Returns an unsubscribe function
 */
export function subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: Notification) => void,
    onNotificationUpdate: (notification: Notification) => void
): () => void {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            },
            (payload: { new: Record<string, unknown> }) => {
                onNewNotification(payload.new as unknown as Notification);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            },
            (payload: { new: Record<string, unknown> }) => {
                onNotificationUpdate(payload.new as unknown as Notification);
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Create policy expiry notification
 * Called when checking for expiring policies
 */
export async function createPolicyExpiryNotification(
    userId: string,
    policyNumber: string,
    daysUntilExpiry: number,
    policyType: string,
    policyId: string,
    insurer?: string
): Promise<void> {
    let type: NotificationType;
    let title: string;

    if (daysUntilExpiry <= 0) {
        type = 'policy_expired';
        title = 'Policy Expired!';
    } else if (daysUntilExpiry <= 7) {
        type = 'policy_expiring_7';
        title = 'Policy Expiring Soon!';
    } else if (daysUntilExpiry <= 15) {
        type = 'policy_expiring_15';
        title = 'Renewal Reminder';
    } else {
        type = 'policy_expiring_30';
        title = 'Upcoming Renewal';
    }

    const message = daysUntilExpiry <= 0
        ? `Your ${policyType} policy (${policyNumber}) has expired. Renew immediately to restore coverage.`
        : `Your ${policyType} policy (${policyNumber}) expires in ${daysUntilExpiry} days. Renew now to avoid coverage gap.`;

    await createNotification(userId, type, title, message, {
        policy_id: policyId,
        policy_number: policyNumber,
        days_until_expiry: daysUntilExpiry,
        policy_type: policyType,
        insurer
    });
}

/**
 * Create claim status notification
 */
export async function createClaimNotification(
    userId: string,
    claimId: string,
    status: 'submitted' | 'updated' | 'approved' | 'rejected',
    claimNumber?: string
): Promise<void> {
    const typeMap: Record<string, NotificationType> = {
        submitted: 'claim_submitted',
        updated: 'claim_updated',
        approved: 'claim_approved',
        rejected: 'claim_rejected'
    };

    const titleMap: Record<string, string> = {
        submitted: 'Claim Submitted Successfully',
        updated: 'Claim Status Updated',
        approved: 'Claim Approved!',
        rejected: 'Claim Rejected'
    };

    const messageMap: Record<string, string> = {
        submitted: `Your claim ${claimNumber || ''} has been submitted successfully. We'll notify you of any updates.`,
        updated: `Your claim ${claimNumber || ''} status has been updated. Check the details.`,
        approved: `Great news! Your claim ${claimNumber || ''} has been approved.`,
        rejected: `Unfortunately, your claim ${claimNumber || ''} has been rejected. Contact support for more details.`
    };

    await createNotification(userId, typeMap[status], titleMap[status], messageMap[status], {
        claim_id: claimId,
        claim_number: claimNumber
    });
}
