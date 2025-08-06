#!/bin/bash

# Divar Property Crawler Runner
# اجراکننده کراولر املاک دیوار

echo "🏠 Divar Property Crawler"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null; then
    echo "⚠️  Google Chrome not found. Please install Google Chrome."
    echo "   You may need to update the executablePath in config.js"
fi

# Create output directory if it doesn't exist
if [ ! -d "output" ]; then
    echo "📁 Creating output directory..."
    mkdir -p output
fi

# Run the crawler
echo "🚀 Starting crawler..."
echo "📅 Start time: $(date)"
echo ""

node divar_crawler.js

echo ""
echo "🏁 Crawler finished!"
echo "📅 End time: $(date)"
echo ""
echo "📊 Check the 'output' directory for results." 