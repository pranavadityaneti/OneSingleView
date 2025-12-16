-- Migration: extend_notifications_table.sql
-- Extends the existing notifications table with additional notification types and helper functions

-- Add metadata column if it doesn't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update the type constraint to include policy-specific notification types
-- First, drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with extended types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
    type IN (
        'info', 'warning', 'success', 'error',
        'policy_expiring_30',
        'policy_expiring_15', 
        'policy_expiring_7',
        'policy_expired',
        'policy_renewed',
        'claim_submitted',
        'claim_updated',
        'claim_approved',
        'claim_rejected',
        'document_uploaded',
        'quote_received',
        'welcome',
        'system'
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and create policy expiry notifications
-- This should be run as a scheduled job (e.g., daily via pg_cron or Supabase scheduled functions)
CREATE OR REPLACE FUNCTION check_policy_expiry_notifications()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
    days_until_expiry INTEGER;
    notification_type TEXT;
    notification_exists BOOLEAN;
BEGIN
    -- Check Motor policies
    FOR policy_record IN 
        SELECT id, user_id, vehicle_number, policy_end_date, insurer_name
        FROM motor_policies 
        WHERE policy_end_date IS NOT NULL
        AND policy_end_date >= CURRENT_DATE
        AND policy_end_date <= CURRENT_DATE + INTERVAL '30 days'
        AND (status IS NULL OR status != 'History')
    LOOP
        days_until_expiry := (policy_record.policy_end_date - CURRENT_DATE);
        
        -- Determine notification type
        IF days_until_expiry <= 7 THEN
            notification_type := 'policy_expiring_7';
        ELSIF days_until_expiry <= 15 THEN
            notification_type := 'policy_expiring_15';
        ELSIF days_until_expiry <= 30 THEN
            notification_type := 'policy_expiring_30';
        ELSE
            CONTINUE;
        END IF;
        
        -- Check if notification already exists for this policy and type (within last 24 hours)
        SELECT EXISTS(
            SELECT 1 FROM notifications 
            WHERE user_id = policy_record.user_id 
            AND type = notification_type
            AND metadata->>'policy_id' = policy_record.id::text
            AND created_at > NOW() - INTERVAL '1 day'
        ) INTO notification_exists;
        
        IF NOT notification_exists THEN
            PERFORM create_notification(
                policy_record.user_id,
                notification_type,
                CASE 
                    WHEN days_until_expiry <= 7 THEN 'Policy Expiring Soon!'
                    WHEN days_until_expiry <= 15 THEN 'Renewal Reminder'
                    ELSE 'Upcoming Renewal'
                END,
                format('Your Motor policy for %s expires in %s days. Renew now to avoid coverage gap.', 
                    policy_record.vehicle_number, days_until_expiry),
                jsonb_build_object(
                    'policy_id', policy_record.id,
                    'policy_number', policy_record.vehicle_number,
                    'days_until_expiry', days_until_expiry,
                    'insurer', policy_record.insurer_name
                )
            );
        END IF;
    END LOOP;
    
    -- Check Health policies
    FOR policy_record IN 
        SELECT id, user_id, policy_number, expiry_date, insurer_name
        FROM health_policies 
        WHERE expiry_date IS NOT NULL
        AND expiry_date >= CURRENT_DATE
        AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        AND (status IS NULL OR status != 'History')
    LOOP
        days_until_expiry := (policy_record.expiry_date - CURRENT_DATE);
        
        IF days_until_expiry <= 7 THEN
            notification_type := 'policy_expiring_7';
        ELSIF days_until_expiry <= 15 THEN
            notification_type := 'policy_expiring_15';
        ELSIF days_until_expiry <= 30 THEN
            notification_type := 'policy_expiring_30';
        ELSE
            CONTINUE;
        END IF;
        
        SELECT EXISTS(
            SELECT 1 FROM notifications 
            WHERE user_id = policy_record.user_id 
            AND type = notification_type
            AND metadata->>'policy_id' = policy_record.id::text
            AND created_at > NOW() - INTERVAL '1 day'
        ) INTO notification_exists;
        
        IF NOT notification_exists THEN
            PERFORM create_notification(
                policy_record.user_id,
                notification_type,
                CASE 
                    WHEN days_until_expiry <= 7 THEN 'Policy Expiring Soon!'
                    WHEN days_until_expiry <= 15 THEN 'Renewal Reminder'
                    ELSE 'Upcoming Renewal'
                END,
                format('Your Health policy (%s) expires in %s days. Renew now to maintain your coverage.', 
                    policy_record.policy_number, days_until_expiry),
                jsonb_build_object(
                    'policy_id', policy_record.id,
                    'policy_number', policy_record.policy_number,
                    'days_until_expiry', days_until_expiry,
                    'insurer', policy_record.insurer_name
                )
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create welcome notification for new users (trigger function)
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
        NEW.id,
        'welcome',
        'Welcome to OneSingleView!',
        'Thank you for joining OneSingleView. Start by adding your insurance policies to get a unified view of all your coverage.',
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create welcome notification on new user signup
DROP TRIGGER IF EXISTS trigger_welcome_notification ON users;
CREATE TRIGGER trigger_welcome_notification
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_welcome_notification();

-- Trigger function for claim status changes
CREATE OR REPLACE FUNCTION notify_claim_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_type TEXT;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Only trigger on UPDATE when status changes
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Determine notification based on new status
        CASE NEW.status
            WHEN 'Approved', 'Settled' THEN
                notification_type := 'claim_approved';
                notification_title := 'Claim Approved!';
                notification_message := format('Great news! Your claim #%s has been approved.', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8)));
            WHEN 'Rejected' THEN
                notification_type := 'claim_rejected';
                notification_title := 'Claim Rejected';
                notification_message := format('Unfortunately, your claim #%s has been rejected. Contact support for more details.', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8)));
            ELSE
                notification_type := 'claim_updated';
                notification_title := 'Claim Status Updated';
                notification_message := format('Your claim #%s status has been updated to "%s".', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8)), NEW.status);
        END CASE;
        
        -- Create the notification
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.user_id,
            notification_type,
            notification_title,
            notification_message,
            jsonb_build_object(
                'claim_id', NEW.id,
                'claim_number', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8)),
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    
    -- Also trigger on INSERT (new claim submitted)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.user_id,
            'claim_submitted',
            'Claim Submitted Successfully',
            format('Your claim #%s has been submitted. We''ll notify you of any updates.', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8))),
            jsonb_build_object(
                'claim_id', NEW.id,
                'claim_number', COALESCE(NEW.claim_number, LEFT(NEW.id::text, 8))
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for claim status changes
DROP TRIGGER IF EXISTS trigger_claim_notification ON claims;
CREATE TRIGGER trigger_claim_notification
    AFTER INSERT OR UPDATE OF status ON claims
    FOR EACH ROW
    EXECUTE FUNCTION notify_claim_status_change();

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION check_policy_expiry_notifications TO service_role;
GRANT EXECUTE ON FUNCTION notify_claim_status_change TO service_role;

-- Comment on functions
COMMENT ON FUNCTION create_notification IS 'Creates a new notification for a user';
COMMENT ON FUNCTION check_policy_expiry_notifications IS 'Checks all policies and creates expiry notifications. Run daily via scheduler.';
COMMENT ON FUNCTION notify_claim_status_change IS 'Automatically creates notifications when claim status changes.';

