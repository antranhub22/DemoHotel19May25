module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'build', '*.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    // Node.js globals
    process: 'readonly',
    console: 'readonly',
    setInterval: 'readonly',
    module: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',

    // React globals
    React: 'readonly',
    ReactNode: 'readonly',
    JSX: 'readonly',
    RefObject: 'readonly',
    MutableRefObject: 'readonly',

    // Express types
    Request: 'readonly',
    Response: 'readonly',
    NextFunction: 'readonly',

    // Drizzle ORM types
    db: 'readonly',
    eq: 'readonly',
    sql: 'readonly',
    and: 'readonly',
    or: 'readonly',
    desc: 'readonly',
    asc: 'readonly',
    count: 'readonly',
    avg: 'readonly',
    sum: 'readonly',
    max: 'readonly',
    min: 'readonly',

    // Database schema tables
    tenants: 'readonly',
    hotelProfiles: 'readonly',
    staff: 'readonly',
    call: 'readonly',
    transcript: 'readonly',
    request: 'readonly',
    message: 'readonly',
    call_summaries: 'readonly',

    // Database types
    Staff: 'readonly',
    InsertStaff: 'readonly',
    Call: 'readonly',
    InsertCall: 'readonly',
    Transcript: 'readonly',
    InsertTranscript: 'readonly',
    RequestRecord: 'readonly',
    InsertRequestRecord: 'readonly',
    Message: 'readonly',
    InsertMessage: 'readonly',
    CallSummary: 'readonly',
    InsertCallSummary: 'readonly',
    Tenant: 'readonly',
    InsertTenant: 'readonly',

    // UI/Client types
    Language: 'readonly',
    ServiceCategory: 'readonly',
    UserRole: 'readonly',
    Permission: 'readonly',
    AuthErrorCode: 'readonly',
    IconType: 'readonly',
    ButtonVariant: 'readonly',
    Size: 'readonly',

    // Service types
    BasicHotelData: 'readonly',
    AdvancedHotelData: 'readonly',
    RoomType: 'readonly',
    LocalAttraction: 'readonly',
    HotelService: 'readonly',
    HotelResearchService: 'readonly',
    KnowledgeBaseGenerator: 'readonly',

    // Auth types
    AuthUser: 'readonly',
    JwtPayload: 'readonly',
    LoginCredentials: 'readonly',
    AuthContextType: 'readonly',
    authenticateJWT: 'readonly',
    requireRole: 'readonly',
    requirePermission: 'readonly',

    // Assistant types
    AssistantConfig: 'readonly',
    VapiCall: 'readonly',
    CallState: 'readonly',
    useAssistant: 'readonly',
    useCallHandler: 'readonly',
    useVapiCall: 'readonly',

    // Configuration types
    EnvironmentConfig: 'readonly',
    PermissionMatrix: 'readonly',
    MenuItemConfig: 'readonly',
    DEFAULT_PERMISSIONS: 'readonly',
    AUTH_ERROR_MESSAGES: 'readonly',
    PERMISSION_MATRIX: 'readonly',
    ROLE_MENU_CONFIG: 'readonly',

    // Third-party library types
    jwtDecode: 'readonly',
    ChartData: 'readonly',
    ChartOptions: 'readonly',

    // React icons
    FaBed: 'readonly',
    FaConcierge: 'readonly',
    FaUtensils: 'readonly',
    FaCar: 'readonly',
    FaSpa: 'readonly',
    FaPhone: 'readonly',
    FaUser: 'readonly',
    FaCog: 'readonly',

    // Error types
    AppError: 'readonly',
    ValidationError: 'readonly',
    AuthError: 'readonly',
    DatabaseError: 'readonly',
    TenantError: 'readonly',
    EnvironmentValidationError: 'readonly',

    // API types
    ApiResponse: 'readonly',
    ApiError: 'readonly',
    ErrorResponse: 'readonly',
    SuccessResponse: 'readonly',

    // Utility types
    Nullable: 'readonly',
    Optional: 'readonly',
    Maybe: 'readonly',
    ID: 'readonly',
    Timestamp: 'readonly',
    JSONValue: 'readonly',
    NodeEnv: 'readonly',
    HttpMethod: 'readonly',
    HttpStatus: 'readonly',
    SortOrder: 'readonly',
    FilterOperator: 'readonly',
    LoadingState: 'readonly',
    Theme: 'readonly',
    AnimationDuration: 'readonly',
    AnimationType: 'readonly',

    // Component types
    ComponentProps: 'readonly',
    ButtonProps: 'readonly',
  },
  rules: {
    // Console statements: warn only in browser (stricter)
    'no-console': 'off', // ✅ Allow console.log for debugging

    // TypeScript Rules (LOOSENED) - ✅ Better DX
    '@typescript-eslint/no-unused-vars': 'off', // ✅ Allow unused vars
    '@typescript-eslint/no-explicit-any': 'off', // ✅ Allow any type
    '@typescript-eslint/no-empty-function': 'off', // ✅ Allow empty functions
    '@typescript-eslint/ban-ts-comment': 'off', // ✅ Allow @ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off', // ✅ Allow ! operator
    '@typescript-eslint/no-inferrable-types': 'off', // ✅ Allow explicit types

    // React Rules (Enhanced)
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'off', // ✅ Less strict

    // Import Rules (LOOSENED)
    'import/no-unresolved': 'off', // ✅ Allow unresolved imports
    'import/no-cycle': 'off', // ✅ Allow circular dependencies
    'import/no-unused-modules': 'off',
    'import/order': 'off', // ✅ Don't enforce import order

    // General Rules (LOOSENED)
    'no-unused-vars': 'off', // ✅ Use TypeScript version instead
    'no-undef': 'off', // ✅ TypeScript handles this
    'prefer-const': 'off', // ✅ Allow let
    'no-var': 'error',
    'no-useless-escape': 'off', // ✅ Allow escapes
    'no-unreachable': 'off', // ✅ Allow unreachable code
    'no-debugger': 'off', // ✅ Allow debugger
    'no-duplicate-imports': 'off', // ✅ Allow duplicate imports
    eqeqeq: 'off', // ✅ Allow == instead of ===
    curly: 'off', // ✅ Don't enforce braces
  },
  // Override for TypeScript files
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off', // TypeScript handles undefined variables
      },
    },
    {
      files: ['*.cjs', '*.js'],
      env: {
        node: true,
        commonjs: true,
      },
    },
  ],
};
