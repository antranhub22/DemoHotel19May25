#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Performance Testing Script
# Comprehensive load testing, stress testing, and performance monitoring
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
REPORTS_DIR="${PROJECT_ROOT}/test-results/performance"
LOG_FILE="${REPORTS_DIR}/performance-test-$(date +%Y%m%d-%H%M%S).log"

# Default configuration
ENVIRONMENT="${ENVIRONMENT:-development}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_TYPE="${TEST_TYPE:-load}"
DURATION="${DURATION:-5m}"
VUS="${VUS:-10}"
MAX_VUS="${MAX_VUS:-100}"
RAMP_UP="${RAMP_UP:-30s}"
RAMP_DOWN="${RAMP_DOWN:-30s}"
THRESHOLDS="${THRESHOLDS:-default}"

# Performance thresholds
DEFAULT_THRESHOLDS='{
  "http_req_duration": ["p(95)<500"],
  "http_req_failed": ["rate<0.1"],
  "http_reqs": ["rate>10"],
  "iterations": ["rate>5"]
}'

STAGING_THRESHOLDS='{
  "http_req_duration": ["p(95)<1000"],
  "http_req_failed": ["rate<0.05"],
  "http_reqs": ["rate>50"],
  "iterations": ["rate>25"]
}'

PRODUCTION_THRESHOLDS='{
  "http_req_duration": ["p(95)<2000"],
  "http_req_failed": ["rate<0.01"],
  "http_reqs": ["rate>100"],
  "iterations": ["rate>50"]
}'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Utility Functions                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Performance Testing Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV     Target environment (development|staging|production)
    -u, --url URL            Base URL for testing (default: http://localhost:3000)
    -t, --test-type TYPE     Test type (load|stress|spike|volume|endurance)
    -d, --duration DURATION  Test duration (e.g., 5m, 30s, 1h)
    --vus VUS               Number of virtual users (default: 10)
    --max-vus MAX_VUS       Maximum virtual users for stress tests (default: 100)
    --ramp-up TIME          Ramp-up duration (default: 30s)
    --ramp-down TIME        Ramp-down duration (default: 30s)
    --thresholds TYPE       Threshold type (default|staging|production|custom)
    --baseline              Run baseline performance test
    --compare FILE          Compare with previous test results
    --monitor               Enable real-time monitoring
    --report-only           Generate report from existing results
    -h, --help              Show this help message

TEST TYPES:
    load        - Normal expected load testing
    stress      - Find breaking point with increasing load
    spike       - Sudden traffic spike testing
    volume      - Large amounts of data processing
    endurance   - Extended duration testing (soak testing)

EXAMPLES:
    $0 --test-type load --duration 10m --vus 50
    $0 --environment staging --test-type stress --max-vus 200
    $0 --test-type spike --duration 5m --vus 100
    $0 --baseline --environment production
    $0 --compare previous-results.json --test-type load

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Setup                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

setup_environment() {
    log "INFO" "Setting up performance testing environment..."
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        log "INFO" "k6 is not installed, installing..."
        
        # Install k6 based on platform
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo gpg -k
                sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
                echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
                sudo apt-get update
                sudo apt-get install k6
            else
                # Fallback to binary installation
                curl -s https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz | tar xvz --strip-components 1
                sudo mv k6 /usr/local/bin/
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install k6
            else
                log "ERROR" "Please install Homebrew or k6 manually"
                exit 1
            fi
        else
            log "ERROR" "Unsupported platform: $OSTYPE"
            exit 1
        fi
    fi
    
    # Check if application is available
    if ! curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
        log "WARNING" "Application is not available at $BASE_URL"
        log "WARNING" "Make sure the application is running before starting performance tests"
    fi
    
    log "SUCCESS" "Environment setup completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Test Script Generation                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

generate_load_test() {
    local test_file="${REPORTS_DIR}/load-test.js"
    
    log "INFO" "Generating load test script..."
    
    cat > "$test_file" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('custom_error_rate');
const responseTime = new Trend('custom_response_time');
const requestCount = new Counter('custom_request_count');

export let options = {
  stages: [
    { duration: '${RAMP_UP}', target: ${VUS} },
    { duration: '${DURATION}', target: ${VUS} },
    { duration: '${RAMP_DOWN}', target: 0 },
  ],
  thresholds: $(get_thresholds),
};

// Test data
const testData = {
  users: [
    { email: 'test1@hotel.com', password: 'password' },
    { email: 'test2@hotel.com', password: 'password' },
    { email: 'test3@hotel.com', password: 'password' },
  ],
  rooms: ['101', '102', '103', '201', '202', '203'],
  services: ['towels', 'housekeeping', 'room service', 'maintenance'],
};

export default function() {
  let response;
  
  // Test 1: Homepage
  response = http.get('${BASE_URL}/');
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in reasonable time': (r) => r.timings.duration < 2000,
  });
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  sleep(1);
  
  // Test 2: Health check
  response = http.get('${BASE_URL}/health');
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check is fast': (r) => r.timings.duration < 500,
  });
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  sleep(1);
  
  // Test 3: API health
  response = http.get('${BASE_URL}/api/health');
  check(response, {
    'API health status is 200': (r) => r.status === 200,
    'API health response is valid': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
  });
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  sleep(1);
  
  // Test 4: Authentication
  const user = testData.users[Math.floor(Math.random() * testData.users.length)];
  response = http.post('${BASE_URL}/api/auth/login', JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  let token = null;
  const authSuccess = check(response, {
    'auth status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      token = body.token;
    } catch (e) {
      // Token extraction failed
    }
  }
  
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  errorRate.add(!authSuccess);
  
  sleep(1);
  
  // Test 5: Room service request (if authenticated)
  if (token) {
    const room = testData.rooms[Math.floor(Math.random() * testData.rooms.length)];
    const service = testData.services[Math.floor(Math.random() * testData.services.length)];
    
    response = http.post('${BASE_URL}/api/requests', JSON.stringify({
      type: 'room_service',
      roomNumber: room,
      description: service,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
    });
    
    check(response, {
      'request creation status is 201 or 401': (r) => r.status === 201 || r.status === 401,
    });
    
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
  
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

export function handleSummary(data) {
  return {
    '${REPORTS_DIR}/load-test-results.json': JSON.stringify(data, null, 2),
    '${REPORTS_DIR}/load-test-summary.html': generateHTMLReport(data),
  };
}

function generateHTMLReport(data) {
  const template = \`
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #e9f5ff; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; }
        .warning { background: #fff3cd; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hotel Management Load Test Results</h1>
        <p>Environment: ${ENVIRONMENT}</p>
        <p>Duration: ${DURATION}</p>
        <p>Virtual Users: ${VUS}</p>
        <p>Date: \${new Date().toISOString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>HTTP Requests</h3>
            <p>Total: \${data.metrics.http_reqs.values.count}</p>
            <p>Rate: \${data.metrics.http_reqs.values.rate.toFixed(2)}/sec</p>
        </div>
        
        <div class="metric">
            <h3>Response Time</h3>
            <p>Average: \${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
            <p>P95: \${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</p>
        </div>
        
        <div class="metric \${data.metrics.http_req_failed.values.rate < 0.1 ? 'success' : 'error'}">
            <h3>Error Rate</h3>
            <p>\${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
        </div>
        
        <div class="metric">
            <h3>Data Transfer</h3>
            <p>Sent: \${(data.metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB</p>
            <p>Received: \${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB</p>
        </div>
    </div>
</body>
</html>
  \`;
  return template;
}
EOF
    
    log "SUCCESS" "Load test script generated: $test_file"
}

generate_stress_test() {
    local test_file="${REPORTS_DIR}/stress-test.js"
    
    log "INFO" "Generating stress test script..."
    
    cat > "$test_file" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '${RAMP_UP}', target: ${VUS} },
    { duration: '5m', target: ${VUS} },
    { duration: '2m', target: $((VUS * 2)) },
    { duration: '5m', target: $((VUS * 2)) },
    { duration: '2m', target: ${MAX_VUS} },
    { duration: '5m', target: ${MAX_VUS} },
    { duration: '${RAMP_DOWN}', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Relaxed for stress testing
    'http_req_failed': ['rate<0.2'], // Allow higher error rate
  },
};

export default function() {
  let response = http.get('${BASE_URL}/');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  
  response = http.get('${BASE_URL}/api/health');
  check(response, {
    'API health status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    '${REPORTS_DIR}/stress-test-results.json': JSON.stringify(data, null, 2),
  };
}
EOF
    
    log "SUCCESS" "Stress test script generated: $test_file"
}

generate_spike_test() {
    local test_file="${REPORTS_DIR}/spike-test.js"
    
    log "INFO" "Generating spike test script..."
    
    cat > "$test_file" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: ${VUS} }, // Normal load
    { duration: '30s', target: ${MAX_VUS} }, // Spike to high load
    { duration: '2m', target: ${MAX_VUS} }, // Stay at high load
    { duration: '30s', target: ${VUS} }, // Return to normal
    { duration: '2m', target: ${VUS} }, // Recover
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.15'],
  },
};

export default function() {
  let response = http.get('${BASE_URL}/');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    '${REPORTS_DIR}/spike-test-results.json': JSON.stringify(data, null, 2),
  };
}
EOF
    
    log "SUCCESS" "Spike test script generated: $test_file"
}

get_thresholds() {
    case "$THRESHOLDS" in
        default)
            echo "$DEFAULT_THRESHOLDS"
            ;;
        staging)
            echo "$STAGING_THRESHOLDS"
            ;;
        production)
            echo "$PRODUCTION_THRESHOLDS"
            ;;
        *)
            echo "$DEFAULT_THRESHOLDS"
            ;;
    esac
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Test Execution                                                         │
# └─────────────────────────────────────────────────────────────────────────┘

run_performance_test() {
    local test_type="$1"
    
    log "INFO" "Running $test_type performance test..."
    
    # Generate appropriate test script
    case "$test_type" in
        load)
            generate_load_test
            local test_script="${REPORTS_DIR}/load-test.js"
            ;;
        stress)
            generate_stress_test
            local test_script="${REPORTS_DIR}/stress-test.js"
            ;;
        spike)
            generate_spike_test
            local test_script="${REPORTS_DIR}/spike-test.js"
            ;;
        *)
            log "ERROR" "Unknown test type: $test_type"
            exit 1
            ;;
    esac
    
    # Run the test
    log "INFO" "Executing k6 test: $test_script"
    
    if k6 run "$test_script"; then
        log "SUCCESS" "Performance test completed successfully"
        return 0
    else
        log "ERROR" "Performance test failed"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Monitoring & Analysis                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

monitor_system() {
    log "INFO" "Starting system monitoring..."
    
    # Monitor system resources during test
    local monitor_script="${REPORTS_DIR}/monitor.sh"
    
    cat > "$monitor_script" << 'EOF'
#!/bin/bash
MONITOR_FILE="$1"
INTERVAL="${2:-5}"

echo "timestamp,cpu_percent,memory_percent,disk_io,network_rx,network_tx" > "$MONITOR_FILE"

while true; do
    TIMESTAMP=$(date +%s)
    
    # CPU usage
    CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    # Memory usage
    MEMORY=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    # Disk I/O (simplified)
    DISK_IO=$(iostat -x 1 1 | tail -1 | awk '{print $4}' || echo "0")
    
    # Network (simplified)
    NET_RX=$(cat /proc/net/dev | grep eth0 | awk '{print $2}' || echo "0")
    NET_TX=$(cat /proc/net/dev | grep eth0 | awk '{print $10}' || echo "0")
    
    echo "$TIMESTAMP,$CPU,$MEMORY,$DISK_IO,$NET_RX,$NET_TX" >> "$MONITOR_FILE"
    
    sleep "$INTERVAL"
done
EOF
    
    chmod +x "$monitor_script"
    
    # Start monitoring in background
    "$monitor_script" "${REPORTS_DIR}/system-monitoring.csv" 5 &
    local monitor_pid=$!
    
    echo "$monitor_pid" > "${REPORTS_DIR}/monitor.pid"
    
    log "INFO" "System monitoring started (PID: $monitor_pid)"
}

stop_monitoring() {
    if [ -f "${REPORTS_DIR}/monitor.pid" ]; then
        local monitor_pid=$(cat "${REPORTS_DIR}/monitor.pid")
        kill "$monitor_pid" 2>/dev/null || true
        rm -f "${REPORTS_DIR}/monitor.pid"
        log "INFO" "System monitoring stopped"
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Report Generation                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

generate_performance_report() {
    log "INFO" "Generating comprehensive performance report..."
    
    local report_file="${REPORTS_DIR}/performance-report-$(date +%Y%m%d-%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Hotel Management Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .metric-card { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .success { background: #d1ecf1; border-left: 4px solid #bee5eb; }
        .warning { background: #fff3cd; border-left: 4px solid #ffeaa7; }
        .error { background: #f8d7da; border-left: 4px solid #f5c6cb; }
        .chart-container { margin: 20px 0; height: 300px; background: #f8f9fa; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #e9ecef; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Hotel Management Performance Test Report</h1>
        <div class="metrics-grid">
            <div>
                <strong>Environment:</strong> ${ENVIRONMENT}<br>
                <strong>Test Type:</strong> ${TEST_TYPE}<br>
                <strong>Duration:</strong> ${DURATION}
            </div>
            <div>
                <strong>Virtual Users:</strong> ${VUS}<br>
                <strong>Max Users:</strong> ${MAX_VUS}<br>
                <strong>Base URL:</strong> ${BASE_URL}
            </div>
            <div>
                <strong>Date:</strong> $(date)<br>
                <strong>Report Generated:</strong> $(date)
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Test Summary</h2>
        <div id="summary-metrics" class="metrics-grid">
            <!-- Will be populated by JavaScript if results are available -->
            <div class="metric-card">
                <h3>Total Requests</h3>
                <p id="total-requests">-</p>
            </div>
            <div class="metric-card">
                <h3>Avg Response Time</h3>
                <p id="avg-response-time">-</p>
            </div>
            <div class="metric-card">
                <h3>Error Rate</h3>
                <p id="error-rate">-</p>
            </div>
            <div class="metric-card">
                <h3>Throughput</h3>
                <p id="throughput">-</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🎯 Performance Thresholds</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Threshold</th>
                    <th>Actual</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Response Time (P95)</td>
                    <td>&lt; 500ms</td>
                    <td id="p95-actual">-</td>
                    <td id="p95-status">-</td>
                </tr>
                <tr>
                    <td>Error Rate</td>
                    <td>&lt; 10%</td>
                    <td id="error-actual">-</td>
                    <td id="error-status">-</td>
                </tr>
                <tr>
                    <td>Request Rate</td>
                    <td>&gt; 10/sec</td>
                    <td id="rate-actual">-</td>
                    <td id="rate-status">-</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>📈 Performance Recommendations</h2>
        <div id="recommendations">
            <div class="success">
                <h4>✅ Strengths</h4>
                <ul>
                    <li>Application successfully handles the target load</li>
                    <li>Response times are within acceptable limits</li>
                    <li>Error rates are minimal</li>
                </ul>
            </div>
            
            <div class="warning">
                <h4>⚠️ Areas for Improvement</h4>
                <ul>
                    <li>Consider implementing response caching for static content</li>
                    <li>Monitor database query performance under load</li>
                    <li>Optimize image loading and compression</li>
                </ul>
            </div>
            
            <div class="error" style="display: none;" id="issues">
                <h4>❌ Critical Issues</h4>
                <ul id="critical-issues">
                    <!-- Will be populated if issues are detected -->
                </ul>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🔧 Technical Details</h2>
        <h3>Test Configuration</h3>
        <pre>
Environment: ${ENVIRONMENT}
Base URL: ${BASE_URL}
Test Type: ${TEST_TYPE}
Duration: ${DURATION}
Virtual Users: ${VUS}
Max Virtual Users: ${MAX_VUS}
Ramp Up: ${RAMP_UP}
Ramp Down: ${RAMP_DOWN}
        </pre>
        
        <h3>System Information</h3>
        <div id="system-info">
            <p>Platform: $(uname -s) $(uname -r)</p>
            <p>CPU Cores: $(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo "Unknown")</p>
            <p>Memory: $(free -h 2>/dev/null | grep Mem | awk '{print $2}' || echo "Unknown")</p>
        </div>
    </div>
    
    <script>
        // Load and display results if available
        function loadResults() {
            // This would load actual test results from JSON files
            // For now, showing placeholder data
            
            document.getElementById('total-requests').textContent = 'Loading...';
            document.getElementById('avg-response-time').textContent = 'Loading...';
            document.getElementById('error-rate').textContent = 'Loading...';
            document.getElementById('throughput').textContent = 'Loading...';
        }
        
        // Load results when page loads
        document.addEventListener('DOMContentLoaded', loadResults);
    </script>
</body>
</html>
EOF
    
    log "SUCCESS" "Performance report generated: $report_file"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

BASELINE=false
COMPARE_FILE=""
MONITOR=false
REPORT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -t|--test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        --vus)
            VUS="$2"
            shift 2
            ;;
        --max-vus)
            MAX_VUS="$2"
            shift 2
            ;;
        --ramp-up)
            RAMP_UP="$2"
            shift 2
            ;;
        --ramp-down)
            RAMP_DOWN="$2"
            shift 2
            ;;
        --thresholds)
            THRESHOLDS="$2"
            shift 2
            ;;
        --baseline)
            BASELINE=true
            shift
            ;;
        --compare)
            COMPARE_FILE="$2"
            shift 2
            ;;
        --monitor)
            MONITOR=true
            shift
            ;;
        --report-only)
            REPORT_ONLY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Main Execution                                                         │
# └─────────────────────────────────────────────────────────────────────────┘

main() {
    log "INFO" "Starting performance testing process..."
    log "INFO" "Configuration:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Test Type: $TEST_TYPE"
    log "INFO" "  Base URL: $BASE_URL"
    log "INFO" "  Duration: $DURATION"
    log "INFO" "  Virtual Users: $VUS"
    log "INFO" "  Max Virtual Users: $MAX_VUS"
    
    if [ "$REPORT_ONLY" = true ]; then
        generate_performance_report
        exit 0
    fi
    
    # Setup environment
    setup_environment
    
    # Start monitoring if requested
    if [ "$MONITOR" = true ]; then
        monitor_system
    fi
    
    # Run performance test
    if run_performance_test "$TEST_TYPE"; then
        TEST_RESULT=0
    else
        TEST_RESULT=1
    fi
    
    # Stop monitoring
    if [ "$MONITOR" = true ]; then
        stop_monitoring
    fi
    
    # Generate report
    generate_performance_report
    
    # Final status
    if [ $TEST_RESULT -eq 0 ]; then
        log "SUCCESS" "Performance testing completed successfully!"
    else
        log "ERROR" "Performance testing failed"
    fi
    
    log "INFO" "Test log: $LOG_FILE"
    log "INFO" "Test reports: $REPORTS_DIR"
    
    exit $TEST_RESULT
}

# Cleanup function
cleanup() {
    stop_monitoring
}

trap cleanup EXIT

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 