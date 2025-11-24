#!/bin/bash
# Helper script to copy the SQL migration to clipboard
# Usage: bash copy_migration.sh

if command -v pbcopy &> /dev/null; then
    cat fix_dashboard_schema.sql | pbcopy
    echo "✅ SQL migration copied to clipboard!"
    echo ""
    echo "Next steps:"
    echo "1. Open your Supabase dashboard: https://supabase.com/dashboard"
    echo "2. Navigate to: SQL Editor → New Query"
    echo "3. Paste the SQL (Cmd+V)"
    echo "4. Click 'Run' button"
    echo "5. Verify 'Success' message appears"
else
    echo "❌ pbcopy not found (macOS only)"
    echo "Please manually copy the contents of fix_dashboard_schema.sql"
fi
