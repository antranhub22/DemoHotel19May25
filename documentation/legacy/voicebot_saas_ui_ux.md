# Admin Panel - Dashboard thống nhất với phân quyền

## Kiến trúc Dashboard thống nhất

### 1 Dashboard duy nhất cho khách sạn với 3 levels phân quyền:

```
HOTEL DASHBOARD
├── Hotel Manager (Full access)
├── Front Desk Staff (Limited access)
└── IT Manager (Technical access)
```

---

## Layout chung của Dashboard

### Header (Giống nhau cho tất cả roles)

```
+----------------------------------------------------------+
| [Logo Hotel] | [Real-time Status] | [User] | [Logout]    |
+----------------------------------------------------------+
```

### Sidebar Navigation (Thay đổi theo role)

```
+------------------+
| 📊 Dashboard     |  ← Tất cả đều thấy
| 📞 Live Calls    |  ← Tất cả đều thấy
| 📋 Call History  |  ← Tất cả đều thấy
| 📈 Analytics     |  ← Manager + Limited cho Staff
| ⚙️ Settings      |  ← Phân quyền khác nhau
| 🔧 System        |  ← Chỉ IT Manager
| 💰 Billing       |  ← Chỉ Hotel Manager
+------------------+
```

---

## Phân quyền chi tiết theo từng màn hình

### 1. Dashboard Overview (Tất cả đều thấy nhưng khác level)

**Hotel Manager thấy:**

```
+------------------+------------------+------------------+
|   Cuộc gọi hôm nay   |   Tỷ lệ thành công   |   Tiết kiệm chi phí   |
|        245           |        94%           |      $1,200           |
+------------------+------------------+------------------+
|           Biểu đồ doanh thu + chi phí                  |
|           Comparison với tháng trước                   |
+-------------------------------------------------------+
```

**Front Desk Staff thấy:**

```
+------------------+------------------+------------------+
|   Cuộc gọi hôm nay   |   Tỷ lệ thành công   |   Cuộc gọi chờ xử lý   |
|        245           |        94%           |         3             |
+------------------+------------------+------------------+
|           Biểu đồ cuộc gọi trong ngày                 |
|           Top 5 yêu cầu phổ biến                      |
+-------------------------------------------------------+
```

**IT Manager thấy:**

```
+------------------+------------------+------------------+
|   System Uptime      |   Response Time      |   Error Rate         |
|        99.8%         |        1.2s          |        0.3%          |
+------------------+------------------+------------------+
|           Server performance charts                    |
|           Integration status                           |
+-------------------------------------------------------+
```

---

### 2. Live Calls (Tất cả đều thấy nhưng khác quyền)

**Giao diện chung:**

```
+-------------------------------------------------------+
|  🔴 LIVE CALLS (3 active)                           |
+-------------------------------------------------------+
|  📞 Room 205 - John Smith - Room Service            |
|  Duration: 02:15 | Language: English                 |
|  [ACTION BUTTONS - Khác nhau theo role]             |
+-------------------------------------------------------+
```

**Action buttons theo role:**

- **Hotel Manager:** [Listen] [View Report] [Override]
- **Front Desk Staff:** [Listen] [Join Call] [Transfer] [End Call]
- **IT Manager:** [Listen] [View Technical] [Debug]

---

### 3. Settings (Phân quyền rõ ràng)

**Hotel Manager có quyền:**

```
✅ Hotel Information (Tên, địa chỉ, branding)
✅ Business Hours (Giờ hoạt động)
✅ Pricing & Billing Settings
✅ Staff Management (Thêm/xóa user)
✅ Voice & Language Settings
✅ Service Categories (Room service, spa, etc.)
❌ Technical Configuration
❌ System Integration
```

**Front Desk Staff có quyền:**

```
✅ Personal Profile
✅ Shift Settings
✅ Quick Response Templates
✅ Guest Information Updates
❌ System Settings
❌ User Management
❌ Billing
❌ Technical Settings
```

**IT Manager có quyền:**

```
✅ Voicebot Configuration
✅ System Integration (PMS, Payment gateway)
✅ API Management
✅ Security Settings
✅ Backup & Recovery
✅ Technical Monitoring
❌ Billing Settings
❌ Business Policy
```

---

## Code logic phân quyền

### Role-based Menu

```javascript
const menuItems = {
  'hotel-manager': [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Live Calls', path: '/calls', icon: '📞' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'Billing', path: '/billing', icon: '💰' },
    { name: 'Staff', path: '/staff', icon: '👥' },
  ],
  'front-desk': [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Live Calls', path: '/calls', icon: '📞' },
    { name: 'Call History', path: '/history', icon: '📋' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ],
  'it-manager': [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Live Calls', path: '/calls', icon: '📞' },
    { name: 'System', path: '/system', icon: '🔧' },
    { name: 'Integrations', path: '/integrations', icon: '🔗' },
    { name: 'Logs', path: '/logs', icon: '📄' },
  ],
};
```

---

## Ưu điểm của approach này

### 1. **Tiết kiệm chi phí phát triển**

- Chỉ cần develop 1 dashboard thay vì 4
- Reuse components, layouts
- Dễ maintain và update

### 2. **Trải nghiệm user tốt hơn**

- Consistent interface cho tất cả users
- Không cần training nhiều hệ thống khác nhau
- Dễ switch role nếu cần

### 3. **Quản lý dễ dàng**

- Centralized user management
- Dễ control permissions
- Audit trail đơn giản

### 4. **Scalable**

- Dễ thêm roles mới
- Flexible permission system
- Easy to add new features

---

## Technical Implementation

### Database Schema

```sql
-- Users table
users (id, email, password, hotel_id, role, permissions)

-- Permissions table
permissions (id, role, module, action, allowed)

-- Example permissions:
-- hotel-manager, analytics, view, true
-- front-desk, billing, view, false
-- it-manager, system, edit, true
```

### Frontend Components

```javascript
// Protected component example
<ProtectedComponent
  requiredRole="hotel-manager"
  fallback={<NoPermissionMessage />}
>
  <BillingModule />
</ProtectedComponent>

// Dynamic menu based on role
<Sidebar menuItems={getMenuForRole(user.role)} />

// Conditional features
{hasPermission('analytics', 'view') && <AnalyticsChart />}
```

---

## User Management System

### Role Assignment

```
Hotel Manager (1 per hotel)
├── Can assign Front Desk Staff roles
├── Can assign IT Manager role
└── Cannot create other Hotel Managers

Front Desk Staff (Multiple per hotel)
├── Can only edit own profile
└── Cannot assign roles

IT Manager (1-2 per hotel)
├── Can manage technical settings
└── Cannot assign roles
```

### Permission Matrix

```
                    | Hotel Manager | Front Desk | IT Manager
--------------------|---------------|------------|------------
View Dashboard      |       ✅       |     ✅      |     ✅
Manage Live Calls   |       ✅       |     ✅      |     ❌
View Analytics      |       ✅       |     📊      |     ❌
Edit Settings       |       ✅       |     ❌      |     ⚙️
System Config       |       ❌       |     ❌      |     ✅
User Management     |       ✅       |     ❌      |     ❌
Billing Access      |       ✅       |     ❌      |     ❌

✅ = Full Access
📊 = Limited Access (chỉ view basic metrics)
⚙️ = Technical Access (chỉ technical settings)
❌ = No Access
```

---

## Kết luận

**Cách tiếp cận này tối ưu vì:**

- **1 codebase** thay vì 4 riêng biệt
- **Flexible permissions** dễ customize
- **Better UX** với consistent interface
- **Easier maintenance** và updates
- **Cost-effective** development

**Estimate:**

- **Development time:** 2-3 tháng (thay vì 4-5 tháng)
- **Maintenance cost:** Giảm 60%
- **User training:** Đơn giản hóa 80%

Bạn có muốn tôi detail thêm về technical implementation hoặc specific UI components không?
