import { TestSuite } from '../testFramework';

// ============================================
// GUEST JOURNEY API TEST SUITES
// ============================================

export const guestAuthenticationTests: TestSuite = {
  name: 'Guest Authentication APIs',
  description: 'Test guest authentication and request creation functionality',
  category: 'integration',
  version: 'v2.2',
  tags: ['guest', 'auth', 'api'],
  tests: [
    {
      name: 'Guest Authentication - Success',
      description:
        'Test successful guest authentication with valid credentials',
      method: 'POST',
      endpoint: '/api/guest/auth',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        roomNumber: '101',
        lastName: 'Smith',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.token &&
          response.data.guest &&
          response.data.guest.roomNumber === '101'
        );
      },
      tags: ['auth', 'success'],
    },
    {
      name: 'Guest Authentication - Invalid Room',
      description: 'Test authentication failure with invalid room number',
      method: 'POST',
      endpoint: '/api/guest/auth',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        roomNumber: '999',
        lastName: 'Smith',
      },
      expectedStatus: 401,
      customValidation: response => {
        return !response.success && response.error;
      },
      tags: ['auth', 'error', 'validation'],
    },
    {
      name: 'Guest Request Creation',
      description: 'Test creating a new guest service request',
      method: 'POST',
      endpoint: '/api/guest/requests',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-guest-token',
        'API-Version': 'v2.2',
      },
      body: {
        type: 'room_service',
        description: 'I would like to order two sandwiches and coffee',
        roomNumber: '101',
        priority: 'normal',
      },
      expectedStatus: 201,
      customValidation: response => {
        return (
          response.success &&
          response.data.id &&
          response.data.type === 'room_service' &&
          response.data.roomNumber === '101'
        );
      },
      tags: ['request', 'creation'],
    },
    {
      name: 'Guest Request List',
      description: 'Test retrieving guest requests with pagination',
      method: 'GET',
      endpoint: '/api/guest/requests',
      headers: {
        Authorization: 'Bearer test-guest-token',
        'API-Version': 'v2.2',
      },
      query: {
        page: 1,
        limit: 10,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.pagination
        );
      },
      tags: ['request', 'list', 'pagination'],
    },
  ],
};

export const callManagementTests: TestSuite = {
  name: 'Call Management APIs',
  description: 'Test voice call recording, retrieval, and management',
  category: 'integration',
  version: 'v2.2',
  tags: ['calls', 'voice', 'api'],
  tests: [
    {
      name: 'Call Creation',
      description: 'Test creating a new voice call record',
      method: 'POST',
      endpoint: '/api/calls',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        callIdVapi: 'vapi-test-123',
        roomNumber: '101',
        language: 'en',
        serviceType: 'room_service',
        startTime: new Date().toISOString(),
      },
      expectedStatus: 201,
      customValidation: response => {
        return (
          response.success &&
          response.data.id &&
          response.data.callIdVapi === 'vapi-test-123' &&
          response.data.roomNumber === '101'
        );
      },
      tags: ['call', 'creation'],
    },
    {
      name: 'Call List with Basic Pagination',
      description: 'Test retrieving calls with basic pagination',
      method: 'GET',
      endpoint: '/api/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        page: 1,
        limit: 20,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.pagination &&
          response.meta.pagination.page === 1 &&
          response.meta.pagination.limit === 20
        );
      },
      tags: ['call', 'list', 'pagination'],
    },
    {
      name: 'Call List with Advanced Filtering',
      description: 'Test advanced filtering with AND/OR logic',
      method: 'GET',
      endpoint: '/api/v2/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        'advancedFilter[AND][0][field]': 'language',
        'advancedFilter[AND][0][operator]': 'eq',
        'advancedFilter[AND][0][value]': 'en',
        'advancedFilter[AND][1][field]': 'duration',
        'advancedFilter[AND][1][operator]': 'gt',
        'advancedFilter[AND][1][value]': '60',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.advancedQuery &&
          response.meta.advancedQuery.filterSummary
        );
      },
      tags: ['call', 'advanced-filter', 'AND-logic'],
    },
    {
      name: 'Call List with Filter Presets',
      description: 'Test using predefined filter presets',
      method: 'GET',
      endpoint: '/api/v2/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        preset: 'TODAY_CALLS',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.preset === 'TODAY_CALLS'
        );
      },
      tags: ['call', 'preset', 'filtering'],
    },
    {
      name: 'Call Details with Transcripts',
      description: 'Test retrieving specific call with transcript count',
      method: 'GET',
      endpoint: '/api/calls/test-call-123',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.call &&
          response.data.call.id === 'test-call-123' &&
          typeof response.data.transcriptCount === 'number'
        );
      },
      tags: ['call', 'details', 'transcripts'],
    },
  ],
};

export const transcriptManagementTests: TestSuite = {
  name: 'Transcript Management APIs',
  description: 'Test voice transcript storage, retrieval, and search',
  category: 'integration',
  version: 'v2.2',
  tags: ['transcripts', 'voice', 'api'],
  tests: [
    {
      name: 'Transcript Creation',
      description: 'Test storing a new voice transcript',
      method: 'POST',
      endpoint: '/api/transcripts',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        callId: 'test-call-123',
        role: 'user',
        content: 'I would like to order room service please',
        timestamp: new Date().toISOString(),
      },
      expectedStatus: 201,
      customValidation: response => {
        return (
          response.success &&
          response.data.id &&
          response.data.callId === 'test-call-123' &&
          response.data.role === 'user'
        );
      },
      tags: ['transcript', 'creation'],
    },
    {
      name: 'Transcript Search',
      description: 'Test searching transcripts by content',
      method: 'GET',
      endpoint: '/api/transcripts',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        search: 'room service',
        searchFields: 'content',
        page: 1,
        limit: 10,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.search &&
          response.meta.search.query === 'room service'
        );
      },
      tags: ['transcript', 'search', 'content'],
    },
    {
      name: 'Call-Specific Transcripts',
      description: 'Test retrieving transcripts for a specific call',
      method: 'GET',
      endpoint: '/api/transcripts/test-call-123',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        role: 'user',
        page: 1,
        limit: 50,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.callId === 'test-call-123'
        );
      },
      tags: ['transcript', 'call-specific', 'filter'],
    },
    {
      name: 'Transcript Date Range Filter',
      description: 'Test filtering transcripts by date range',
      method: 'GET',
      endpoint: '/api/transcripts',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        sort: 'timestamp',
        order: 'desc',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.dateRange
        );
      },
      tags: ['transcript', 'date-filter', 'sorting'],
    },
  ],
};

export const summaryManagementTests: TestSuite = {
  name: 'Summary Management APIs',
  description: 'Test call summary creation, retrieval, and management',
  category: 'integration',
  version: 'v2.2',
  tags: ['summaries', 'api'],
  tests: [
    {
      name: 'Summary Creation',
      description: 'Test creating a call summary',
      method: 'POST',
      endpoint: '/api/summaries',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        callId: 'test-call-123',
        content:
          'Guest requested room service: 2 sandwiches, 1 coffee. Delivered to room 101.',
        roomNumber: '101',
        duration: 300,
      },
      expectedStatus: 201,
      customValidation: response => {
        return (
          response.success &&
          response.data.id &&
          response.data.callId === 'test-call-123' &&
          response.data.roomNumber === '101'
        );
      },
      tags: ['summary', 'creation'],
    },
    {
      name: 'Summary List with Pagination',
      description: 'Test retrieving summaries with pagination',
      method: 'GET',
      endpoint: '/api/summaries',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        page: 1,
        limit: 20,
        sort: 'timestamp',
        order: 'desc',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.pagination
        );
      },
      tags: ['summary', 'list', 'pagination'],
    },
    {
      name: 'Call-Specific Summary',
      description: 'Test retrieving summary for a specific call',
      method: 'GET',
      endpoint: '/api/summaries/test-call-123',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.callId === 'test-call-123'
        );
      },
      tags: ['summary', 'call-specific'],
    },
    {
      name: 'Summary Search by Content',
      description: 'Test searching summaries by content',
      method: 'GET',
      endpoint: '/api/summaries',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        search: 'room service',
        searchFields: 'content',
        page: 1,
        limit: 10,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.search
        );
      },
      tags: ['summary', 'search'],
    },
  ],
};

export const emailServiceTests: TestSuite = {
  name: 'Email Service APIs',
  description: 'Test email sending for service confirmations and notifications',
  category: 'integration',
  version: 'v2.2',
  tags: ['emails', 'api'],
  tests: [
    {
      name: 'Service Confirmation Email',
      description: 'Test sending service confirmation email',
      method: 'POST',
      endpoint: '/api/emails/service',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        recipientEmail: 'guest@hotel.com',
        recipientName: 'John Smith',
        roomNumber: '101',
        serviceType: 'room_service',
        serviceDetails: '2 sandwiches, 1 coffee',
        estimatedTime: '30 minutes',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.messageId &&
          response.data.recipient === 'guest@hotel.com'
        );
      },
      tags: ['email', 'service', 'confirmation'],
    },
    {
      name: 'Call Summary Email',
      description: 'Test sending call summary email',
      method: 'POST',
      endpoint: '/api/emails/summary',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        recipientEmail: 'guest@hotel.com',
        recipientName: 'John Smith',
        roomNumber: '101',
        callSummary:
          'Guest requested room service. Order processed successfully.',
        callDuration: 300,
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.messageId &&
          response.data.recipient === 'guest@hotel.com'
        );
      },
      tags: ['email', 'summary', 'call'],
    },
    {
      name: 'Recent Emails List',
      description: 'Test retrieving recent emails with pagination',
      method: 'GET',
      endpoint: '/api/emails/recent',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        page: 1,
        limit: 10,
        type: 'service',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.meta &&
          response.meta.pagination
        );
      },
      tags: ['email', 'list', 'recent'],
    },
  ],
};

export const translationServiceTests: TestSuite = {
  name: 'Translation Service APIs',
  description: 'Test text translation services',
  category: 'integration',
  version: 'v2.2',
  tags: ['translations', 'api'],
  tests: [
    {
      name: 'Text Translation to Vietnamese',
      description: 'Test translating text to Vietnamese',
      method: 'POST',
      endpoint: '/api/translations',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        text: 'I would like to order room service',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.originalText &&
          response.data.translatedText &&
          response.data.language === 'vi'
        );
      },
      tags: ['translation', 'vietnamese'],
    },
    {
      name: 'Empty Text Validation',
      description: 'Test validation with empty text',
      method: 'POST',
      endpoint: '/api/translations',
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v2.2',
      },
      body: {
        text: '',
      },
      expectedStatus: 400,
      customValidation: response => {
        return !response.success && response.error;
      },
      tags: ['translation', 'validation', 'error'],
    },
  ],
};

// ============================================
// VERSION COMPATIBILITY TESTS
// ============================================

export const versionCompatibilityTests: TestSuite = {
  name: 'API Version Compatibility',
  description: 'Test backward compatibility across API versions',
  category: 'integration',
  version: 'v2.2',
  tags: ['version', 'compatibility', 'api'],
  tests: [
    {
      name: 'v1.1 Calls Endpoint Compatibility',
      description: 'Test v1.1 calls endpoint returns compatible response',
      method: 'GET',
      endpoint: '/api/v1.1/calls',
      headers: {
        'API-Version': 'v1.1',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.meta &&
          response.meta.requestVersion === 'v1.1' &&
          response.meta.compatibility === 'deprecated'
        );
      },
      tags: ['v1.1', 'compatibility', 'deprecated'],
    },
    {
      name: 'v2.0 Calls Endpoint Compatibility',
      description: 'Test v2.0 calls endpoint compatibility',
      method: 'GET',
      endpoint: '/api/v2.0/calls',
      headers: {
        'API-Version': 'v2.0',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.meta &&
          response.meta.requestVersion === 'v2.0' &&
          response.meta.compatibility === 'partial'
        );
      },
      tags: ['v2.0', 'compatibility'],
    },
    {
      name: 'Version Auto-Detection from URL',
      description: 'Test automatic version detection from URL path',
      method: 'GET',
      endpoint: '/api/v2.2/calls',
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.meta &&
          response.meta.apiVersion === 'v2.2' &&
          response.meta.requestVersion === 'v2.2'
        );
      },
      tags: ['auto-detection', 'url'],
    },
    {
      name: 'Version Header Override',
      description: 'Test version header overrides URL version',
      method: 'GET',
      endpoint: '/api/calls',
      headers: {
        'API-Version': 'v2.1',
      },
      expectedStatus: 200,
      customValidation: response => {
        return (
          response.success &&
          response.meta &&
          response.meta.requestVersion === 'v2.1'
        );
      },
      tags: ['header-override', 'version'],
    },
  ],
};

// ============================================
// EXPORT ALL TEST SUITES
// ============================================

export const allGuestJourneyTestSuites: TestSuite[] = [
  guestAuthenticationTests,
  callManagementTests,
  transcriptManagementTests,
  summaryManagementTests,
  emailServiceTests,
  translationServiceTests,
  versionCompatibilityTests,
];

export default {
  guestAuthenticationTests,
  callManagementTests,
  transcriptManagementTests,
  summaryManagementTests,
  emailServiceTests,
  translationServiceTests,
  versionCompatibilityTests,
  allGuestJourneyTestSuites,
};
