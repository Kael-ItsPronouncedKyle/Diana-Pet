#!/bin/bash
# Diana's Companion App — Supabase Setup Script
# This script walks you through setting up the Supabase backend.

set -e

echo ""
echo "🐾 Diana's Companion App — Supabase Setup"
echo "==========================================="
echo ""
echo "This script will help you set up the Supabase backend."
echo "You'll need a free Supabase account: https://supabase.com"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
  echo "⚠️  .env.local already exists. Contents:"
  cat .env.local
  echo ""
  read -p "Overwrite? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing .env.local"
    exit 0
  fi
fi

echo "📋 Step 1: Create a Supabase Project"
echo "-------------------------------------"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Name it 'diana-pet' (or anything you like)"
echo "4. Set a database password (save it somewhere safe)"
echo "5. Choose a region close to College Station, TX (e.g., US East)"
echo "6. Click 'Create new project' and wait for it to finish"
echo ""
read -p "Press Enter when your project is ready..."

echo ""
echo "📋 Step 2: Get your project credentials"
echo "----------------------------------------"
echo "1. Go to your project's Settings > API"
echo "2. Copy the 'Project URL' (looks like https://xxxxx.supabase.co)"
echo ""
read -p "Paste your Project URL: " SUPABASE_URL

echo ""
echo "3. Copy the 'anon public' key (the long one under 'Project API keys')"
echo ""
read -p "Paste your anon key: " SUPABASE_ANON_KEY

# Write .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo ""
echo "✅ Created .env.local with your credentials"
echo ""

echo "📋 Step 3: Run the database schema"
echo "-----------------------------------"
echo "1. Go to your Supabase project dashboard"
echo "2. Click 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy and paste the contents of supabase-schema.sql"
echo "5. Click 'Run' (or Cmd+Enter)"
echo ""
echo "The schema creates 3 tables: profiles, daily_entries, app_data"
echo "All with row-level security so only Diana can see her data."
echo ""
read -p "Press Enter when you've run the schema..."

echo ""
echo "📋 Step 4: Enable Google Auth"
echo "-----------------------------"
echo "1. In your Supabase project, go to Authentication > Providers"
echo "2. Find 'Google' and enable it"
echo "3. You need a Google OAuth Client ID and Secret:"
echo ""
echo "   a. Go to https://console.cloud.google.com/apis/credentials"
echo "   b. Create a new project (or use an existing one)"
echo "   c. Click 'Create Credentials' > 'OAuth client ID'"
echo "   d. Application type: 'Web application'"
echo "   e. Name: 'Diana Pet'"
echo "   f. Authorized redirect URIs: add your Supabase callback URL"
echo "      (shown in the Supabase Google provider settings)"
echo "      It looks like: ${SUPABASE_URL}/auth/v1/callback"
echo "   g. Copy the Client ID and Client Secret"
echo ""
echo "4. Paste them into the Supabase Google provider settings"
echo "5. Click 'Save'"
echo ""
read -p "Press Enter when Google Auth is configured..."

echo ""
echo "📋 Step 5: Set redirect URL"
echo "---------------------------"
echo "1. In Supabase, go to Authentication > URL Configuration"
echo "2. Set 'Site URL' to your deployed app URL"
echo "   (or http://localhost:5173 for local dev)"
echo "3. Add redirect URLs:"
echo "   - http://localhost:5173"
echo "   - Your deployed Netlify URL (when you have one)"
echo ""
read -p "Press Enter when done..."

echo ""
echo "🎉 Setup complete!"
echo "==================="
echo ""
echo "Your .env.local:"
cat .env.local
echo ""
echo "To test locally:"
echo "  npm run dev"
echo ""
echo "The app will show a 'Sign in with Google' screen."
echo "After signing in, all of Diana's data will sync to the cloud."
echo ""
echo "To deploy to Netlify:"
echo "  1. npm run build"
echo "  2. Deploy the dist/ folder to Netlify"
echo "  3. In Netlify > Site settings > Environment variables, add:"
echo "     VITE_SUPABASE_URL = $SUPABASE_URL"
echo "     VITE_SUPABASE_ANON_KEY = $SUPABASE_ANON_KEY"
echo ""
