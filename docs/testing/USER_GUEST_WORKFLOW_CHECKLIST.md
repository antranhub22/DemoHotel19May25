# User/Guest Workflow – 29-step Test Checklist

Sử dụng danh sách này để kiểm thử tuần tự toàn bộ luồng User/Guest (voice-first) từ onboarding → call → summary → order → realtime updates. Đánh dấu vào mỗi bước khi hoàn thành.

1. [ ] Điều kiện tiên quyết: .env (Vapi/OpenAI hoặc mock), WebSocket kết nối, `tenantId` hợp lệ
2. [ ] Onboarding lần đầu: `WelcomePopup` song ngữ hiển thị; `localStorage.hasVisited` được set; reload không hiện lại
3. [ ] Chọn ngôn ngữ: UI đổi theo `LanguageContext`; map đúng Assistant ID; khóa đổi ngôn ngữ khi đang gọi
4. [ ] Nút Siri sẵn sàng: hiển thị, aria-label, trạng thái enabled/disabled đúng
5. [ ] Bắt đầu gọi (Dev/Prod): Dev sinh transcript mock; Prod gọi Vapi thành công, có `currentCallId`, mic level cập nhật
6. [ ] Transcript realtime: user/assistant hiển thị, auto-scroll, `callDetails.language` khớp ngôn ngữ
7. [ ] Xử lý gián đoạn/chồng tiếng: không trùng lặp message; UI ổn định khi reconnect tạm
8. [ ] Kết thúc gọi: Siri end → Vapi stop; UI cleanup; nếu stop lỗi vẫn không kẹt state
9. [ ] Tự kích hoạt tạo Summary khi ≥ 2 transcripts; lưu `callId` tạm → thật
10. [ ] Summary Popup mở tự động ở trạng thái “processing”; có progression/step messages
11. [ ] Server webhook nhận `end-of-call-report`; lưu transcript; tính `duration`
12. [ ] Tạo Summary (OpenAI-first): đúng ngôn ngữ; trích xuất service requests; fallback Vapi khi OpenAI lỗi
13. [ ] WebSocket phát `summary-progression` và `call-summary-received` (gồm `callId`, `summary`, `serviceRequests`)
14. [ ] Client nhận WS: cập nhật progression; `updateSummaryPopup` điền Summary + Service Requests
15. [ ] Xác minh nội dung Summary: khớp transcript; ngôn ngữ đúng; có toggle bản dịch tiếng Việt
16. [ ] Hợp nhất yêu cầu dịch vụ: gộp trùng, nhận diện số lượng/chi tiết, cấu trúc rõ ràng
17. [ ] Chỉnh sửa yêu cầu (TypeBox): sửa được, dữ liệu hợp lệ, không vỡ cấu trúc itemized
18. [ ] Xác nhận đơn: sinh mã tham chiếu; ghi thời gian; hiển thị lại trong UI
19. [ ] Gửi đơn hàng: `POST /api/request` đúng schema; server transform chuẩn; lưu theo tenant; trả mã tham chiếu
20. [ ] Thông báo tới staff: dashboard nhận realtime; email (nếu bật) gửi thành công
21. [ ] Theo dõi trạng thái: staff PATCH → guest UI cập nhật realtime; polling 5s dự phòng hoạt động
22. [ ] Chính sách hủy: hủy trong khung cho phép; trạng thái “Cancelled”; thông báo đến guest/staff
23. [ ] Accessibility & responsive: keyboard navigation, high-contrast; mobile/tablet/desktop ổn; touch targets đạt chuẩn
24. [ ] Xử lý lỗi & offline: thông báo lỗi mạng, retry; fallback khi Vapi/OpenAI lỗi; UI không crash
25. [ ] Nhất quán dữ liệu: `callId` client/server khớp; `duration` đúng; persistence localStorage hợp lý
26. [ ] Bảo mật & riêng tư: HTTPS, CORS đúng; không log PII; tenant isolation mọi request
27. [ ] Hiệu năng: Summary có dữ liệu < 5–8s; transcript latency < ~300ms; không rò rỉ bộ nhớ sau nhiều vòng gọi
28. [ ] Analytics & logs: audit start/end call, submit/cancel, đổi trạng thái; metrics tăng đúng
29. [ ] Edge cases: đổi ngôn ngữ trước call OK, trong call bị khóa; nhiều dịch vụ trong một cuộc gọi; kết thúc đột ngột vẫn có Summary

Ghi chú:

- Endpoint cấu hình Vapi theo ngôn ngữ: `GET /api/vapi/config/:language` (dùng chung `VITE_VAPI_PUBLIC_KEY`, `assistantId` theo ngôn ngữ).
- Kiểm thử đa ngôn ngữ: en, fr, ko, vi, zh, ru.
