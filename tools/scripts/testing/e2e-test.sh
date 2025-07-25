#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - End-to-End Testing Automation
# Comprehensive E2E testing with multiple browsers and scenarios
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
REPORTS_DIR="${PROJECT_ROOT}/test-results/e2e"
LOG_FILE="${REPORTS_DIR}/e2e-test-$(date +%Y%m%d-%H%M%S).log"

# Default configuration
ENVIRONMENT="${ENVIRONMENT:-development}"
BROWSERS="${BROWSERS:-chromium,firefox}"
TEST_SUITE="${TEST_SUITE:-all}"
HEADLESS="${HEADLESS:-true}"
WORKERS="${WORKERS:-4}"
RETRIES="${RETRIES:-2}"
TIMEOUT="${TIMEOUT:-30000}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
RECORD_VIDEO="${RECORD_VIDEO:-on-failure}"
TAKE_SCREENSHOTS="${TAKE_SCREENSHOTS:-only-on-failure}"

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

cleanup() {
    log "INFO" "Cleaning up test environment..."
    
    # Kill any remaining test processes
    pkill -f "playwright" || true
    pkill -f "chromium" || true
    pkill -f "firefox" || true
    
    # Clean up temporary files
    rm -rf /tmp/playwright-* || true
}

trap cleanup EXIT

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - E2E Testing Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV      Target environment (development|staging|production)
    -b, --browsers BROWSERS    Comma-separated list of browsers (chromium,firefox,webkit)
    -s, --suite SUITE         Test suite to run (all|smoke|critical|regression|ui)
    -u, --url URL             Base URL for testing (default: http://localhost:3000)
    --headless BOOL           Run in headless mode (true|false, default: true)
    --workers NUM             Number of parallel workers (default: 4)
    --retries NUM             Number of retries per test (default: 2)
    --timeout MS              Test timeout in milliseconds (default: 30000)
    --record-video MODE       Video recording mode (off|on|retain-on-failure|on-failure)
    --screenshots MODE        Screenshot mode (off|on|only-on-failure)
    --debug                   Run in debug mode with detailed logging
    --update-snapshots        Update visual comparison snapshots
    --parallel                Run tests in parallel (default)
    --serial                  Run tests serially
    -h, --help               Show this help message

ENVIRONMENTS:
    development    - Local development environment
    staging        - Staging environment with test data
    production     - Production environment (limited test suite)

TEST SUITES:
    all           - Run all available tests
    smoke         - Quick smoke tests for critical functionality
    critical      - Critical user journeys and business processes
    regression    - Full regression test suite
    ui            - UI component and visual tests
    api           - API integration tests
    performance   - Performance and load tests

EXAMPLES:
    $0 --suite smoke --browsers chromium
    $0 --environment staging --suite critical --workers 2
    $0 --debug --headless false --suite ui
    $0 --environment production --suite smoke --record-video on
    $0 --update-snapshots --suite ui

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Setup                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

setup_environment() {
    log "INFO" "Setting up E2E testing environment..."
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is required but not installed"
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is required but not installed"
        exit 1
    fi
    
    # Navigate to project root
    cd "$PROJECT_ROOT"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/playwright" ]; then
        log "INFO" "Installing dependencies..."
        npm ci --no-audit --no-fund
    fi
    
    # Check if Playwright is installed
    if [ ! -f "node_modules/.bin/playwright" ]; then
        log "INFO" "Installing Playwright..."
        npm install --save-dev @playwright/test
    fi
    
    # Install browsers if needed
    log "INFO" "Ensuring Playwright browsers are installed..."
    npx playwright install --with-deps
    
    log "SUCCESS" "Environment setup completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Application Startup                                                    │
# └─────────────────────────────────────────────────────────────────────────┘

start_application() {
    local environment="$1"
    
    log "INFO" "Starting application for testing (environment: $environment)..."
    
    case "$environment" in
        development)
            # Start development server
            log "INFO" "Starting development server..."
            
            # Check if application is already running
            if curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
                log "INFO" "Application is already running"
                return 0
            fi
            
            # Start application in background
            if [ -f "package.json" ]; then
                if grep -q '"dev"' package.json; then
                    npm run dev &
                elif grep -q '"start"' package.json; then
                    npm start &
                else
                    log "ERROR" "No start script found in package.json"
                    exit 1
                fi
            else
                log "ERROR" "package.json not found"
                exit 1
            fi
            
            # Wait for application to start
            local retries=30
            for i in $(seq 1 $retries); do
                if curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
                    log "SUCCESS" "Application started successfully"
                    return 0
                fi
                
                log "INFO" "Waiting for application to start... ($i/$retries)"
                sleep 2
            done
            
            log "ERROR" "Application failed to start within timeout"
            exit 1
            ;;
            
        staging|production)
            # For staging/production, assume application is already running
            log "INFO" "Checking if application is available at $BASE_URL..."
            
            if curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
                log "SUCCESS" "Application is available"
            else
                log "ERROR" "Application is not available at $BASE_URL"
                exit 1
            fi
            ;;
    esac
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Test Configuration                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

generate_playwright_config() {
    log "INFO" "Generating Playwright configuration..."
    
    cat > "${PROJECT_ROOT}/playwright.config.ts" << EOF
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: ${RETRIES},
  workers: process.env.CI ? 1 : ${WORKERS},
  reporter: [
    ['html', { outputFolder: 'test-results/e2e/html-report' }],
    ['json', { outputFile: 'test-results/e2e/results.json' }],
    ['junit', { outputFile: 'test-results/e2e/results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: '${BASE_URL}',
    trace: 'on-first-retry',
    video: '${RECORD_VIDEO}',
    screenshot: '${TAKE_SCREENSHOTS}',
    actionTimeout: ${TIMEOUT},
    navigationTimeout: ${TIMEOUT},
  },
  projects: [
$(generate_browser_projects)
  ],
  webServer: process.env.ENVIRONMENT === 'development' ? {
    command: 'npm run dev',
    url: '${BASE_URL}',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,
});
EOF
    
    log "SUCCESS" "Playwright configuration generated"
}

generate_browser_projects() {
    IFS=',' read -ra BROWSER_ARRAY <<< "$BROWSERS"
    
    for browser in "${BROWSER_ARRAY[@]}"; do
        case "$browser" in
            chromium)
                echo "    {"
                echo "      name: 'chromium',"
                echo "      use: { ...devices['Desktop Chrome'] },"
                echo "    },"
                echo "    {"
                echo "      name: 'mobile-chrome',"
                echo "      use: { ...devices['Pixel 5'] },"
                echo "    },"
                ;;
            firefox)
                echo "    {"
                echo "      name: 'firefox',"
                echo "      use: { ...devices['Desktop Firefox'] },"
                echo "    },"
                ;;
            webkit)
                echo "    {"
                echo "      name: 'webkit',"
                echo "      use: { ...devices['Desktop Safari'] },"
                echo "    },"
                echo "    {"
                echo "      name: 'mobile-safari',"
                echo "      use: { ...devices['iPhone 12'] },"
                echo "    },"
                ;;
        esac
    done
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Test Suite Generation                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

create_test_suites() {
    log "INFO" "Creating test suites..."
    
    local test_dir="${PROJECT_ROOT}/tests/e2e"
    mkdir -p "$test_dir"
    
    # Create smoke tests
    create_smoke_tests "$test_dir"
    
    # Create critical tests
    create_critical_tests "$test_dir"
    
    # Create UI tests
    create_ui_tests "$test_dir"
    
    # Create API tests
    create_api_tests "$test_dir"
    
    log "SUCCESS" "Test suites created"
}

create_smoke_tests() {
    local test_dir="$1"
    
    cat > "${test_dir}/smoke.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hotel Management/);
  });

  test('health endpoint responds', async ({ page }) => {
    const response = await page.request.get('/health');
    expect(response.status()).toBe(200);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('dashboard loads for authenticated user', async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@hotel.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid=dashboard-title]')).toBeVisible();
  });

  test('voice assistant is available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid=voice-assistant]')).toBeVisible();
  });
});
EOF
}

create_critical_tests() {
    local test_dir="$1"
    
    cat > "${test_dir}/critical.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test('complete booking flow', async ({ page }) => {
    await page.goto('/');
    
    // Start booking
    await page.click('[data-testid=book-now-button]');
    
    // Fill booking form
    await page.fill('[data-testid=checkin-date]', '2024-12-01');
    await page.fill('[data-testid=checkout-date]', '2024-12-03');
    await page.selectOption('[data-testid=room-type]', 'deluxe');
    
    // Submit booking
    await page.click('[data-testid=submit-booking]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid=booking-confirmation]')).toBeVisible();
  });

  test('room service request flow', async ({ page }) => {
    await page.goto('/');
    
    // Open voice assistant
    await page.click('[data-testid=voice-assistant-button]');
    
    // Request room service
    await page.click('[data-testid=room-service-button]');
    
    // Fill service request
    await page.fill('[data-testid=room-number]', '101');
    await page.fill('[data-testid=service-request]', 'Extra towels');
    
    // Submit request
    await page.click('[data-testid=submit-request]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid=request-confirmation]')).toBeVisible();
  });

  test('multilingual support', async ({ page }) => {
    await page.goto('/');
    
    // Change language to Vietnamese
    await page.click('[data-testid=language-selector]');
    await page.click('[data-testid=language-vi]');
    
    // Verify language change
    await expect(page.locator('[data-testid=welcome-message]')).toContainText('Chào mừng');
    
    // Test voice assistant in Vietnamese
    await page.click('[data-testid=voice-assistant-button]');
    await expect(page.locator('[data-testid=assistant-greeting]')).toContainText('Xin chào');
  });

  test('staff dashboard functionality', async ({ page }) => {
    // Login as staff
    await page.goto('/staff/login');
    await page.fill('[data-testid=staff-email]', 'staff@hotel.com');
    await page.fill('[data-testid=staff-password]', 'password');
    await page.click('[data-testid=staff-login-button]');
    
    // Navigate to dashboard
    await expect(page).toHaveURL(/staff\/dashboard/);
    
    // Check requests panel
    await expect(page.locator('[data-testid=requests-panel]')).toBeVisible();
    
    // Process a request
    await page.click('[data-testid=request-item]:first-child');
    await page.click('[data-testid=mark-completed]');
    
    // Verify status update
    await expect(page.locator('[data-testid=request-status]')).toContainText('Completed');
  });
});
EOF
}

create_ui_tests() {
    local test_dir="$1"
    
    cat > "${test_dir}/ui.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('UI Component Tests', () => {
  test('responsive design works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid=desktop-nav]')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid=mobile-menu-button]')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid=navigation]')).toBeVisible();
  });

  test('voice assistant UI interactions', async ({ page }) => {
    await page.goto('/');
    
    // Open voice assistant
    await page.click('[data-testid=voice-assistant-button]');
    await expect(page.locator('[data-testid=assistant-modal]')).toBeVisible();
    
    // Test microphone button
    await page.click('[data-testid=microphone-button]');
    await expect(page.locator('[data-testid=recording-indicator]')).toBeVisible();
    
    // Close assistant
    await page.click('[data-testid=close-assistant]');
    await expect(page.locator('[data-testid=assistant-modal]')).toBeHidden();
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/contact');
    
    // Submit empty form
    await page.click('[data-testid=submit-contact]');
    
    // Check validation messages
    await expect(page.locator('[data-testid=name-error]')).toBeVisible();
    await expect(page.locator('[data-testid=email-error]')).toBeVisible();
    
    // Fill valid data
    await page.fill('[data-testid=contact-name]', 'John Doe');
    await page.fill('[data-testid=contact-email]', 'john@example.com');
    await page.fill('[data-testid=contact-message]', 'Test message');
    
    // Submit form
    await page.click('[data-testid=submit-contact]');
    
    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });

  test('loading states and animations', async ({ page }) => {
    await page.goto('/');
    
    // Test loading spinner
    await page.click('[data-testid=load-rooms-button]');
    await expect(page.locator('[data-testid=loading-spinner]')).toBeVisible();
    
    // Wait for content to load
    await expect(page.locator('[data-testid=rooms-grid]')).toBeVisible();
    await expect(page.locator('[data-testid=loading-spinner]')).toBeHidden();
  });
});
EOF
}

create_api_tests() {
    local test_dir="$1"
    
    cat > "${test_dir}/api.spec.ts" << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('health check API', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('authentication API', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@hotel.com',
        password: 'password'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.token).toBeDefined();
  });

  test('room service API', async ({ request }) => {
    // First authenticate
    const authResponse = await request.post('/api/auth/login', {
      data: {
        email: 'guest@hotel.com',
        password: 'password'
      }
    });
    
    const { token } = await authResponse.json();
    
    // Create room service request
    const response = await request.post('/api/requests', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        type: 'room_service',
        roomNumber: '101',
        description: 'Extra towels'
      }
    });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.status).toBe('pending');
  });

  test('voice assistant API', async ({ request }) => {
    const response = await request.get('/api/assistant/status');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.available).toBe(true);
  });
});
EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Test Execution                                                         │
# └─────────────────────────────────────────────────────────────────────────┘

run_tests() {
    local suite="$1"
    
    log "INFO" "Running test suite: $suite"
    
    # Build Playwright command
    local cmd="npx playwright test"
    
    # Add test files based on suite
    case "$suite" in
        smoke)
            cmd="$cmd tests/e2e/smoke.spec.ts"
            ;;
        critical)
            cmd="$cmd tests/e2e/critical.spec.ts"
            ;;
        ui)
            cmd="$cmd tests/e2e/ui.spec.ts"
            ;;
        api)
            cmd="$cmd tests/e2e/api.spec.ts"
            ;;
        all)
            cmd="$cmd tests/e2e/"
            ;;
        *)
            cmd="$cmd tests/e2e/${suite}.spec.ts"
            ;;
    esac
    
    # Add browser projects
    if [ "$BROWSERS" != "all" ]; then
        IFS=',' read -ra BROWSER_ARRAY <<< "$BROWSERS"
        for browser in "${BROWSER_ARRAY[@]}"; do
            cmd="$cmd --project=$browser"
        done
    fi
    
    # Add additional options
    if [ "$HEADLESS" = "false" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "${UPDATE_SNAPSHOTS:-false}" = "true" ]; then
        cmd="$cmd --update-snapshots"
    fi
    
    if [ "${DEBUG:-false}" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "${SERIAL:-false}" = "true" ]; then
        cmd="$cmd --workers=1"
    fi
    
    # Run tests
    log "INFO" "Executing: $cmd"
    
    if eval "$cmd"; then
        log "SUCCESS" "Test suite '$suite' completed successfully"
        return 0
    else
        log "ERROR" "Test suite '$suite' failed"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Report Generation                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

generate_reports() {
    log "INFO" "Generating test reports..."
    
    # Ensure reports directory exists
    mkdir -p "$REPORTS_DIR"
    
    # Generate HTML report
    if [ -f "${PROJECT_ROOT}/test-results/e2e/html-report/index.html" ]; then
        log "SUCCESS" "HTML report available at: ${PROJECT_ROOT}/test-results/e2e/html-report/index.html"
    fi
    
    # Generate summary report
    if [ -f "${PROJECT_ROOT}/test-results/e2e/results.json" ]; then
        log "INFO" "Generating summary report..."
        
        cat > "${REPORTS_DIR}/summary.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>E2E Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat { background: #e9f5ff; padding: 15px; border-radius: 5px; text-align: center; }
        .success { background: #d4edda; }
        .failure { background: #f8d7da; }
        .warning { background: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hotel Management E2E Test Results</h1>
        <p>Environment: ${ENVIRONMENT}</p>
        <p>Test Suite: ${TEST_SUITE}</p>
        <p>Browsers: ${BROWSERS}</p>
        <p>Executed: $(date)</p>
    </div>
    
    <div class="stats">
        <div class="stat success">
            <h3>Passed Tests</h3>
            <p id="passed-count">-</p>
        </div>
        <div class="stat failure">
            <h3>Failed Tests</h3>
            <p id="failed-count">-</p>
        </div>
        <div class="stat warning">
            <h3>Skipped Tests</h3>
            <p id="skipped-count">-</p>
        </div>
    </div>
    
    <script>
        // Parse results and update counts
        // This would be populated by parsing the JSON results
    </script>
</body>
</html>
EOF
        
        log "SUCCESS" "Summary report generated at: ${REPORTS_DIR}/summary.html"
    fi
    
    log "SUCCESS" "Report generation completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

DEBUG=false
UPDATE_SNAPSHOTS=false
SERIAL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--browsers)
            BROWSERS="$2"
            shift 2
            ;;
        -s|--suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        --headless)
            HEADLESS="$2"
            shift 2
            ;;
        --workers)
            WORKERS="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --record-video)
            RECORD_VIDEO="$2"
            shift 2
            ;;
        --screenshots)
            TAKE_SCREENSHOTS="$2"
            shift 2
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --update-snapshots)
            UPDATE_SNAPSHOTS=true
            shift
            ;;
        --serial)
            SERIAL=true
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
    log "INFO" "Starting E2E testing process..."
    log "INFO" "Configuration:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Test Suite: $TEST_SUITE"
    log "INFO" "  Browsers: $BROWSERS"
    log "INFO" "  Base URL: $BASE_URL"
    log "INFO" "  Headless: $HEADLESS"
    log "INFO" "  Workers: $WORKERS"
    log "INFO" "  Retries: $RETRIES"
    
    # Setup environment
    setup_environment
    
    # Start application if needed
    start_application "$ENVIRONMENT"
    
    # Generate configuration
    generate_playwright_config
    
    # Create test suites if they don't exist
    if [ ! -d "${PROJECT_ROOT}/tests/e2e" ] || [ -z "$(ls -A "${PROJECT_ROOT}/tests/e2e" 2>/dev/null)" ]; then
        create_test_suites
    fi
    
    # Run tests
    if run_tests "$TEST_SUITE"; then
        TEST_RESULT=0
    else
        TEST_RESULT=1
    fi
    
    # Generate reports
    generate_reports
    
    # Final status
    if [ $TEST_RESULT -eq 0 ]; then
        log "SUCCESS" "All E2E tests completed successfully!"
    else
        log "ERROR" "Some E2E tests failed"
    fi
    
    log "INFO" "Test log: $LOG_FILE"
    log "INFO" "Test reports: $REPORTS_DIR"
    
    exit $TEST_RESULT
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 