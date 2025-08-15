#!/bin/bash

# 🚨 EMERGENCY RESTART - Memory Leak Recovery
# Kills all processes and restarts with aggressive memory settings

echo "🚨 EMERGENCY MEMORY LEAK RECOVERY"
echo "================================="

# Kill all Node.js processes related to our app
echo "🔪 Killing all existing server processes..."
pkill -f "node.*apps/server" || true
pkill -f "npm.*run.*dev" || true
pkill -f "tsx.*apps/server" || true

# Wait for processes to terminate
sleep 3

# Force kill if still running
echo "🔪 Force killing any remaining processes..."
pkill -9 -f "node.*apps/server" || true
pkill -9 -f "npm.*run.*dev" || true
pkill -9 -f "tsx.*apps/server" || true

# Clean up any orphaned processes
sleep 2

echo "✅ All processes terminated"

# Force garbage collection and clear caches
echo "🧹 Clearing system caches..."
sync
sudo purge 2>/dev/null || true

# Set aggressive memory limits
export NODE_OPTIONS="--max-old-space-size=512 --expose-gc --experimental-vm-modules"
export MEMORY_AGGRESSIVE_MODE=true
export NODE_ENV=development

echo "🚀 Starting server with aggressive memory limits..."
echo "   Memory limit: 512MB"
echo "   GC exposed: Yes"
echo "   Aggressive mode: On"
echo ""

# Start server with memory monitoring
npm run dev 2>&1 | tee server-emergency.log &

SERVER_PID=$!
echo "📊 Server PID: $SERVER_PID"

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is responsive
for i in {1..12}; do
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "✅ Server is responsive!"
        echo "🔍 Memory monitoring active"
        echo "📋 Logs: tail -f server-emergency.log"
        echo ""
        echo "🎯 Emergency restart completed successfully!"
        exit 0
    fi
    echo "⏳ Attempt $i/12 - waiting for server..."
    sleep 5
done

echo "❌ Server failed to start properly"
echo "📋 Check logs: tail -f server-emergency.log"
exit 1
