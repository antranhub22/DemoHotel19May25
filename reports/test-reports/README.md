# Test Reports

Các báo cáo test được di chuyển từ các thư mục riêng lẻ:

## 📊 Report Categories

### Gateway Test Reports
Báo cáo test cho API Gateway và các endpoint.

### Dashboard Test Reports
Báo cáo test cho dashboard và UI components.

### Integration Test Results
Kết quả test integration và end-to-end.

### Performance Test Results
Kết quả test performance và load testing.

## 📁 File Structure
- `gateway-test-*.json` - Gateway test reports
- `dashboard-test-*.json` - Dashboard test reports
- `test-report.html` - HTML test reports
- `backup-test-*.json` - Backup test reports
- `ci/` - Continuous Integration reports
- `jest-html-reporters-attach/` - Jest HTML reports
- `integration/` - Integration test results
- `e2e/` - End-to-end test results

## 📈 Cách sử dụng
```bash
# Xem gateway test reports
ls -la gateway-test-*.json

# Xem dashboard test reports
ls -la dashboard-test-*.json

# Xem HTML test reports
open test-report.html

# Xem integration test results
cd integration && ls -la
``` 