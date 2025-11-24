#!/bin/bash
# Helper script to update Supabase credentials
# Usage: bash update_supabase_env.sh "YOUR_PROJECT_URL" "YOUR_ANON_KEY"

if [ "$#" -ne 2 ]; then
    echo "Usage: bash update_supabase_env.sh \"PROJECT_URL\" \"ANON_KEY\""
    echo "Example: bash update_supabase_env.sh \"https://xxxxx.supabase.co\" \"eyJ...\""
    exit 1
fi

PROJECT_URL="$1"
ANON_KEY="$2"

# Create or update .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF

echo "✅ Updated .env.local with new Supabase credentials"
echo "📋 Next steps:"
echo "   1. Go to Supabase Dashboard > SQL Editor"
echo "   2. Run the SQL from: supabase_schema.sql"
echo "   3. Restart dev server: npm run dev"
