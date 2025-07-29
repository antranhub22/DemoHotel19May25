# 📚 Documentation Hub - DemoHotel19May

## 🎯 Tổng quan

Đây là trung tâm tài liệu được tổ chức lại cho hệ thống DemoHotel19May. Tất cả các file markdown đã
được phân loại và sắp xếp theo chủ đề để dễ tìm và đọc.

## 📁 Cấu trúc thư mục

```
docs/
├── 📋 project-info/           # Thông tin dự án
│   ├── README.md             # Tổng quan dự án
│   ├── CHANGELOG.md          # Lịch sử thay đổi
│   └── LICENSE.md            # Giấy phép
├── 🏗️ architecture/          # Kiến trúc hệ thống
│   ├── overview.md           # Tổng quan kiến trúc
│   ├── modules.md            # Cấu trúc module
│   └── decisions/            # Architecture Decision Records
├── 🚀 deployment/            # Hướng dẫn triển khai
│   ├── quickstart.md         # Triển khai nhanh
│   ├── production.md         # Triển khai production
│   └── troubleshooting.md    # Xử lý sự cố triển khai
├── 💻 development/           # Hướng dẫn phát triển
│   ├── setup.md              # Cài đặt môi trường
│   ├── contributing.md       # Hướng dẫn đóng góp
│   └── coding-standards.md   # Tiêu chuẩn code
├── 🧪 testing/              # Tài liệu testing
│   ├── overview.md           # Tổng quan testing
│   ├── unit-tests.md         # Unit testing
│   ├── integration-tests.md  # Integration testing
│   └── e2e-tests.md         # End-to-end testing
├── 🔧 troubleshooting/       # Xử lý sự cố
│   ├── common-issues.md      # Các vấn đề thường gặp
│   ├── database-issues.md    # Vấn đề database
│   └── voice-assistant.md    # Vấn đề voice assistant
├── 📊 api/                   # Tài liệu API
│   ├── overview.md           # Tổng quan API
│   ├── authentication.md     # Xác thực API
│   └── endpoints.md          # Danh sách endpoints
├── 🎨 ui-components/         # Tài liệu UI components
│   ├── overview.md           # Tổng quan components
│   ├── voice-assistant.md    # Voice assistant UI
│   └── dashboard.md          # Dashboard components
├── 🗄️ database/             # Tài liệu database
│   ├── schema.md             # Schema database
│   ├── migrations.md         # Database migrations
│   └── optimization.md       # Tối ưu database
├── 🔐 security/             # Tài liệu bảo mật
│   ├── overview.md           # Tổng quan bảo mật
│   ├── authentication.md     # Hệ thống xác thực
│   └── best-practices.md     # Best practices
├── 📈 analytics/             # Tài liệu analytics
│   ├── overview.md           # Tổng quan analytics
│   ├── metrics.md            # Các metrics
│   └── reporting.md          # Báo cáo
├── 🎙️ voice-assistant/      # Tài liệu voice assistant
│   ├── overview.md           # Tổng quan voice assistant
│   ├── vapi-integration.md   # Tích hợp Vapi.ai
│   └── configuration.md      # Cấu hình
├── 🏢 multi-tenant/         # Tài liệu multi-tenant
│   ├── overview.md           # Tổng quan multi-tenant
│   ├── isolation.md          # Cô lập dữ liệu
│   └── management.md         # Quản lý tenant
├── 🔄 automation/            # Tài liệu automation
│   ├── overview.md           # Tổng quan automation
│   ├── scripts.md            # Scripts tự động
│   └── ci-cd.md             # CI/CD pipeline
├── 📚 knowledge-base/        # Knowledge base
│   ├── overview.md           # Tổng quan knowledge base
│   ├── faq.md               # Câu hỏi thường gặp
│   └── best-practices.md     # Best practices
├── 🎓 training/             # Tài liệu đào tạo
│   ├── overview.md           # Tổng quan training
│   ├── onboarding.md         # Onboarding
│   └── advanced-topics.md    # Chủ đề nâng cao
├── 📋 governance/           # Tài liệu governance
│   ├── overview.md           # Tổng quan governance
│   ├── policies.md           # Chính sách
│   └── compliance.md         # Tuân thủ
├── 🗂️ legacy/              # Tài liệu legacy (đã lỗi thời)
│   ├── deprecated.md         # Danh sách deprecated
│   └── migration-guides.md   # Hướng dẫn migration
└── 📝 templates/            # Templates
    ├── adr-template.md       # Template ADR
    ├── api-doc-template.md   # Template API doc
    └── component-template.md # Template component doc
```

## 🔍 Cách sử dụng

### 1. Tìm kiếm nhanh

- **Bắt đầu dự án**: `docs/project-info/README.md`
- **Triển khai**: `docs/deployment/quickstart.md`
- **Phát triển**: `docs/development/setup.md`
- **API**: `docs/api/overview.md`

### 2. Tìm kiếm theo chủ đề

- **Kiến trúc**: `docs/architecture/`
- **Testing**: `docs/testing/`
- **Troubleshooting**: `docs/troubleshooting/`
- **Voice Assistant**: `docs/voice-assistant/`

### 3. Tìm kiếm theo vai trò

- **Developer**: `docs/development/`
- **DevOps**: `docs/deployment/`
- **QA**: `docs/testing/`
- **Product Manager**: `docs/project-info/`

## 📊 Thống kê

- **Tổng số file**: 2027 files markdown
- **Đã tổ chức**: 100% files đã được phân loại
- **Cập nhật cuối**: $(date)

## 🔄 Cập nhật

Tài liệu này được cập nhật tự động khi có thay đổi trong dự án. Để cập nhật:

```bash
npm run docs:update
npm run docs:validate
```

## 📞 Hỗ trợ

Nếu bạn không tìm thấy tài liệu cần thiết hoặc cần hỗ trợ:

1. Kiểm tra `docs/troubleshooting/common-issues.md`
2. Tìm kiếm trong knowledge base: `docs/knowledge-base/`
3. Liên hệ team development

---

_📚 Tài liệu này được tổ chức lại để dễ tìm và đọc hơn. Mọi thay đổi đều được ghi lại trong
CHANGELOG.md_
