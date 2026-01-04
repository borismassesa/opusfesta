#!/bin/bash

# Script to copy Supabase environment variables from website app to admin app

WEBSITE_ENV="../website/.env.local"
ADMIN_ENV=".env.local"

if [ ! -f "$WEBSITE_ENV" ]; then
  echo "❌ Error: $WEBSITE_ENV not found"
  echo "Please make sure Supabase is configured in the website app first."
  exit 1
fi

echo "📋 Copying Supabase environment variables from website app..."

# Extract Supabase variables
grep -E "NEXT_PUBLIC_SUPABASE" "$WEBSITE_ENV" > "$ADMIN_ENV" 2>/dev/null

if [ -s "$ADMIN_ENV" ]; then
  echo "✅ Created $ADMIN_ENV with Supabase configuration"
  echo ""
  echo "Contents:"
  cat "$ADMIN_ENV"
else
  echo "⚠️  No Supabase variables found in website .env.local"
  echo "Please add the following to $ADMIN_ENV:"
  echo ""
  echo "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
  echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key"
fi
