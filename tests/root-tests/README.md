# Root Test Files

Các file test chính được di chuyển từ root directory:

## 🧪 Test Files
- `test-websocket-dashboard.cjs` - Test WebSocket dashboard
- `test-websocket-dashboard.js` - Test WebSocket dashboard (JS version)
- `test-database-connection.js` - Test kết nối database
- `test-database-connection.cjs` - Test kết nối database (CJS version)
- `test-complete-flow.cjs` - Test flow hoàn chỉnh
- `test-summary-routes.js` - Test summary routes
- `test-production-fixes.js` - Test production fixes
- `test-production-fixes.cjs` - Test production fixes (CJS version)
- `test-production-api.js` - Test production API
- `test-real-database.cjs` - Test database thực
- `test-postgresql-schema.cjs` - Test PostgreSQL schema
- `test-fixed-schema.cjs` - Test schema đã fix
- `test-api-fix.cjs` - Test API fix
- `test-ui-fix.cjs` - Test UI fix
- `test-mock-summary.js` - Test mock summary
- `test-real-call-end.js` - Test real call end

## 🚀 Cách chạy
```bash
# Chạy tất cả test
cd tests/root-tests
node test-complete-flow.cjs

# Chạy test database
node test-database-connection.cjs

# Chạy test WebSocket
node test-websocket-dashboard.cjs
```
