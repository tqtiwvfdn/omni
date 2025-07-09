#!/bin/bash

# Omni AI Server Start Script

echo "🚀 Starting Omni AI Server..."
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the ai-server directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
fi

# Start the server
echo "🎯 Starting server on port 3000..."
echo "📡 API will be available at: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo "📊 Applications API: http://localhost:3000/api/applications"
echo "📈 Statistics API: http://localhost:3000/api/stats"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================="

# Start the server
npm start