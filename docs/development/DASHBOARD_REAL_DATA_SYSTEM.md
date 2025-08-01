# 📊 Dashboard Real Data System - Implementation Guide

> **Status:** ✅ Completed (August 2025)  
> **Commit:** 74410d6 - Fix Dashboard: Replace Mock Data with Real Database Data

## 🎯 **OVERVIEW**

Đã chuyển đổi thành công Dashboard từ mock data hardcoded sang real-time data từ database. System
này connect voice calls → OpenAI extraction → database → dashboard display.

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Data Flow:**

```
Voice Call → Vapi.ai → OpenAI Summary → Database → Dashboard Display
     ↓           ↓           ↓            ↓           ↓
  Guest gọi → Webhook → Extract requests → Save DB → Real-time UI
```

### **Key Components:**

#### **1. Frontend Data Hook:**

- **File:** `apps/client/src/pages/unified-dashboard/UnifiedDashboardHome.tsx`
- **Function:** `useDashboardData()`
- **Purpose:** Fetch real data từ API và auto-refresh

#### **2. Backend Data Source:**

- **API Endpoint:** `/api/staff/requests`
- **File:** `apps/server/routes/staff.ts`
- **Database:** `request` table trong SQLite/PostgreSQL

#### **3. Data Processing:**

- **File:** `apps/server/routes/webhook.ts`
- **Function:** `addServiceRequest()` trong `apps/server/storage.ts`
- **Purpose:** Extract data từ OpenAI và save vào database

---

## 📋 **DASHBOARD COMPONENTS**

### **🟢 Front Desk Dashboard**

**Metrics hiển thị:**

- **Yêu cầu hôm nay:** Count requests created today
- **Đang chờ xử lý:** Status = "Đã ghi nhận"
- **Đã hoàn thành:** Status = "Hoàn thiện"
- **Cuộc gọi hôm nay:** Count service requests today

### **🔵 Hotel Manager Dashboard**

**Metrics hiển thị:**

- **Tổng cuộc gọi:** Total requests count
- **Đánh giá trung bình:** 4.7/5 (static for now)
- **Yêu cầu đang chờ:** Pending requests count
- **Uptime hệ thống:** 99.9% (static)

### **🟣 IT Manager Dashboard**

**Metrics hiển thị:**

- **Uptime hệ thống:** 99.9% (static)
- **Response Time:** 150ms (static)
- **Lỗi hệ thống:** 0 (static)
- **API Calls:** Calculated from requests × 100

---

## 🔍 **DEBUGGING GUIDE**

### **❌ Problem: Dashboard hiển thị 0 hoặc không có data**

#### **Debug Steps:**

1. **Check API Response:**

   ```bash
   curl http://localhost:10000/api/staff/requests \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

2. **Check Database:**

   ```sql
   SELECT COUNT(*) FROM request;
   SELECT * FROM request ORDER BY created_at DESC LIMIT 5;
   ```

3. **Check Browser Console:**

   ```javascript
   // Open DevTools → Console
   // Look for errors in network tab or console logs
   ```

4. **Check Server Logs:**
   ```bash
   # Look for these logs:
   # "📊 [CustomerRequests] WebSocket request update received"
   # "✅ [CustomerRequests] New request added to dashboard"
   ```

### **❌ Problem: Data không update real-time**

#### **Debug Steps:**

1. **Check WebSocket Connection:**

   ```javascript
   // In browser console:
   window.updateRequestStatus({
     type: 'new-request',
     requestId: 'test-123',
     roomNumber: '101',
   });
   ```

2. **Check WebSocket Events:**

   ```bash
   # Server should emit:
   io.emit('requestStatusUpdate', { type: 'new-request', ... });
   ```

3. **Verify Hook is Working:**
   ```javascript
   // Add this to useDashboardData() for debugging:
   console.log('Dashboard data updated:', data);
   ```

### **❌ Problem: New requests không xuất hiện**

#### **Debug Steps:**

1. **Check Vapi Webhook:**

   ```bash
   curl -X POST http://localhost:10000/api/webhooks/vapi \
     -H "Content-Type: application/json" \
     -d '{
       "type": "end-of-call-report",
       "call": {"id": "test-123"},
       "message": {"messages": [...]}
     }'
   ```

2. **Check OpenAI Processing:**

   ```bash
   # Look for logs:
   # "🧠 [OpenAI] generateCallSummaryOptimized started"
   # "✅ [OpenAI] Summary generated successfully"
   ```

3. **Check Database Save:**
   ```bash
   # Look for logs:
   # "✅ [Webhook] ServiceRequests saved successfully"
   # "📡 [Webhook] WebSocket notification sent"
   ```

---

## 🛠️ **DEVELOPMENT GUIDE**

### **Adding New Metrics:**

1. **Update Hook Data Structure:**

   ```typescript
   // In useDashboardData()
   const [data, setData] = useState({
     calls: { total: 0, today: 0, answered: 0, avgDuration: '0 min' },
     requests: { pending: 0, inProgress: 0, completed: 0, totalToday: 0 },
     // Add new metric:
     newMetric: { value: 0, trend: '+0%' },
   });
   ```

2. **Update API Calculation:**

   ```typescript
   // In fetchDashboardData()
   const newMetricValue = requests.filter(req =>
     // Your calculation logic here
   ).length;

   setData({
     // ... existing data
     newMetric: { value: newMetricValue, trend: '+5%' }
   });
   ```

3. **Update UI Components:**
   ```tsx
   <MetricCard
     title="New Metric"
     value={dashboardData.newMetric.value}
     description="Description here"
     icon={YourIcon}
     color="green"
   />
   ```

### **Changing Refresh Interval:**

```typescript
// In useDashboardData() useEffect:
const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
// Change to: 10000 for 10 seconds, 60000 for 1 minute
```

### **Adding New Dashboard Role:**

1. **Update Role Logic:**

   ```typescript
   // In renderDashboardByRole()
   case 'new-role':
     return <NewRoleDashboard />;
   ```

2. **Create New Dashboard Component:**
   ```typescript
   const NewRoleDashboard = () => {
     const { data: dashboardData, loading } = useDashboardData();
     // Your component logic
   };
   ```

---

## 📁 **FILE STRUCTURE**

```
apps/client/src/pages/unified-dashboard/
├── UnifiedDashboardHome.tsx          ← Main dashboard file
│   ├── useDashboardData()             ← Data fetching hook
│   ├── FrontDeskDashboard()           ← Front desk UI
│   ├── HotelManagerDashboard()        ← Manager UI
│   └── ITManagerDashboard()           ← IT UI

apps/server/
├── routes/webhook.ts                  ← Vapi webhook handler
├── routes/staff.ts                    ← API endpoint /api/staff/requests
├── storage.ts                         ← Database operations
│   └── addServiceRequest()            ← Save extracted requests
└── openai.ts                          ← OpenAI integration

Database:
├── request table                      ← Main data source
├── call_summaries table               ← OpenAI summaries
└── Schema defined in packages/shared/db/schema.ts
```

---

## 🔄 **REAL-TIME UPDATES**

### **WebSocket Events:**

#### **Server Emits:**

```typescript
// New request from voice call
io.emit('requestStatusUpdate', {
  type: 'new-request',
  requestId: '123',
  roomNumber: '101',
  guestName: 'John Doe',
  requestContent: '2 hamburgers',
  timestamp: '2025-08-01T14:00:00Z',
});

// Status change from front desk
io.emit('requestStatusUpdate', {
  type: 'status-change',
  requestId: '123',
  status: 'Đang thực hiện',
  assignedTo: 'kitchen-staff',
  timestamp: '2025-08-01T14:05:00Z',
});
```

#### **Client Listens:**

```typescript
// In useWebSocket.ts
newSocket.on('requestStatusUpdate', data => {
  if ((window as any).updateRequestStatus) {
    (window as any).updateRequestStatus(data);
  }
});

// In CustomerRequests.tsx
(window as any).updateRequestStatus = data => {
  if (data.type === 'new-request') {
    setRequests(prev => [newRequest, ...prev]);
  } else if (data.type === 'status-change') {
    setRequests(prev =>
      prev.map(request =>
        request.id === data.requestId ? { ...request, status: data.status } : request
      )
    );
  }
};
```

---

## 🧪 **TESTING**

### **Manual Test - New Request:**

```bash
# 1. Send webhook
curl -X POST http://localhost:10000/api/webhooks/vapi \
  -H "Content-Type: application/json" \
  -d '{
    "type": "end-of-call-report",
    "call": {"id": "test-' + $(date +%s) + '"},
    "message": {
      "messages": [
        {"role": "user", "content": "Tôi là Nam ở phòng 101. Tôi muốn 2 hamburger."},
        {"role": "assistant", "content": "Đã ghi nhận 2 hamburger cho phòng 101."}
      ]
    }
  }'

# 2. Check dashboard updates immediately
# 3. Verify request appears in /hotel-dashboard/requests
```

### **Manual Test - Status Update:**

```bash
# 1. Update request status via API
curl -X PATCH http://localhost:10000/api/staff/requests/123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Đang thực hiện", "assignedTo": "kitchen"}'

# 2. Check dashboard metrics update
# 3. Verify real-time change without refresh
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Database Connection Errors**

**Symptoms:** Dashboard shows 0 data, console errors **Solution:**

```bash
# Check database connection
npm run dev  # Will fallback to SQLite if PostgreSQL fails
```

### **Issue 2: Authentication Errors**

**Symptoms:** 401 errors in network tab **Solution:**

```javascript
// Check localStorage token
console.log(localStorage.getItem('token'));
// Re-login if token expired
```

### **Issue 3: WebSocket Not Connected**

**Symptoms:** No real-time updates, manual refresh needed **Solution:**

```bash
# Check server logs for WebSocket connection
# Verify useWebSocket() hook is called in dashboard components
```

### **Issue 4: OpenAI API Errors**

**Symptoms:** Webhook receives calls but no requests saved **Solution:**

```bash
# Check OpenAI API key in environment
# Look for logs: "❌ [OpenAI] API call failed"
```

---

## 📈 **PERFORMANCE CONSIDERATIONS**

### **Optimization:**

- **Auto-refresh:** 30s interval (configurable)
- **API Caching:** Server-side caching for /api/staff/requests
- **WebSocket:** Efficient real-time updates
- **Loading States:** Skeleton UI for better UX

### **Monitoring:**

- **Check Response Times:** API calls should be < 500ms
- **Database Queries:** Optimize if requests table grows large
- **Memory Usage:** Monitor WebSocket connections

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Potential Improvements:**

1. **Server-Side Pagination:** For large datasets
2. **Advanced Filtering:** By date range, room type, etc.
3. **Caching Strategy:** Redis for frequently accessed data
4. **Real Analytics:** Replace static satisfaction ratings
5. **Push Notifications:** Mobile notifications for staff
6. **Audit Logging:** Track all dashboard interactions

### **Adding New Data Sources:**

1. **Room Management System:** Real occupancy data
2. **POS Integration:** Actual order amounts
3. **Staff Management:** Real shift data
4. **IoT Sensors:** Real uptime monitoring

---

## 📞 **SUPPORT**

**For Questions or Issues:**

- Check this documentation first
- Review commit: `74410d6`
- Look at git history for recent changes
- Debug using the steps above

**Key Files to Check:**

- `UnifiedDashboardHome.tsx` - Dashboard UI and data logic
- `webhook.ts` - Incoming voice call processing
- `staff.ts` - API endpoints
- `storage.ts` - Database operations

---

_Last Updated: August 2025_  
_Version: 1.0_  
_Status: Production Ready ✅_
