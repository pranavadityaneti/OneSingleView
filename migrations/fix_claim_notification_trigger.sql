-- Migration: fix_claim_notification_trigger.sql
-- Fixes the trigger that references a non-existent claim_number column

-- Recreate the trigger function to use id instead of claim_number
CREATE OR REPLACE FUNCTION notify_claim_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_type TEXT;
    notification_title TEXT;
    notification_message TEXT;
    claim_ref TEXT;
BEGIN
    -- Use first 8 chars of ID as claim reference
    claim_ref := LEFT(NEW.id::text, 8);
    
    -- Only trigger on UPDATE when status changes
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Determine notification based on new status
        CASE NEW.status
            WHEN 'Approved', 'Settled' THEN
                notification_type := 'claim_approved';
                notification_title := 'Claim Approved!';
                notification_message := format('Great news! Your claim #%s has been approved.', claim_ref);
            WHEN 'Rejected' THEN
                notification_type := 'claim_rejected';
                notification_title := 'Claim Rejected';
                notification_message := format('Unfortunately, your claim #%s has been rejected. Contact support for more details.', claim_ref);
            ELSE
                notification_type := 'claim_updated';
                notification_title := 'Claim Status Updated';
                notification_message := format('Your claim #%s status has been updated to "%s".', claim_ref, NEW.status);
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
                'claim_number', claim_ref,
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
            format('Your claim #%s has been submitted. We''ll notify you of any updates.', claim_ref),
            jsonb_build_object(
                'claim_id', NEW.id,
                'claim_number', claim_ref
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
