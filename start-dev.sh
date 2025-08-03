#!/bin/bash

# =============================================================================
# 🚀 DemoHotel Development Environment Startup Script
# =============================================================================
# Script này khởi động cả server và client cho development
# Sử dụng: ./start-dev.sh hoặc bash start-dev.sh

echo "🏨 Starting DemoHotel Development Environment..."
echo "======================================================="

# Kiểm tra Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "   Node.js: $node_version"

# Kiểm tra npm dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Kiểm tra file .env
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Please create .env file with required variables."
    echo "   See .infrastructure/render-env-variables.txt for template."
    exit 1
fi

# Kiểm tra database
echo "🗄️ Checking database..."
if [ ! -f "apps/dev.db" ]; then
    echo "   Creating SQLite database..."
    touch apps/dev.db
fi

# Kill existing processes nếu có
echo "🔄 Stopping existing processes..."
pkill -f "tsx watch apps/server/index.ts" 2>/dev/null || true
pkill -f "vite dev --port 3000" 2>/dev/null || true
sleep 2

# Tạo log directory
mkdir -p logs

echo ""
echo "🚀 Starting Development Servers..."
echo "======================================="

# Start Server (Backend)
echo "📡 Starting Backend Server on port 10000..."
npm run dev > logs/server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for server to be ready
echo "   Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:10000/api/health >/dev/null 2>&1; then
        echo "   ✅ Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Server failed to start within 30 seconds"
        echo "   Check logs/server.log for details"
        exit 1
    fi
    sleep 1
done

# Start Client (Frontend)
echo "🎨 Starting Frontend Client on port 3000..."
npm run dev:client > logs/client.log 2>&1 &
CLIENT_PID=$!
echo "   Client PID: $CLIENT_PID"

# Wait for client to be ready
echo "   Waiting for client to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "   ✅ Client is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Client failed to start within 30 seconds"
        echo "   Check logs/client.log for details"
        exit 1
    fi
    sleep 1
done

echo ""
echo "✅ Development Environment Started Successfully!"
echo "=============================================="
echo "🔗 Frontend:  http://localhost:3000"
echo "🔗 Backend:   http://localhost:10000"
echo "🔗 API Health: http://localhost:10000/api/health"
echo ""
echo "📁 Logs:"
echo "   Server: logs/server.log"
echo "   Client: logs/client.log"
echo ""
echo "🛑 To stop:"
echo "   pkill -f 'tsx watch apps/server/index.ts'"
echo "   pkill -f 'vite dev --port 3000'"
echo "   Or use Ctrl+C and run: ./stop-dev.sh"
echo ""
echo "📊 Live logs:"
echo "   tail -f logs/server.log  # Server logs"
echo "   tail -f logs/client.log  # Client logs"
echo ""

# Save PIDs for later cleanup
echo $SERVER_PID > .dev-server.pid
echo $CLIENT_PID > .dev-client.pid

echo "🎉 Happy coding! Development environment is ready."