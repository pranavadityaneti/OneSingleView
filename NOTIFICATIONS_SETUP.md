# Notifications Setup

The notifications feature requires running a database migration before it will work properly.

## Steps to Enable Notifications

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Run the migration file: `migrations/create_notifications_table.sql`

This will create the `notifications` table with proper Row Level Security (RLS) policies.

## What the Migration Does

- Creates a `notifications` table with fields for:
  - `id`: Unique identifier
  - `user_id`: Reference to the user
  - `title`: Notification title
  - `message`: Notification content
  - `type`: Category (info, warning, success, error)
  - `is_read`: Read status
  - `created_at`: Timestamp

- Sets up RLS policies so users can only see/update their own notifications

## Error Handling

The NotificationsMenu component has been updated to gracefully handle the case where the notifications table doesn't exist yet. It will:
- Silently suppress table-not-found errors
- Display "No notifications yet" instead of crashing
- Continue to work once the migration is run

You can safely use the application before running the migration - the notifications feature will simply show as empty until the table is created.
