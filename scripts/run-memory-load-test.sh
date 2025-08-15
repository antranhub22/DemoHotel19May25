#!/bin/bash

# 🚀 PHASE 4.1: Memory Load Test Runner
# Automated script to test memory stability under load

set -e

echo "🚀 MEMORY LEAK LOAD TESTING - PHASE 4.1"
echo "========================================"

# Default settings
DURATION=${1:-30}  # Default 30 minutes
CONCURRENCY=${2:-10}  # Default 10 concurrent workers
URL=${3:-"http://localhost:3000"}  # Default local server
INTERVAL=${4:-1000}  # Default 1 second between requests

echo "📊 Test Configuration:"
echo "  Duration: ${DURATION} minutes"
echo "  Concurrency: ${CONCURRENCY} workers"
echo "  Target URL: ${URL}"
echo "  Request Interval: ${INTERVAL}ms"
echo ""

# Check if server is running
echo "🔍 Checking server availability..."
if curl -s "${URL}/api/health" > /dev/null 2>&1; then
    echo "✅ Server is running and responsive"
else
    echo "❌ Server is not accessible at ${URL}"
    echo "💡 Please start the server first with: npm run start"
    exit 1
fi

# Check server memory endpoint
echo "🔍 Checking memory monitoring endpoint..."
if curl -s "${URL}/api/memory/status" > /dev/null 2>&1; then
    echo "✅ Memory monitoring endpoint is available"
else
    echo "⚠️  Memory monitoring endpoint not available - will use basic monitoring"
fi

echo ""
echo "🚀 Starting load test in 3 seconds..."
sleep 1
echo "🚀 Starting load test in 2 seconds..."
sleep 1  
echo "🚀 Starting load test in 1 second..."
sleep 1

# Run the load test
echo "🎯 Load test starting now!"
echo ""

node scripts/load-test-memory.js \
    --duration ${DURATION} \
    --concurrency ${CONCURRENCY} \
    --url ${URL} \
    --interval ${INTERVAL}

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 LOAD TEST COMPLETED SUCCESSFULLY!"
    echo "✅ Memory stability test PASSED"
    echo "💡 Memory leak fixes are working properly"
else
    echo "⚠️ LOAD TEST COMPLETED WITH WARNINGS"
    echo "❌ Memory stability test detected issues"
    echo "💡 Please review the memory analysis above"
fi

echo ""
echo "📋 Next Steps:"
echo "  1. Review the memory analysis report above"
echo "  2. If memory growth > 2MB/min, investigate further"
echo "  3. If memory is stable, proceed to production deployment"
echo "  4. Use 'npm run start' to restart server if needed"
echo ""
echo "🎯 Phase 4.1 Load Testing Complete!"

exit $EXIT_CODE
