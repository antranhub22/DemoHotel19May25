# 🧪 Hotel Research Flow Testing System

## Overview

This comprehensive testing system validates the complete hotel research flow from hotel name input
through research, knowledge base generation, assistant creation, and database storage. The system
ensures all components work together seamlessly in the multi-tenant SaaS platform.

## 🎯 What This Tests

### ✅ Complete Hotel Research Flow

- **Hotel Name Input**: Validates input processing and validation
- **Research Pipeline**: End-to-end research → knowledge base → assistant → database
- **Data Integrity**: Ensures data preservation throughout the flow
- **Multi-tenant Support**: Verifies tenant isolation and data association

### ✅ API Integrations

- **Google Places API**: Hotel information retrieval and validation
- **Vapi AI API**: Dynamic assistant creation and management
- **Website Scraping**: Additional hotel information extraction
- **Rate Limiting**: API usage limits and throttling

### ✅ Knowledge Base Generation

- **Data Processing**: Hotel data transformation and structuring
- **Content Generation**: System prompts, FAQs, and service menus
- **Validation**: Knowledge base completeness and accuracy
- **Customization**: Personality and tone configuration

### ✅ Database Operations

- **Storage**: Hotel profiles, research data, and assistant configurations
- **Retrieval**: Data queries and tenant-specific filtering
- **Tenant Isolation**: Multi-tenant data security
- **Data Integrity**: Referential integrity and consistency

### ✅ Error Scenarios

- **Network Failures**: API timeouts and connection issues
- **Invalid Data**: Malformed inputs and edge cases
- **API Errors**: Rate limiting and authentication failures
- **Database Errors**: Connection failures and constraint violations

## 🚀 Quick Start

### Run All Tests

```bash
# Complete test suite
npm run test:hotel-research:all

# Quick test (mock + smoke)
npm run test:hotel-research:quick

# Production-ready test
npm run test:hotel-research:production
```

### Specific Test Scenarios

```bash
# Safe mock test (no API calls)
npm run test:hotel-research:mock

# API integration test
npm run test:hotel-research:api

# Error scenarios test
npm run test:hotel-research:errors
```

## 📋 Test Scenarios

### 1. Mock Test (`mock`)

- **Purpose**: Safe testing with fake data
- **API Calls**: None (uses mock data)
- **Database**: SQLite test database
- **Use Case**: Local development and CI/CD

```bash
npm run test:hotel-research:mock
```

### 2. Development Test (`development`)

- **Purpose**: Full integration test with SQLite
- **API Calls**: Real API calls to external services
- **Database**: SQLite test database
- **Use Case**: Local development validation

```bash
npm run test:hotel-research:development
```

### 3. Production Test (`production`)

- **Purpose**: Full production-like test
- **API Calls**: Real API calls to external services
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Use Case**: Pre-deployment validation

```bash
npm run test:hotel-research:production
```

### 4. Smoke Test (`smoke`)

- **Purpose**: Quick functionality verification
- **API Calls**: None (uses mock data)
- **Database**: SQLite test database
- **Use Case**: CI/CD pipeline and health checks

```bash
npm run test:hotel-research:quick
```

### 5. API Integration Test (`apiOnly`)

- **Purpose**: Focus on API integrations
- **API Calls**: Real API calls with comprehensive testing
- **Database**: SQLite test database
- **Use Case**: API validation and debugging

```bash
npm run test:hotel-research:api
```

### 6. Error Scenarios Test (`errorScenarios`)

- **Purpose**: Test error handling and edge cases
- **API Calls**: Real API calls with error injection
- **Database**: SQLite test database
- **Use Case**: Resilience and error handling validation

```bash
npm run test:hotel-research:errors
```

## 🔍 Test Steps Explained

### Step 1: Initialize Test Environment

- Sets up database connection (PostgreSQL or SQLite)
- Creates test tenant with premium subscription
- Validates service dependencies

### Step 2: Complete Hotel Research Flow

- **Input**: Hotel name and optional location
- **Process**: Research → Knowledge Base → Assistant → Database
- **Validation**: Data integrity and completeness at each step

### Step 3: Google Places API Integration

- Tests API connectivity and authentication
- Validates data retrieval and structure
- Checks rate limiting and error handling

### Step 4: Knowledge Base Generation

- Tests knowledge base creation from hotel data
- Validates system prompt generation
- Checks content quality and completeness

### Step 5: Vapi Assistant Creation

- Tests dynamic assistant creation via API
- Validates assistant configuration and updates
- Checks error handling and cleanup

### Step 6: Database Storage

- Tests hotel profile storage and retrieval
- Validates data integrity and consistency
- Checks tenant isolation and security

### Step 7: Mock Data Testing

- Tests system with predefined mock data
- Validates offline functionality
- Checks data transformation accuracy

### Step 8: Error Scenarios

- Tests invalid inputs and edge cases
- Validates error handling and recovery
- Checks system resilience

### Step 9: API Rate Limiting

- Tests rate limiting enforcement
- Validates throttling and backoff strategies
- Checks error responses and handling

### Step 10: Tenant Isolation

- Tests multi-tenant data security
- Validates tenant-specific data access
- Checks cross-tenant data isolation

## 🛠️ Configuration

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://user:password@host:port/database

# API keys
GOOGLE_PLACES_API_KEY=your_google_places_api_key
VAPI_API_KEY=your_vapi_api_key
VITE_OPENAI_API_KEY=your_openai_api_key

# Test configuration
TEST_RESULTS_DIR=./test-results/hotel-research
TEST_TIMEOUT=30000
```

### Test Configuration Options

```typescript
interface TestConfig {
  databaseUrl?: string; // Database connection string
  testDbPath: string; // SQLite test database path
  useMockData: boolean; // Use mock data instead of API calls
  skipApiCalls: boolean; // Skip all external API calls
  verbose: boolean; // Detailed logging
  testTimeout: number; // Test timeout in milliseconds
}
```

## 📊 Understanding Results

### Success Indicators

- ✅ All test steps completed successfully
- ✅ Data integrity verified throughout flow
- ✅ API integrations working correctly
- ✅ Database operations successful
- ✅ Error handling working properly

### Failure Indicators

- ❌ API integration failures
- ❌ Data integrity issues
- ❌ Database connection problems
- ❌ Tenant isolation breaches
- ❌ Knowledge base generation failures

### Sample Test Report

```markdown
# Hotel Research Flow Test Report

## Summary

- Status: ✅ SUCCESS
- Duration: 15,234.56ms
- Tests Run: 10
- Tests Passed: 10
- Tests Failed: 0
- Success Rate: 100.0%

## Test Coverage

### Hotel Research

- Basic Research: ✅
- Google Places API: ✅
- Error Handling: ✅

### Knowledge Base

- Generation: ✅
- System Prompt: ✅
- Validation: ✅

### Vapi Integration

- Assistant Creation: ✅
- Assistant Update: ✅
- Error Handling: ✅

### Database

- Storage: ✅
- Retrieval: ✅
- Tenant Isolation: ✅
```

## 🔧 Test Development

### Adding New Tests

1. **Create test method** in `HotelResearchFlowTest` class
2. **Add to executeTest calls** in `runCompleteTest()` method
3. **Update coverage tracking** in test results
4. **Add documentation** for new test scenario

### Custom Test Scenarios

```typescript
// Add to TEST_SCENARIOS in run-hotel-research-test.ts
customScenario: {
  testDbPath: './custom-test.db',
  useMockData: false,
  skipApiCalls: false,
  verbose: true,
  testTimeout: 45000,
  description: 'Custom test scenario description'
}
```

### Mock Data Extension

```typescript
// Add to MOCK_HOTEL_DATA in test-hotel-research-flow.ts
const CUSTOM_MOCK_DATA = {
  name: 'Custom Test Hotel',
  // ... additional properties
};
```

## 🚨 Troubleshooting

### Common Issues

#### Test Fails: "Google Places API key not configured"

```bash
# Set the API key
export GOOGLE_PLACES_API_KEY=your_api_key

# Or skip API calls
npm run test:hotel-research:mock
```

#### Test Fails: "Database connection failed"

```bash
# Check database is running
pg_isready -h localhost -p 5432

# Or use SQLite
npm run test:hotel-research:development
```

#### Test Fails: "Vapi assistant creation failed"

```bash
# Check Vapi API key
export VAPI_API_KEY=your_vapi_key

# Or skip API calls
npm run test:hotel-research:mock
```

#### Test Fails: "Knowledge base generation failed"

- Check hotel data structure and completeness
- Verify KnowledgeBaseGenerator service is working
- Review mock data quality

#### Test Fails: "Tenant isolation breach"

- **CRITICAL**: Multi-tenancy bug detected
- **DO NOT DEPLOY**: Review tenant filtering logic
- Check database queries for proper tenant_id filtering

### Performance Issues

- **Slow Tests**: Increase timeout or optimize test data
- **API Rate Limits**: Use mock data or implement backoff
- **Database Timeouts**: Check connection string and network

### Getting Help

1. **Check Logs**: Review detailed test output for specific errors
2. **Review Test Reports**: Analyze generated test reports in `./test-results/`
3. **Validate Environment**: Run `npm run test:hotel-research:validate`
4. **Test Matrix**: Review `npm run test:hotel-research matrix`

## 📁 File Structure

```
tests/
├── test-hotel-research-flow.ts    # Main test implementation
├── README.md                      # This documentation
└── mock-data/                     # Mock data files

scripts/
└── run-hotel-research-test.ts     # Test runner and CLI

test-results/
└── hotel-research/                # Test results and reports
    ├── mock-TIMESTAMP.json        # Test results
    ├── mock-TIMESTAMP.md          # Human-readable report
    └── summary-TIMESTAMP.json     # Test summary
```

## 🎯 Test Coverage Matrix

| Component               | Basic | Advanced | Error Handling | Performance |
| ----------------------- | ----- | -------- | -------------- | ----------- |
| **Hotel Research**      | ✅    | ✅       | ✅             | ✅          |
| **Google Places API**   | ✅    | ✅       | ✅             | ✅          |
| **Knowledge Base**      | ✅    | ✅       | ✅             | ⚠️          |
| **Vapi Integration**    | ✅    | ✅       | ✅             | ⚠️          |
| **Database Operations** | ✅    | ✅       | ✅             | ✅          |
| **Tenant Isolation**    | ✅    | ✅       | ✅             | ✅          |
| **Mock Data**           | ✅    | ✅       | ✅             | ✅          |

Legend: ✅ Full Coverage | ⚠️ Partial Coverage | ❌ No Coverage

## 🚀 Production Usage

### Pre-Deployment Checklist

```bash
# 1. Validate environment
npm run test:hotel-research:validate

# 2. Run quick test
npm run test:hotel-research:quick

# 3. Run full test suite
npm run test:hotel-research:all

# 4. Run production test
npm run test:hotel-research:production
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run Hotel Research Tests
  run: |
    npm run test:hotel-research:quick
    npm run test:hotel-research:mock
```

### Monitoring & Alerts

- **Success Rate**: Should be 100% for critical tests
- **Performance**: Monitor test duration trends
- **Coverage**: Track test coverage across components
- **Failures**: Alert on test failures in CI/CD

## 💡 Best Practices

### Development

- ✅ Run `mock` tests during development
- ✅ Use `development` tests for integration validation
- ✅ Run `quick` tests before committing code
- ✅ Use `api` tests when debugging API issues

### Production

- ✅ Run `production` tests before deployment
- ✅ Monitor test results and trends
- ✅ Set up alerts for test failures
- ✅ Validate environment before testing

### Safety

- ❌ Never run production tests on live data without backups
- ❌ Don't ignore test failures
- ❌ Don't skip environment validation
- ❌ Don't deploy if critical tests fail

---

**💡 Remember**: This testing system validates the complete hotel research flow that powers the
multi-tenant SaaS platform. Thorough testing ensures reliable hotel onboarding and assistant
generation for all tenants.
