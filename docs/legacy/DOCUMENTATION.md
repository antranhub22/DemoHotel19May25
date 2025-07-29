# 📋 Mi Nhon Hotel - Tài liệu Chi tiết

## 🏗️ Bảng Mô tả Cấu trúc Dự án

| Thư mục                  | Mô tả                       | Công nghệ                      | Vai trò                      |
| ------------------------ | --------------------------- | ------------------------------ | ---------------------------- |
| `client/`                | Frontend React application  | React, TypeScript, TailwindCSS | Giao diện người dùng         |
| `server/`                | Backend Express.js server   | Node.js, Express, TypeScript   | API server và business logic |
| `shared/`                | Shared types và schemas     | TypeScript, Zod, Drizzle ORM   | Định nghĩa dữ liệu chung     |
| `client/src/components/` | React components            | React, TypeScript              | UI components                |
| `client/src/pages/`      | Page components             | React Router                   | Các trang ứng dụng           |
| `client/src/services/`   | API và business services    | Axios, OpenAI                  | Xử lý logic nghiệp vụ        |
| `client/src/utils/`      | Utility functions           | TypeScript                     | Hàm tiện ích                 |
| `client/src/lib/`        | Libraries và configurations | Various                        | Thư viện và cấu hình         |
| `server/models/`         | Database models             | TypeScript                     | Định nghĩa models            |
| `server/middleware/`     | Express middleware          | Express, JWT                   | Xác thực và authorization    |
| `migrations/`            | Database migrations         | Drizzle ORM                    | Quản lý schema database      |

## 🛠️ Bảng API Endpoints

### 🔐 Authentication

| Method | Endpoint           | Auth Required | Mô tả           |
| ------ | ------------------ | ------------- | --------------- |
| POST   | `/api/staff/login` | ❌            | Đăng nhập staff |

### 📞 Call Management

| Method | Endpoint                       | Auth Required | Mô tả                       |
| ------ | ------------------------------ | ------------- | --------------------------- |
| GET    | `/api/transcripts/:callId`     | ❌            | Lấy transcript theo call ID |
| POST   | `/api/store-summary`           | ❌            | Lưu tóm tắt cuộc gọi        |
| GET    | `/api/summaries/:callId`       | ❌            | Lấy tóm tắt theo call ID    |
| GET    | `/api/summaries/recent/:hours` | ❌            | Lấy tóm tắt gần đây         |
| POST   | `/api/translate-to-vietnamese` | ❌            | Dịch text sang tiếng Việt   |

### 🏨 Orders Management

| Method | Endpoint                       | Auth Required | Mô tả                     |
| ------ | ------------------------------ | ------------- | ------------------------- |
| POST   | `/api/orders`                  | ❌            | Tạo order mới             |
| GET    | `/api/orders`                  | ❌            | Lấy tất cả orders         |
| GET    | `/api/orders/:id`              | ❌            | Lấy order theo ID         |
| GET    | `/api/orders/room/:roomNumber` | ❌            | Lấy orders theo phòng     |
| PATCH  | `/api/orders/:id/status`       | ✅            | Cập nhật trạng thái order |
| DELETE | `/api/orders/all`              | ❌            | Xóa tất cả orders         |

### 👥 Staff Management

| Method | Endpoint                           | Auth Required | Mô tả                       |
| ------ | ---------------------------------- | ------------- | --------------------------- |
| GET    | `/api/staff/requests`              | ✅            | Lấy danh sách requests      |
| PATCH  | `/api/staff/requests/:id/status`   | ✅            | Cập nhật trạng thái request |
| GET    | `/api/staff/requests/:id/messages` | ✅            | Lấy tin nhắn của request    |
| POST   | `/api/staff/requests/:id/message`  | ✅            | Gửi tin nhắn tới guest      |
| DELETE | `/api/staff/requests/all`          | ✅            | Xóa tất cả requests         |
| GET    | `/api/staff/orders`                | ✅            | Lấy orders cho staff        |

### 📧 Email Services

| Method | Endpoint                         | Auth Required | Mô tả                         |
| ------ | -------------------------------- | ------------- | ----------------------------- |
| POST   | `/api/send-service-email`        | ❌            | Gửi email xác nhận dịch vụ    |
| POST   | `/api/mobile-call-summary-email` | ❌            | Gửi tóm tắt cuộc gọi (mobile) |
| POST   | `/api/test-email`                | ❌            | Test cấu hình email           |
| POST   | `/api/mobile-test-email`         | ❌            | Test email từ mobile          |
| GET    | `/api/mailjet-status`            | ❌            | Kiểm tra trạng thái Mailjet   |
| GET    | `/api/recent-emails`             | ❌            | Lấy email gần đây             |

### 📊 Analytics

| Method | Endpoint                              | Auth Required | Mô tả               |
| ------ | ------------------------------------- | ------------- | ------------------- |
| GET    | `/api/analytics/overview`             | ✅            | Tổng quan analytics |
| GET    | `/api/analytics/service-distribution` | ✅            | Phân bố dịch vụ     |
| GET    | `/api/analytics/hourly-activity`      | ✅            | Hoạt động theo giờ  |

### 📚 References

| Method | Endpoint                  | Auth Required | Mô tả                    |
| ------ | ------------------------- | ------------- | ------------------------ |
| GET    | `/api/references/:callId` | ❌            | Lấy references theo call |
| POST   | `/api/references`         | ❌            | Tạo reference mới        |
| DELETE | `/api/references/:id`     | ❌            | Xóa reference            |
| GET    | `/api/reference-map`      | ❌            | Lấy reference map        |

### 🔧 Utilities

| Method | Endpoint           | Auth Required | Mô tả                    |
| ------ | ------------------ | ------------- | ------------------------ |
| POST   | `/api/test-openai` | ❌            | Test OpenAI API          |
| GET    | `/api/db-test`     | ❌            | Test database connection |

## 📁 Bảng Mô tả Components

### 🔧 Core Components

| Component        | File                 | Mô tả                             | Props                   |
| ---------------- | -------------------- | --------------------------------- | ----------------------- |
| `VoiceAssistant` | `VoiceAssistant.tsx` | Component chính quản lý interface | -                       |
| `Interface1`     | `Interface1.tsx`     | Màn hình chính với nút gọi        | `{ isActive: boolean }` |
| `Interface2`     | `Interface2.tsx`     | Màn hình trong cuộc gọi           | `{ isActive: boolean }` |
| `Interface3`     | `Interface3.tsx`     | Màn hình tóm tắt (English)        | `{ isActive: boolean }` |
| `Interface3Vi`   | `Interface3Vi.tsx`   | Màn hình tóm tắt (Vietnamese)     | `{ isActive: boolean }` |
| `Interface3Fr`   | `Interface3Fr.tsx`   | Màn hình tóm tắt (French)         | `{ isActive: boolean }` |
| `Interface4`     | `Interface4.tsx`     | Màn hình xác nhận order           | `{ isActive: boolean }` |

### 🎛️ Interactive Components

| Component                   | File                            | Mô tả                         | Props                                                                |
| --------------------------- | ------------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `SiriCallButton`            | `SiriCallButton.tsx`            | Nút gọi với hiệu ứng Siri     | `{ containerId: string, isListening: boolean, volumeLevel: number }` |
| `SiriOrb`                   | `SiriOrb.tsx`                   | Hiệu ứng visual Siri          | `{ isActive: boolean, volumeLevel: number }`                         |
| `RealtimeConversationPopup` | `RealtimeConversationPopup.tsx` | Popup hiển thị cuộc hội thoại | `{ isOpen: boolean, onClose: () => void }`                           |
| `ReferencePopup`            | `ReferencePopup.tsx`            | Popup tài liệu tham khảo      | `{ isOpen: boolean, onClose: () => void }`                           |
| `Reference`                 | `Reference.tsx`                 | Component tài liệu tham khảo  | -                                                                    |

### 📱 Display Components

| Component           | File                    | Mô tả               | Props                                                                              |
| ------------------- | ----------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `TranscriptDisplay` | `TranscriptDisplay.tsx` | Hiển thị transcript | `{ transcripts: Transcript[] }`                                                    |
| `WelcomePopup`      | `WelcomePopup.tsx`      | Popup chào mừng     | `{ onClose: () => void }`                                                          |
| `InfographicSteps`  | `InfographicSteps.tsx`  | Hướng dẫn từng bước | `{ horizontal: boolean, compact: boolean, currentStep: number, language: string }` |
| `ErrorBoundary`     | `ErrorBoundary.tsx`     | Xử lý lỗi React     | `{ children: ReactNode }`                                                          |

### 📊 Staff Components

| Component                 | File                          | Mô tả                | Props                                       |
| ------------------------- | ----------------------------- | -------------------- | ------------------------------------------- |
| `StaffLogin`              | `StaffLogin.tsx`              | Đăng nhập staff      | -                                           |
| `StaffDashboard`          | `StaffDashboard.tsx`          | Dashboard staff      | -                                           |
| `StaffMessagePopup`       | `StaffMessagePopup.tsx`       | Popup tin nhắn staff | `{ isOpen: boolean, onClose: () => void }`  |
| `StaffRequestDetailModal` | `StaffRequestDetailModal.tsx` | Chi tiết request     | `{ request: Request, onClose: () => void }` |
| `AnalyticsDashboard`      | `AnalyticsDashboard.tsx`      | Dashboard analytics  | -                                           |
| `CallHistory`             | `CallHistory.tsx`             | Lịch sử cuộc gọi     | -                                           |
| `CallDetails`             | `CallDetails.tsx`             | Chi tiết cuộc gọi    | -                                           |

### 📧 Email Components

| Component     | File              | Mô tả                    | Props                          |
| ------------- | ----------------- | ------------------------ | ------------------------------ |
| `EmailForm`   | `EmailForm.tsx`   | Form gửi email           | `{ onSubmit: (data) => void }` |
| `EmailTester` | `EmailTester.tsx` | Test email functionality | -                              |

## 📋 Bảng Database Schema

### 🏗️ Tables

| Table           | Columns                                                                                                     | Description         | Relations     |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------- | ------------- |
| `users`         | id, username, password                                                                                      | Người dùng hệ thống | -             |
| `transcripts`   | id, callId, role, content, timestamp                                                                        | Transcript cuộc gọi | → calls       |
| `orders`        | id, callId, roomNumber, orderType, deliveryTime, specialInstructions, items, totalAmount, status, createdAt | Đơn hàng            | → transcripts |
| `callSummaries` | id, callId, content, timestamp, roomNumber, duration                                                        | Tóm tắt cuộc gọi    | → transcripts |
| `request`       | id, room_number, guestName, request_content, created_at, status, notes, orderId, updatedAt                  | Yêu cầu dịch vụ     | → orders      |

### 🔗 Schema Details

```typescript
// Users Table
users: {
  id: serial (Primary Key)
  username: text (Unique, Not Null)
  password: text (Not Null)
}

// Transcripts Table
transcripts: {
  id: serial (Primary Key)
  callId: text (Not Null)
  role: text (Not Null) // 'user' | 'assistant'
  content: text (Not Null)
  timestamp: timestamp (Default: now)
}

// Orders Table
orders: {
  id: serial (Primary Key)
  callId: text (Not Null)
  roomNumber: text (Not Null)
  orderType: text (Not Null)
  deliveryTime: text (Not Null)
  specialInstructions: text (Nullable)
  items: jsonb (Not Null)
  totalAmount: integer (Not Null)
  status: text (Default: 'pending')
  createdAt: timestamp (Default: now)
}

// Call Summaries Table
callSummaries: {
  id: serial (Primary Key)
  callId: text (Not Null)
  content: text (Not Null)
  timestamp: timestamp (Default: now)
  roomNumber: text (Nullable)
  duration: text (Nullable)
}

// Request Table (Staff UI)
request: {
  id: serial (Primary Key)
  room_number: text (Not Null)
  guestName: text (Not Null)
  request_content: text (Not Null)
  created_at: timestamp (Default: now)
  status: text (Default: 'Đã ghi nhận')
  notes: text (Nullable)
  orderId: text (Nullable)
  updatedAt: timestamp (Default: now)
}
```

## 🔧 Bảng Services và Utilities

### 📡 API Services

| Service            | File                  | Mô tả                      | Methods                                              |
| ------------------ | --------------------- | -------------------------- | ---------------------------------------------------- |
| `chatService`      | `chatService.ts`      | Xử lý chat với OpenAI      | `fetchAIResponse()`                                  |
| `openaiService`    | `openaiService.ts`    | Tích hợp OpenAI API        | `getAIChatResponse()`                                |
| `ReferenceService` | `ReferenceService.ts` | Quản lý tài liệu tham khảo | `initialize()`, `findReferences()`, `addReference()` |

### 🔧 Core Libraries

| Library         | File               | Mô tả                 | Exports                           |
| --------------- | ------------------ | --------------------- | --------------------------------- |
| `vapiClient`    | `vapiClient.ts`    | Tích hợp Vapi AI      | `initVapi()`, `getVapiInstance()` |
| `summaryParser` | `summaryParser.ts` | Phân tích summary AI  | `parseSummaryToOrderDetails()`    |
| `queryClient`   | `queryClient.ts`   | HTTP client utilities | `apiRequest()`                    |
| `utils`         | `utils.ts`         | Utility functions     | `cn()` (className merger)         |

### 🎯 Specialized Utilities

| Utility             | File                   | Mô tả             | Functions                                |
| ------------------- | ---------------------- | ----------------- | ---------------------------------------- |
| `textProcessing`    | `textProcessing.ts`    | Xử lý văn bản     | `processText()`, `segmentByDictionary()` |
| `dictionary`        | `dictionary.ts`        | Từ điển và lookup | `loadDictionary()`, `findInDictionary()` |
| `englishDictionary` | `englishDictionary.ts` | Từ điển tiếng Anh | `englishDictionary` (Set)                |

### 🧠 Context & Hooks

| Hook/Context          | File                     | Mô tả                  | Provides                  |
| --------------------- | ------------------------ | ---------------------- | ------------------------- |
| `AssistantContext`    | `AssistantContext.tsx`   | State management chính | Tất cả state và functions |
| `useWebSocket`        | `useWebSocket.ts`        | WebSocket connection   | Real-time communication   |
| `useTranscriptSocket` | `useTranscriptSocket.ts` | Transcript WebSocket   | Live transcript updates   |
| `use-toast`           | `use-toast.ts`           | Toast notifications    | Toast management          |
| `use-mobile`          | `use-mobile.tsx`         | Mobile detection       | Mobile responsive         |

### 🗄️ Server Services

| Service      | File            | Mô tả                     | Functions                                            |
| ------------ | --------------- | ------------------------- | ---------------------------------------------------- |
| `storage`    | `storage.ts`    | Database operations       | CRUD operations                                      |
| `db`         | `db.ts`         | Database connection       | Drizzle ORM instance                                 |
| `analytics`  | `analytics.ts`  | Analytics queries         | `getAnalyticsOverview()`, `getServiceDistribution()` |
| `openai`     | `openai.ts`     | OpenAI server integration | `generateCallSummary()`, `translateToVietnamese()`   |
| `gmail`      | `gmail.ts`      | Gmail email service       | `sendServiceConfirmation()`, `sendCallSummary()`     |
| `mobileMail` | `mobileMail.ts` | Mobile email service      | `sendMobileEmail()`, `sendMobileCallSummary()`       |
| `socket`     | `socket.ts`     | WebSocket server          | Real-time notifications                              |
| `vapi`       | `vapi.ts`       | Vapi AI integration       | Voice assistant handling                             |

### 🔐 Middleware

| Middleware | File      | Mô tả          | Purpose          |
| ---------- | --------- | -------------- | ---------------- |
| `auth`     | `auth.ts` | Authentication | JWT verification |

### 📄 Models

| Model       | File           | Mô tả                    | Fields                                              |
| ----------- | -------------- | ------------------------ | --------------------------------------------------- |
| `Staff`     | `Staff.ts`     | Staff user model         | id, username, passwordHash, role                    |
| `Request`   | `Request.ts`   | Service request model    | id, room_number, guestName, request_content, status |
| `Message`   | `Message.ts`   | Chat message model       | id, requestId, sender, content                      |
| `Reference` | `Reference.ts` | Reference document model | type, url, title, description, callId               |

## 🌍 Internationalization

### 📝 Language Files

| File      | Language   | Status      |
| --------- | ---------- | ----------- |
| `en.json` | English    | ✅ Complete |
| `vi.json` | Vietnamese | ✅ Complete |
| `fr.json` | French     | ✅ Complete |
| `zh.json` | Chinese    | ✅ Complete |
| `ru.json` | Russian    | ✅ Complete |
| `ko.json` | Korean     | ✅ Complete |

### 🔧 Configuration

- **I18n Index**: `i18n/index.ts` - Translation function `t(key, language)`
- **Vapi Keys**: Riêng biệt cho từng ngôn ngữ
- **Multi-language Support**: Hoàn toàn hỗ trợ 6 ngôn ngữ

## 🔌 WebSocket Events

### 📡 Client → Server

| Event        | Data                                                                    | Mô tả               |
| ------------ | ----------------------------------------------------------------------- | ------------------- |
| `init`       | `{ type: 'init', callId: string }`                                      | Khởi tạo connection |
| `transcript` | `{ type: 'transcript', callId: string, role: string, content: string }` | Gửi transcript      |

### 📨 Server → Client

| Event                 | Data                                                                                     | Mô tả                     |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| `connected`           | `{ type: 'connected', message: string }`                                                 | Xác nhận kết nối          |
| `transcript`          | `{ type: 'transcript', callId: string, role: string, content: string, timestamp: Date }` | Broadcast transcript      |
| `order_status_update` | `{ type: 'order_status_update', reference: string, status: string }`                     | Cập nhật trạng thái order |

## 🎨 UI Components Library

### 🧩 Shadcn/UI Components

| Component   | File               | Mô tả               |
| ----------- | ------------------ | ------------------- |
| `Button`    | `ui/button.tsx`    | Các loại button     |
| `Dialog`    | `ui/dialog.tsx`    | Modal dialogs       |
| `Card`      | `ui/card.tsx`      | Card containers     |
| `Badge`     | `ui/badge.tsx`     | Status badges       |
| `Input`     | `ui/input.tsx`     | Form inputs         |
| `Select`    | `ui/select.tsx`    | Dropdown selects    |
| `Textarea`  | `ui/textarea.tsx`  | Text areas          |
| `Table`     | `ui/table.tsx`     | Data tables         |
| `Toast`     | `ui/toast.tsx`     | Notifications       |
| `Tabs`      | `ui/tabs.tsx`      | Tab navigation      |
| `Accordion` | `ui/accordion.tsx` | Collapsible content |
| `Avatar`    | `ui/avatar.tsx`    | User avatars        |
| `Progress`  | `ui/progress.tsx`  | Progress bars       |

## 🔧 Environment Variables

### 🌐 Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# OpenAI
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_PROJECT_ID=proj_...

# Vapi (English)
VITE_VAPI_PUBLIC_KEY=pk_...
VITE_VAPI_ASSISTANT_ID=asst_...

# Vapi (Other Languages)
VITE_VAPI_PUBLIC_KEY_FR=pk_...
VITE_VAPI_ASSISTANT_ID_FR=asst_...
VITE_VAPI_PUBLIC_KEY_ZH=pk_...
VITE_VAPI_ASSISTANT_ID_ZH=asst_...
VITE_VAPI_PUBLIC_KEY_RU=pk_...
VITE_VAPI_ASSISTANT_ID_RU=asst_...
VITE_VAPI_PUBLIC_KEY_KO=pk_...
VITE_VAPI_ASSISTANT_ID_KO=asst_...
VITE_VAPI_PUBLIC_KEY_VI=pk_...
VITE_VAPI_ASSISTANT_ID_VI=asst_...

# Email
MS365_EMAIL=your@email.com
MS365_PASSWORD=your_app_password
GMAIL_APP_PASSWORD=your_gmail_password
MAILJET_API_KEY=your_mailjet_key
MAILJET_SECRET_KEY=your_mailjet_secret

# JWT
JWT_SECRET=your_jwt_secret
```

## 📈 Performance & Optimization

### ⚡ Optimization Strategies

- **Code Splitting**: Dynamic imports cho các trang
- **Lazy Loading**: Components được load khi cần
- **WebSocket**: Real-time communication
- **Caching**: Local storage cho active orders
- **Memoization**: React.memo và useMemo
- **Debouncing**: Input processing

### 📊 Monitoring

- **Error Boundaries**: Xử lý lỗi React
- **Console Logging**: Debug information
- **Performance Tracking**: Call duration, API response times

---

## 🎯 Tóm tắt

Dự án **Mi Nhon Hotel Voice Assistant** là một ứng dụng full-stack phức tạp với:

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL
- **AI Integration**: OpenAI + Vapi.ai
- **Real-time**: WebSocket communication
- **Multi-language**: 6 ngôn ngữ hỗ trợ
- **Email**: Nhiều provider (Gmail, Mailjet, Office365)
- **Authentication**: JWT-based
- **Database**: PostgreSQL với Drizzle ORM

Hệ thống được thiết kế để xử lý các yêu cầu dịch vụ khách sạn thông qua voice assistant AI, với giao
diện người dùng trực quan và hệ thống quản lý staff hoàn chỉnh.
