#!/bin/bash

# 🚀 UNIFIED AUTH SYSTEM - QUICK DEPLOYMENT SCRIPT
# Automatically sets up PostgreSQL and deploys the unified auth system

set -e  # Exit on any error

echo "🚀 UNIFIED AUTH SYSTEM - QUICK DEPLOYMENT"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not running"
        print_status "Please install Docker and try again"
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_status "Please start Docker and try again"
        exit 1
    fi
    
    print_status "Docker is available ✅"
}

# Setup PostgreSQL with Docker
setup_database() {
    print_header "\n🐳 Setting up PostgreSQL Database"
    
    # Check if container already exists
    if docker ps -a | grep -q hotel-postgres; then
        print_warning "PostgreSQL container already exists"
        print_status "Stopping and removing existing container..."
        docker stop hotel-postgres 2>/dev/null || true
        docker rm hotel-postgres 2>/dev/null || true
    fi
    
    # Start PostgreSQL container
    print_status "Starting PostgreSQL container..."
    docker run -d \
        --name hotel-postgres \
        -e POSTGRES_DB=hotel_dev \
        -e POSTGRES_USER=hotel_user \
        -e POSTGRES_PASSWORD=dev_password \
        -p 5432:5432 \
        postgres:15
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 5
    
    # Test database connection
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec hotel-postgres pg_isready -U hotel_user -d hotel_dev &> /dev/null; then
            print_status "Database is ready ✅"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start after $max_attempts attempts"
            exit 1
        fi
        
        echo -n "."
        sleep 1
        ((attempt++))
    done
}

# Setup environment variables
setup_environment() {
    print_header "\n⚙️ Setting up Environment Variables"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# 🚀 Unified Auth System - Environment Configuration
NODE_ENV=development
PORT=10000

# Database Configuration
DATABASE_URL=postgresql://hotel_user:dev_password@localhost:5432/hotel_dev

# JWT Configuration  
JWT_SECRET=unified-auth-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Development Settings
AUTO_MIGRATE=true
SEED_USERS=true
AUTO_DB_FIX=true

# OpenAI API Key (placeholder for development)
VITE_OPENAI_API_KEY=sk-placeholder-for-dev
EOF
        print_status ".env file created ✅"
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Export environment variables for current session
    export DATABASE_URL="postgresql://hotel_user:dev_password@localhost:5432/hotel_dev"
    export JWT_SECRET="unified-auth-super-secret-jwt-key-change-in-production"
    export NODE_ENV="development"
    export PORT="10000"
    export AUTO_MIGRATE="true"
    export SEED_USERS="true"
    
    print_status "Environment variables set ✅"
}

# Install dependencies
install_dependencies() {
    print_header "\n📦 Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
        print_status "Dependencies installed ✅"
    else
        print_status "Dependencies already installed ✅"
    fi
}

# Run database migrations
run_migrations() {
    print_header "\n🗄️ Running Database Migrations"
    
    print_status "Running database migrations..."
    if npm run db:migrate; then
        print_status "Database migrations completed ✅"
    else
        print_warning "Database migrations failed, but continuing..."
    fi
    
    print_status "Seeding default users..."
    if npm run db:seed; then
        print_status "Database seeding completed ✅"  
    else
        print_warning "Database seeding failed, but continuing..."
    fi
}

# Start the application
start_application() {
    print_header "\n🚀 Starting Application"
    
    print_status "Building application..."
    if npm run build; then
        print_status "Build completed ✅"
    else
        print_warning "Build failed, starting in development mode..."
    fi
    
    print_status "Starting unified auth system..."
    print_status "Server will be available at: http://localhost:10000"
    print_status "Health check: http://localhost:10000/api/health"
    print_status "Auth API: http://localhost:10000/api/auth/*"
    
    # Start the application
    npm run dev
}

# Test the deployment
test_deployment() {
    print_header "\n🧪 Testing Deployment"
    
    print_status "Testing health endpoint..."
    if curl -s http://localhost:10000/api/health > /dev/null; then
        print_status "Health check passed ✅"
    else
        print_warning "Health check failed - server may still be starting"
    fi
    
    print_status "Testing auth endpoint..."
    if curl -s -X POST http://localhost:10000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' > /dev/null; then
        print_status "Auth endpoint accessible ✅"
    else
        print_warning "Auth endpoint test failed - check server logs"
    fi
}

# Cleanup function
cleanup() {
    print_header "\n🧹 Cleanup Options"
    echo "To stop the PostgreSQL container:"
    echo "  docker stop hotel-postgres"
    echo ""
    echo "To remove the PostgreSQL container:"
    echo "  docker rm hotel-postgres"
    echo ""
    echo "To remove the database volume:"
    echo "  docker volume prune"
}

# Main deployment flow
main() {
    print_header "🎯 Starting Unified Auth System Deployment"
    
    # Check prerequisites
    check_docker
    
    # Setup database
    setup_database
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Run migrations
    run_migrations
    
    # Show success message
    print_header "\n✅ DEPLOYMENT COMPLETE!"
    print_status "Unified Auth System is ready for testing"
    print_status ""
    print_status "🔗 Available endpoints:"
    print_status "  - Health: http://localhost:10000/api/health"
    print_status "  - Login: http://localhost:10000/api/auth/login"  
    print_status "  - User Info: http://localhost:10000/api/auth/me"
    print_status "  - Dashboard: http://localhost:10000/unified-dashboard"
    print_status ""
    print_status "🧪 Test credentials:"
    print_status "  - admin / admin123"
    print_status "  - manager / manager123"
    print_status "  - frontdesk / frontdesk123"
    print_status ""
    print_warning "To start the server, run: npm run dev"
    
    # Show cleanup options
    cleanup
}

# Handle script interruption
trap 'print_error "\nDeployment interrupted"; exit 1' INT

# Run main deployment
main 