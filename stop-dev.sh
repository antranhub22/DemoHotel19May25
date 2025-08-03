#!/bin/bash

# =============================================================================
# 🛑 DemoHotel Development Environment Stop Script
# =============================================================================
# Script này dừng tất cả development processes
# Sử dụng: ./stop-dev.sh hoặc bash stop-dev.sh

echo "🛑 Stopping DemoHotel Development Environment..."
echo "================================================"

# Kill processes by name pattern
echo "🔄 Stopping development servers..."

# Stop server
if pkill -f "tsx watch apps/server/index.ts" 2>/dev/null; then
    echo "   ✅ Backend server stopped"
else
    echo "   ⚠️ No backend server process found"
fi

# Stop client
if pkill -f "vite dev --port 3000" 2>/dev/null; then
    echo "   ✅ Frontend client stopped"
else
    echo "   ⚠️ No frontend client process found"
fi

# Clean up PID files
if [ -f ".dev-server.pid" ]; then
    rm .dev-server.pid
    echo "   🧹 Cleaned server PID file"
fi

if [ -f ".dev-client.pid" ]; then
    rm .dev-client.pid
    echo "   🧹 Cleaned client PID file"
fi

# Wait for cleanup
sleep 2

# Verify processes stopped
echo ""
echo "🔍 Verifying processes stopped..."

# Check if any development processes are still running
if pgrep -f "tsx.*apps/server" >/dev/null 2>&1; then
    echo "   ⚠️ Some server processes may still be running"
    echo "   Force kill with: pkill -9 -f 'tsx.*apps/server'"
else
    echo "   ✅ No server processes running"
fi

if pgrep -f "vite.*dev" >/dev/null 2>&1; then
    echo "   ⚠️ Some client processes may still be running"
    echo "   Force kill with: pkill -9 -f 'vite.*dev'"
else
    echo "   ✅ No client processes running"
fi

# Check ports
echo ""
echo "🔍 Checking ports..."

if lsof -ti:10000 >/dev/null 2>&1; then
    echo "   ⚠️ Port 10000 may still be in use"
else
    echo "   ✅ Port 10000 is free"
fi

if lsof -ti:3000 >/dev/null 2>&1; then
    echo "   ⚠️ Port 3000 may still be in use"
else
    echo "   ✅ Port 3000 is free"
fi

echo ""
echo "✅ Development Environment Stopped!"
echo "=================================="
echo ""
echo "💡 To start again, run: ./start-dev.sh"
echo "📁 Logs are preserved in the logs/ directory"