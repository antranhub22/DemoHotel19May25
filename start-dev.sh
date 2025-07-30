#!/bin/bash

echo "🚀 Starting DemoHotel Development Servers..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "tsx.*apps/server" 2>/dev/null || true
pkill -f "vite.*dev" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Wait for cleanup
sleep 2

# Ensure database exists
echo "📁 Checking database..."
touch dev.db
ls -la dev.db

# Start backend server in background
echo "🔧 Starting backend API server on port 10000..."
NODE_ENV=development PORT=10000 npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 5

# Start frontend server in background  
echo "🎨 Starting frontend server on port 3000..."
npm run dev:client > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for both servers to start
echo "⏳ Waiting for servers to initialize..."
sleep 8

# Test servers
echo "🔍 Testing servers..."

# Test frontend
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server (port 3000): WORKING"
else
    echo "❌ Frontend server (port 3000): NOT RESPONDING"
fi

# Test backend - use simple test first
if curl -s -f http://localhost:10000 > /dev/null; then
    echo "✅ Backend server (port 10000): WORKING"
    
    # Try health endpoint
    if curl -s -f http://localhost:10000/api/health > /dev/null; then
        echo "✅ Backend API health: WORKING"
    else
        echo "⚠️ Backend API health: Not responding (but server is up)"
    fi
else
    echo "❌ Backend server (port 10000): NOT RESPONDING"
    echo "📝 Backend logs:"
    tail -10 backend.log
fi

echo ""
echo "🎯 SUMMARY:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:10000"
echo "   API:      http://localhost:10000/api/health"
echo ""
echo "📋 To stop servers:"
echo "   pkill -f 'tsx.*apps/server'"
echo "   pkill -f 'vite.*dev'"
echo ""
echo "📊 To view logs:"
echo "   tail -f backend.log"
echo "   tail -f frontend.log"