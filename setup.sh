#!/usr/bin/env bash
# Diana's Companion App — Setup Script
# Run this once after cloning to get your dev environment ready.

set -e

echo "🐾 Setting up Diana's Companion App..."
echo ""

# --- Check Node.js ---
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node 18 or later."
  echo "   https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node 18+ is required. You have $(node -v)."
  exit 1
fi
echo "✅ Node $(node -v) detected"

# --- Check npm ---
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed."
  exit 1
fi
echo "✅ npm $(npm -v) detected"

# --- Install dependencies ---
echo ""
echo "📦 Installing dependencies..."
npm install

# --- Set up .env ---
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "📝 Created .env from .env.example"
  echo "   Edit .env and add your Supabase credentials before running the app."
else
  echo ""
  echo "✅ .env already exists"
fi

# --- Done ---
echo ""
echo "🎉 Setup complete! Run 'npm run dev' to start the dev server."
