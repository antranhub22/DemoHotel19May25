/* ========================================
   MOCKS - MOCK FUNCTIONS AND OBJECTS
   ======================================== */

// ========================================
// API MOCKS
// ========================================

export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  setToken: jest.fn(),
  clearToken: jest.fn(),
};

export const mockFetch = jest.fn();

export const mockResponse = {
  ok: true,
  status: 200,
  json: jest.fn(),
  text: jest.fn(),
  headers: new Headers(),
};

export const mockErrorResponse = {
  ok: false,
  status: 400,
  json: jest.fn(),
  text: jest.fn(),
  headers: new Headers(),
};

// ========================================
// DATABASE MOCKS
// ========================================

export const mockDatabase = {
  query: jest.fn(),
  execute: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
};

export const mockDbConnection = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  query: jest.fn(),
  execute: jest.fn(),
};

// ========================================
// AUTHENTICATION MOCKS
// ========================================

export const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  verifyToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

export const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

// ========================================
// EMAIL MOCKS
// ========================================

export const mockEmailService = {
  sendEmail: jest.fn(),
  sendTemplate: jest.fn(),
  verifyConnection: jest.fn(),
};

export const mockNodemailer = {
  createTransport: jest.fn(),
  sendMail: jest.fn(),
};

// ========================================
// VAPI MOCKS
// ========================================

export const mockVapiClient = {
  startCall: jest.fn(),
  endCall: jest.fn(),
  getCallStatus: jest.fn(),
  getTranscript: jest.fn(),
};

export const mockVapiResponse = {
  callId: 'mock-call-id',
  status: 'in-progress',
  transcript: 'Mock transcript',
};

// ========================================
// OPENAI MOCKS
// ========================================

export const mockOpenAIClient = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

export const mockOpenAIResponse = {
  choices: [
    {
      message: {
        content: 'Mock AI response',
      },
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
};

// ========================================
// WEBSOCKET MOCKS
// ========================================

export const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const mockWebSocketServer = {
  on: jest.fn(),
  emit: jest.fn(),
  to: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
};

// ========================================
// FILE SYSTEM MOCKS
// ========================================

export const mockFileSystem = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
};

export const mockPath = {
  join: jest.fn(),
  resolve: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn(),
};

// ========================================
// LOGGING MOCKS
// ========================================

export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// ========================================
// TIMER MOCKS
// ========================================

export const mockSetTimeout = jest.fn();
export const mockClearTimeout = jest.fn();
export const mockSetInterval = jest.fn();
export const mockClearInterval = jest.fn();

export const mockDate = {
  now: jest.fn(),
  parse: jest.fn(),
  UTC: jest.fn(),
};

// ========================================
// CRYPTO MOCKS
// ========================================

export const mockCrypto = {
  randomBytes: jest.fn(),
  createHash: jest.fn(),
  createHmac: jest.fn(),
};

export const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
};

// ========================================
// VALIDATION MOCKS
// ========================================

export const mockZod = {
  string: jest.fn(),
  number: jest.fn(),
  boolean: jest.fn(),
  object: jest.fn(),
  array: jest.fn(),
  enum: jest.fn(),
  union: jest.fn(),
  literal: jest.fn(),
  optional: jest.fn(),
  nullable: jest.fn(),
  default: jest.fn(),
  parse: jest.fn(),
  safeParse: jest.fn(),
};

// ========================================
// UTILITY MOCKS
// ========================================

export const mockUtils = {
  generateId: jest.fn(),
  formatDate: jest.fn(),
  formatCurrency: jest.fn(),
  validateEmail: jest.fn(),
  sanitizeInput: jest.fn(),
  encryptData: jest.fn(),
  decryptData: jest.fn(),
};

// ========================================
// CONFIGURATION MOCKS
// ========================================

export const mockConfig = {
  database: {
    url: 'mock-database-url',
    type: 'sqlite',
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000,
  },
  auth: {
    jwtSecret: 'mock-jwt-secret',
    expiresIn: '24h',
  },
  email: {
    service: 'gmail',
    user: 'mock@email.com',
    pass: 'mock-password',
  },
  vapi: {
    publicKey: 'mock-vapi-key',
    assistantId: 'mock-assistant-id',
  },
  openai: {
    apiKey: 'mock-openai-key',
    model: 'gpt-4',
  },
};

// ========================================
// ENVIRONMENT MOCKS
// ========================================

export const mockProcessEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'mock-database-url',
  JWT_SECRET: 'mock-jwt-secret',
  VAPI_PUBLIC_KEY: 'mock-vapi-key',
  VAPI_ASSISTANT_ID: 'mock-assistant-id',
  OPENAI_API_KEY: 'mock-openai-key',
  EMAIL_USER: 'mock@email.com',
  EMAIL_PASS: 'mock-password',
};

// ========================================
// MOCK SETUP HELPERS
// ========================================

export const setupMocks = () => {
  // Setup global mocks
  global.fetch = mockFetch;
  global.console = mockConsole;
  
  // Setup timer mocks
  global.setTimeout = mockSetTimeout;
  global.clearTimeout = mockClearTimeout;
  global.setInterval = mockSetInterval;
  global.clearInterval = mockClearInterval;
  
  // Setup crypto mocks
  global.crypto = mockCrypto as any;
  
  // Setup process env
  process.env = { ...process.env, ...mockProcessEnv };
};

export const resetMocks = () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset mock implementations
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.put.mockReset();
  mockApiClient.delete.mockReset();
  mockApiClient.patch.mockReset();
  
  mockFetch.mockReset();
  mockResponse.json.mockReset();
  mockErrorResponse.json.mockReset();
  
  mockAuthService.login.mockReset();
  mockAuthService.logout.mockReset();
  mockAuthService.refreshToken.mockReset();
  
  mockEmailService.sendEmail.mockReset();
  mockVapiClient.startCall.mockReset();
  mockOpenAIClient.chat.completions.create.mockReset();
  
  mockWebSocket.send.mockReset();
  mockWebSocket.close.mockReset();
  
  mockLogger.info.mockReset();
  mockLogger.warn.mockReset();
  mockLogger.error.mockReset();
  mockLogger.debug.mockReset();
  
  mockUtils.generateId.mockReset();
  mockUtils.formatDate.mockReset();
  mockUtils.validateEmail.mockReset();
  
  mockZod.parse.mockReset();
  mockZod.safeParse.mockReset();
  
  mockBcrypt.hash.mockReset();
  mockBcrypt.compare.mockReset();
  
  mockCrypto.randomBytes.mockReset();
  mockCrypto.createHash.mockReset();
  
  mockSetTimeout.mockReset();
  mockClearTimeout.mockReset();
  mockSetInterval.mockReset();
  mockClearInterval.mockReset();
  
  mockDate.now.mockReset();
  mockDate.parse.mockReset();
  mockDate.UTC.mockReset();
};

export const setupMockImplementations = () => {
  // Setup default mock implementations
  mockFetch.mockResolvedValue(mockResponse);
  mockResponse.json.mockResolvedValue({ success: true, data: {} });
  mockResponse.text.mockResolvedValue('Mock response text');
  
  mockAuthService.login.mockResolvedValue({
    success: true,
    data: {
      token: 'mock-token',
      user: { id: 1, username: 'testuser', role: 'admin' },
    },
  });
  
  mockAuthService.verifyToken.mockResolvedValue({
    success: true,
    data: { userId: 1, role: 'admin' },
  });
  
  mockEmailService.sendEmail.mockResolvedValue({
    success: true,
    messageId: 'mock-message-id',
  });
  
  mockVapiClient.startCall.mockResolvedValue({
    success: true,
    data: { callId: 'mock-call-id', status: 'in-progress' },
  });
  
  mockOpenAIClient.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
  
  mockWebSocket.send.mockImplementation(() => {});
  mockWebSocket.close.mockImplementation(() => {});
  
  mockLogger.info.mockImplementation(() => {});
  mockLogger.warn.mockImplementation(() => {});
  mockLogger.error.mockImplementation(() => {});
  mockLogger.debug.mockImplementation(() => {});
  
  mockUtils.generateId.mockReturnValue('mock-generated-id');
  mockUtils.formatDate.mockReturnValue('2024-01-01');
  mockUtils.validateEmail.mockReturnValue(true);
  
  mockZod.parse.mockImplementation((data) => data);
  mockZod.safeParse.mockResolvedValue({ success: true, data: {} });
  
  mockBcrypt.hash.mockResolvedValue('mock-hashed-password');
  mockBcrypt.compare.mockResolvedValue(true);
  
  mockCrypto.randomBytes.mockReturnValue(Buffer.from('mock-random-bytes'));
  mockCrypto.createHash.mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  });
  
  mockSetTimeout.mockImplementation((callback, delay) => {
    setTimeout(callback, delay);
    return 1;
  });
  
  mockClearTimeout.mockImplementation(() => {});
  mockSetInterval.mockImplementation((callback, delay) => {
    setInterval(callback, delay);
    return 1;
  });
  
  mockClearInterval.mockImplementation(() => {});
  
  mockDate.now.mockReturnValue(1704067200000); // 2024-01-01 00:00:00 UTC
  mockDate.parse.mockReturnValue(1704067200000);
  mockDate.UTC.mockReturnValue(1704067200000);
}; 