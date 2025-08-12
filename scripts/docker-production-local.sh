#!/bin/bash
# Docker Production-Local Management Script
# Quản lý Docker containers cho testing production locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start production-local environment
start_environment() {
    print_status "Starting production-local environment..."
    
    # Switch to production-local environment
    print_status "Switching to production-local environment..."
    ./scripts/switch-env.sh prod-local
    
    # Build and start services
    print_status "Building and starting Docker services..."
    docker-compose -f docker-compose.production-local.yml up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_services_health
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.production-local.yml exec app npx prisma db push
    
    print_success "Production-local environment is ready!"
    print_status "Access your application at: http://localhost:10001"
    print_status "Database: localhost:5433"
    print_status "Redis: localhost:6380"
}

# Function to stop environment
stop_environment() {
    print_status "Stopping production-local environment..."
    docker-compose -f docker-compose.production-local.yml down
    print_success "Environment stopped."
}

# Function to restart environment
restart_environment() {
    print_status "Restarting production-local environment..."
    stop_environment
    sleep 2
    start_environment
}

# Function to check services health
check_services_health() {
    print_status "Checking services health..."
    
    # Check PostgreSQL
    if docker-compose -f docker-compose.production-local.yml exec postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL is healthy"
    else
        print_warning "PostgreSQL might not be ready yet"
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.production-local.yml exec redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_warning "Redis might not be ready yet"
    fi
    
    # Check Application
    sleep 5
    if curl -f http://localhost:10001/api/health >/dev/null 2>&1; then
        print_success "Application is healthy"
    else
        print_warning "Application might not be ready yet"
    fi
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose -f docker-compose.production-local.yml logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose -f docker-compose.production-local.yml logs -f
    fi
}

# Function to clean up everything
clean_environment() {
    print_warning "This will remove all production-local data. Are you sure? (y/N)"
    read -r confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_status "Cleaning up production-local environment..."
        docker-compose -f docker-compose.production-local.yml down -v --remove-orphans
        docker system prune -f
        print_success "Environment cleaned up."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "Production-local environment status:"
    docker-compose -f docker-compose.production-local.yml ps
    
    print_status "\nContainer health status:"
    docker-compose -f docker-compose.production-local.yml exec postgres pg_isready -U postgres || print_warning "PostgreSQL not ready"
    docker-compose -f docker-compose.production-local.yml exec redis redis-cli ping || print_warning "Redis not ready"
    curl -f http://localhost:10001/api/health >/dev/null 2>&1 && print_success "Application healthy" || print_warning "Application not ready"
}

# Function to access database
database_shell() {
    print_status "Connecting to production-local database..."
    docker-compose -f docker-compose.production-local.yml exec postgres psql -U postgres -d demovoicehotelsaas_prod_local
}

# Function to run tests in production environment
run_tests() {
    print_status "Running tests in production-local environment..."
    
    # Ensure environment is running
    if ! docker-compose -f docker-compose.production-local.yml ps | grep -q "Up"; then
        print_error "Environment is not running. Start it first with: $0 start"
        exit 1
    fi
    
    # Run pre-deployment tests
    print_status "Running pre-deployment tests..."
    docker-compose -f docker-compose.production-local.yml exec app node scripts/pre-deployment-test.cjs
    
    # Test application endpoints
    print_status "Testing application endpoints..."
    curl -f http://localhost:10001/api/health && print_success "Health check passed"
    
    print_success "Production-local tests completed!"
}

# Function to show help
show_help() {
    echo "Docker Production-Local Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start production-local environment"
    echo "  stop      Stop production-local environment"
    echo "  restart   Restart production-local environment"
    echo "  status    Show environment status"
    echo "  logs      Show logs (optional: specify service name)"
    echo "  test      Run tests in production environment"
    echo "  db        Connect to database shell"
    echo "  clean     Clean up environment (removes all data)"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start environment"
    echo "  $0 logs app             # Show app logs"
    echo "  $0 test                 # Run production tests"
    echo "  $0 db                   # Connect to database"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        start)
            start_environment
            ;;
        stop)
            stop_environment
            ;;
        restart)
            restart_environment
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        test)
            run_tests
            ;;
        db)
            database_shell
            ;;
        clean)
            clean_environment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"